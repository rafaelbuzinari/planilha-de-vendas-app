import { useState } from 'react'
import { Info, Trash2 } from 'lucide-react'
import { Botao } from '../ui/Botao'
import { Campo, EntradaDinheiro, estiloEntrada } from '../ui/Campo'
import { Chips } from '../ui/Chips'
import { Confirmar } from '../ui/Confirmar'
import { Modal } from '../ui/Modal'
import { useAvisos } from '../ui/Avisos'
import { db } from '../../lib/db'
import { deCampoData, paraCampoData } from '../../lib/datas'
import { atualizarRegistro, criarRegistro, excluirRegistro } from '../../lib/registros'
import { tiposInvestimento } from '../../lib/rotulos'
import type { Investimento, TipoInvestimento } from '../../types/investimento'

interface Props {
  investimento?: Investimento
  aoFechar: () => void
}

export function FormularioInvestimento({ investimento, aoFechar }: Props) {
  const avisar = useAvisos()
  const [descricao, setDescricao] = useState(investimento?.descricao ?? '')
  const [tipo, setTipo] = useState<TipoInvestimento>(investimento?.tipo ?? 'estoque')
  const [valor, setValor] = useState(investimento?.valor ?? 0)
  const [dia, setDia] = useState(paraCampoData(investimento?.data ?? new Date()))
  const [erros, setErros] = useState<{ descricao?: string; valor?: string }>({})
  const [salvando, setSalvando] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)

  async function salvar() {
    const novosErros: typeof erros = {}
    if (!descricao.trim()) novosErros.descricao = 'Descreva o investimento'
    if (valor <= 0) novosErros.valor = 'Informe o valor'
    setErros(novosErros)
    if (Object.keys(novosErros).length) return

    const dados = { descricao: descricao.trim(), tipo, valor, data: deCampoData(dia, investimento?.data ?? new Date()).toISOString() }
    setSalvando(true)
    try {
      if (investimento) await atualizarRegistro(db.investimentos, investimento.id, dados)
      else await criarRegistro(db.investimentos, dados)
      avisar(investimento ? 'Investimento atualizado' : 'Investimento registrado')
      aoFechar()
    } catch {
      avisar('Não foi possível salvar', 'erro')
      setSalvando(false)
    }
  }

  async function excluir() {
    if (!investimento) return
    await excluirRegistro(db.investimentos, investimento.id)
    avisar('Investimento excluído')
    aoFechar()
  }

  return (
    <>
      <Modal
        titulo={investimento ? 'Editar investimento' : 'Novo investimento'}
        aberto
        aoFechar={aoFechar}
        rodape={
          <>
            {investimento && (
              <Botao variante="fantasma" onClick={() => setConfirmandoExclusao(true)} aria-label="Excluir investimento" className="px-3 text-negativo hover:text-negativo">
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
            <span className="text-sm font-medium">Tipo</span>
            <Chips rotuloAcessivel="Tipo de investimento" opcoes={tiposInvestimento} valor={tipo} aoMudar={setTipo} />
          </div>

          {tipo === 'estoque' && (
            <div className="flex gap-2.5 rounded-cartao bg-primaria/10 px-3.5 py-3 text-sm text-texto">
              <Info size={18} className="mt-0.5 shrink-0 text-primaria" />
              <span>Compras de mercadoria lançadas aqui não devem ser lançadas também em Despesas, para não contar duas vezes.</span>
            </div>
          )}

          <Campo rotulo="Descrição" erro={erros.descricao}>
            <input
              className={estiloEntrada}
              value={descricao}
              onChange={(e) => {
                setDescricao(e.target.value)
                setErros((a) => ({ ...a, descricao: undefined }))
              }}
              placeholder="Ex: Primeiro lote de kits"
              autoFocus={!investimento}
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

          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <Confirmar
        aberto={confirmandoExclusao}
        titulo="Excluir investimento?"
        mensagem={`"${investimento?.descricao}" será apagado de vez.`}
        textoConfirmar="Excluir"
        aoConfirmar={excluir}
        aoCancelar={() => setConfirmandoExclusao(false)}
      />
    </>
  )
}
