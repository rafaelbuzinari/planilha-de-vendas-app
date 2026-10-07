import { useRef, useState } from 'react'
import { Camera, ImageOff, Trash2 } from 'lucide-react'
import { Botao } from '../ui/Botao'
import { Campo, EntradaDinheiro, EntradaNumero, estiloEntrada } from '../ui/Campo'
import { Modal } from '../ui/Modal'
import { Confirmar } from '../ui/Confirmar'
import { useAvisos } from '../ui/Avisos'
import { lucroPorUnidade, margemPercentual } from '../../lib/calculos'
import { formatarPorcentagem, formatarReais } from '../../lib/dinheiro'
import { reduzirFoto } from '../../lib/foto'
import { atualizarProduto, criarProduto, excluirProduto } from '../../lib/produtos'
import type { DadosProduto, Produto } from '../../types/produto'

interface Props {
  /** produto a editar; sem ele, é um cadastro novo */
  produto?: Produto
  categorias: string[]
  aoFechar: () => void
}

const vazio: DadosProduto = { nome: '', categoria: '', custo: 0, preco: 0, estoque: 0, estoqueMinimo: 0 }

export function FormularioProduto({ produto, categorias, aoFechar }: Props) {
  const avisar = useAvisos()
  const [dados, setDados] = useState<DadosProduto>(() => {
    if (!produto) return vazio
    const { id: _id, criadoEm: _c, atualizadoEm: _a, ...resto } = produto
    return resto
  })
  const [erros, setErros] = useState<{ nome?: string; preco?: string }>({})
  const [salvando, setSalvando] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const entradaFoto = useRef<HTMLInputElement>(null)

  const mudar = <K extends keyof DadosProduto>(campo: K, valor: DadosProduto[K]) => {
    setDados((atual) => ({ ...atual, [campo]: valor }))
    if (campo in erros) setErros((atual) => ({ ...atual, [campo]: undefined }))
  }

  const margem = margemPercentual(dados.preco, dados.custo)
  const lucro = lucroPorUnidade(dados.preco, dados.custo)

  async function escolherFoto(arquivo?: File) {
    if (!arquivo) return
    try {
      mudar('foto', await reduzirFoto(arquivo))
    } catch {
      avisar('Não foi possível usar essa foto', 'erro')
    }
  }

  async function salvar() {
    const novosErros: typeof erros = {}
    if (!dados.nome.trim()) novosErros.nome = 'Dê um nome ao produto'
    if (dados.preco <= 0) novosErros.preco = 'Informe o preço de venda'
    setErros(novosErros)
    if (Object.keys(novosErros).length) return

    const limpos = { ...dados, nome: dados.nome.trim(), categoria: dados.categoria.trim() }
    setSalvando(true)
    try {
      if (produto) await atualizarProduto(produto.id, limpos)
      else await criarProduto(limpos)
      avisar(produto ? 'Produto atualizado' : 'Produto cadastrado')
      aoFechar()
    } catch {
      avisar('Não foi possível salvar', 'erro')
      setSalvando(false)
    }
  }

  async function excluir() {
    if (!produto) return
    await excluirProduto(produto.id)
    avisar('Produto excluído')
    aoFechar()
  }

  return (
    <>
      <Modal
        titulo={produto ? 'Editar produto' : 'Novo produto'}
        aberto
        aoFechar={aoFechar}
        rodape={
          <>
            {produto && (
              <Botao variante="fantasma" onClick={() => setConfirmandoExclusao(true)} aria-label="Excluir produto" className="px-3 text-negativo hover:text-negativo">
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
          {/* Foto */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => entradaFoto.current?.click()}
              className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-cartao border-2 border-dashed border-borda bg-fundo text-suave transition hover:border-primaria hover:text-primaria"
              aria-label="Escolher foto"
            >
              {dados.foto ? <img src={dados.foto} alt="" className="size-full object-cover" /> : <Camera size={26} />}
            </button>
            <div className="flex flex-col items-start gap-1">
              <button type="button" onClick={() => entradaFoto.current?.click()} className="text-sm font-semibold text-primaria">
                {dados.foto ? 'Trocar foto' : 'Adicionar foto'}
              </button>
              {dados.foto ? (
                <button type="button" onClick={() => mudar('foto', undefined)} className="inline-flex items-center gap-1 text-sm text-suave hover:text-texto">
                  <ImageOff size={14} /> Remover
                </button>
              ) : (
                <span className="text-xs text-suave">Opcional</span>
              )}
            </div>
            <input
              ref={entradaFoto}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                escolherFoto(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </div>

          <Campo rotulo="Nome" erro={erros.nome}>
            <input
              className={estiloEntrada}
              value={dados.nome}
              onChange={(e) => mudar('nome', e.target.value)}
              placeholder="Ex: Kit Fini 100g"
              autoFocus={!produto}
              maxLength={80}
            />
          </Campo>

          <Campo rotulo="Categoria" dica="Opcional — ajuda a organizar a lista">
            <input
              className={estiloEntrada}
              value={dados.categoria}
              onChange={(e) => mudar('categoria', e.target.value)}
              placeholder="Ex: Doces"
              list="lista-categorias"
              maxLength={40}
            />
            <datalist id="lista-categorias">
              {categorias.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Campo>

          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Custo" dica="Quanto você paga">
              <EntradaDinheiro centavos={dados.custo} aoMudar={(v) => mudar('custo', v)} />
            </Campo>
            <Campo rotulo="Preço de venda" erro={erros.preco}>
              <EntradaDinheiro centavos={dados.preco} aoMudar={(v) => mudar('preco', v)} />
            </Campo>
          </div>

          {/* Margem calculada na hora */}
          <div className="flex items-center justify-between rounded-cartao bg-fundo px-4 py-3">
            <div>
              <div className="text-xs text-suave">Margem</div>
              <div className={`text-lg font-semibold ${margem !== null && margem < 0 ? 'text-negativo' : ''}`}>
                {margem === null ? '—' : formatarPorcentagem(margem)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-suave">Lucro por unidade</div>
              <div className={`text-lg font-semibold ${lucro < 0 ? 'text-negativo' : ''}`}>
                {dados.preco > 0 ? formatarReais(lucro) : '—'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Estoque atual" dica="Unidades">
              <EntradaNumero valor={dados.estoque} aoMudar={(v) => mudar('estoque', v)} />
            </Campo>
            <Campo rotulo="Estoque mínimo" dica="Avisa para repor abaixo disso">
              <EntradaNumero valor={dados.estoqueMinimo} aoMudar={(v) => mudar('estoqueMinimo', v)} />
            </Campo>
          </div>

          {/* permite salvar com Enter no teclado */}
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <Confirmar
        aberto={confirmandoExclusao}
        titulo="Excluir produto?"
        mensagem={`"${produto?.nome}" será removido do catálogo. As vendas já registradas não mudam.`}
        textoConfirmar="Excluir"
        aoConfirmar={excluir}
        aoCancelar={() => setConfirmandoExclusao(false)}
      />
    </>
  )
}
