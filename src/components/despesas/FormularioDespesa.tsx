import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Botao } from '../ui/Botao'
import { Campo, EntradaDinheiro, estiloEntrada } from '../ui/Campo'
import { Chips } from '../ui/Chips'
import { Confirmar } from '../ui/Confirmar'
import { Modal } from '../ui/Modal'
import { Segmentado } from '../ui/Segmentado'
import { useAvisos } from '../ui/Avisos'
import { db } from '../../lib/db'
import { deCampoData, paraCampoData } from '../../lib/datas'
import { atualizarRegistro, criarRegistro, excluirRegistro } from '../../lib/registros'
import { categoriasDespesa } from '../../lib/rotulos'
import type { CategoriaDespesa, Despesa } from '../../types/despesa'

interface Props {
  despesa?: Despesa
  aoFechar: () => void
}

export function FormularioDespesa({ despesa, aoFechar }: Props) {
  const avisar = useAvisos()
  const [descricao, setDescricao] = useState(despesa?.descricao ?? '')
  const [categoria, setCategoria] = useState<CategoriaDespesa>(despesa?.categoria ?? 'transporte')
  const [valor, setValor] = useState(despesa?.valor ?? 0)
  const [dia, setDia] = useState(paraCampoData(despesa?.data ?? new Date()))
  const [fixa, setFixa] = useState(despesa?.fixa ?? false)
  const [paga, setPaga] = useState(despesa?.paga ?? true)
  const [erros, setErros] = useState<{ descricao?: string; valor?: string }>({})
  const [salvando, setSalvando] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)

  async function salvar() {
    const novosErros: typeof erros = {}
    if (!descricao.trim()) novosErros.descricao = 'Descreva a despesa'
    if (valor <= 0) novosErros.valor = 'Informe o valor'
    setErros(novosErros)
    if (Object.keys(novosErros).length) return

    const dados = { descricao: descricao.trim(), categoria, valor, fixa, paga, data: deCampoData(dia, despesa?.data ?? new Date()).toISOString() }
    setSalvando(true)
    try {
      if (despesa) await atualizarRegistro(db.despesas, despesa.id, dados)
      else await criarRegistro(db.despesas, dados)
      avisar(despesa ? 'Despesa atualizada' : 'Despesa registrada')
      aoFechar()
    } catch {
      avisar('Não foi possível salvar', 'erro')
      setSalvando(false)
    }
  }

  async function excluir() {
    if (!despesa) return
    await excluirRegistro(db.despesas, despesa.id)
    avisar('Despesa excluída')
    aoFechar()
  }

  return (
    <>
      <Modal
        titulo={despesa ? 'Editar despesa' : 'Nova despesa'}
        aberto
        aoFechar={aoFechar}
        rodape={
          <>
            {despesa && (
              <Botao variante="fantasma" onClick={() => setConfirmandoExclusao(true)} aria-label="Excluir despesa" className="px-3 text-negativo hover:text-negativo">
                <Trash2 size={18} />
              </Botao>
            )}
            <Botao variante="secundaria" className="flex-1" onClick={aoFechar}>
              Cancelar
            </Botao>
            <Botao className="flex-1" onClick={salvar} disabled={salvando}>
              Salvar
            </Botao>
          </>
        }
      >
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            salvar()
          }}
        >
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Categoria</span>
            <Chips rotuloAcessivel="Categoria da despesa" opcoes={categoriasDespesa} valor={categoria} aoMudar={setCategoria} />
          </div>

          <Campo rotulo="Descrição" erro={erros.descricao}>
            <input
              className={estiloEntrada}
              value={descricao}
              onChange={(e) => {
                setDescricao(e.target.value)
                setErros((a) => ({ ...a, descricao: undefined }))
              }}
              placeholder="Ex: Ônibus para o centro"
              autoFocus={!despesa}
              maxLength={80}
            />
          </Campo>

          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Valor" erro={erros.valor}>
              <EntradaDinheiro
                centavos={valor}
                aoMudar={(v) => {
                  setValor(v)
                  setErros((a) => ({ ...a, valor: undefined }))
                }}
              />
            </Campo>
            <Campo rotulo="Data">
              <input type="date" className={estiloEntrada} value={dia} onChange={(e) => e.target.value && setDia(e.target.value)} />
            </Campo>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Tipo</span>
            <Segmentado
              rotuloAcessivel="Despesa fixa ou variável"
              valor={fixa ? 'fixa' : 'variavel'}
              aoMudar={(v) => setFixa(v === 'fixa')}
              opcoes={[
                { valor: 'variavel', rotulo: 'Variável' },
                { valor: 'fixa', rotulo: 'Fixa (todo mês)' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Já foi paga?</span>
            <Segmentado
              rotuloAcessivel="Despesa paga"
              valor={paga ? 'sim' : 'nao'}
              aoMudar={(v) => setPaga(v === 'sim')}
              opcoes={[
                { valor: 'sim', rotulo: 'Sim, paga', estiloAtivo: 'border-positivo bg-positivo text-white' },
                { valor: 'nao', rotulo: 'Não, a pagar', estiloAtivo: 'border-pendente bg-pendente text-white' },
              ]}
            />
          </div>

          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <Confirmar
        aberto={confirmandoExclusao}
        titulo="Excluir despesa?"
        mensagem={`"${despesa?.descricao}" será apagada de vez.`}
        textoConfirmar="Excluir"
        aoConfirmar={excluir}
        aoCancelar={() => setConfirmandoExclusao(false)}
      />
    </>
  )
}
