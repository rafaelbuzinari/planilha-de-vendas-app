import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Minus, Package, Plus, Search, Trash2 } from 'lucide-react'
import { Botao } from '../ui/Botao'
import { Campo, EntradaDinheiro, estiloEntrada } from '../ui/Campo'
import { Modal } from '../ui/Modal'
import { Confirmar } from '../ui/Confirmar'
import { Segmentado } from '../ui/Segmentado'
import { useAvisos } from '../ui/Avisos'
import { useConfiguracoes } from '../../hooks/useConfiguracoes'
import { db } from '../../lib/db'
import { calcularVenda } from '../../lib/calculos'
import { deCampoData, paraCampoData } from '../../lib/datas'
import { formatarPorcentagem, formatarReais } from '../../lib/dinheiro'
import { formasPagamento, rotuloStatus } from '../../lib/pagamentos'
import { normalizarBusca, ordenarPorNome } from '../../lib/produtos'
import { excluirVenda, salvarVenda } from '../../lib/vendas'
import type { FormaPagamento, ItemVenda, StatusVenda, Venda } from '../../types/venda'

interface Props {
  /** venda a editar; sem ela, é uma venda nova */
  venda?: Venda
  /** clientes de vendas anteriores, para sugerir enquanto digita */
  clientes: string[]
  aoFechar: () => void
}

const CHAVE_ULTIMA_FORMA = 'ultimaFormaPagamento'

function ultimaFormaUsada(): FormaPagamento {
  try {
    const salva = localStorage.getItem(CHAVE_ULTIMA_FORMA)
    if (formasPagamento.some((f) => f.valor === salva)) return salva as FormaPagamento
  } catch {
    // sem armazenamento: usa o padrão
  }
  return 'pix'
}

const estilosStatusAtivo: Record<StatusVenda, string> = {
  pago: 'border-positivo bg-positivo text-white',
  pendente: 'border-pendente bg-pendente text-white',
  cancelado: 'border-negativo bg-negativo text-white',
}

export function FormularioVenda({ venda, clientes, aoFechar }: Props) {
  const avisar = useAvisos()
  const config = useConfiguracoes()
  const produtos = useLiveQuery(() => db.produtos.toArray().then(ordenarPorNome))

  const [itens, setItens] = useState<ItemVenda[]>(venda?.itens ?? [])
  const [desconto, setDesconto] = useState(venda?.desconto ?? 0)
  const [forma, setForma] = useState<FormaPagamento>(venda?.formaPagamento ?? ultimaFormaUsada)
  const [status, setStatus] = useState<StatusVenda>(venda?.status ?? 'pago')
  const [cliente, setCliente] = useState(venda?.cliente ?? '')
  const [dia, setDia] = useState(paraCampoData(venda?.data ?? new Date()))
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [confirmar, setConfirmar] = useState<null | 'cancelar' | 'excluir'>(null)

  // editando sem trocar a forma de pagamento: mantém a taxa da época da venda
  const taxaPercentual = venda && forma === venda.formaPagamento ? venda.taxaPercentual : config.taxas[forma]
  const totais = calcularVenda(itens, desconto, taxaPercentual)

  /** estoque disponível = estoque atual + o que esta própria venda já tinha tirado */
  const disponivel = (produtoId: string) => {
    const produto = produtos?.find((p) => p.id === produtoId)
    if (!produto) return null
    const jaReservado = venda && venda.status !== 'cancelado' ? venda.itens.filter((i) => i.produtoId === produtoId).reduce((s, i) => s + i.quantidade, 0) : 0
    return produto.estoque + jaReservado
  }

  const produtosVisiveis = useMemo(() => {
    const termo = normalizarBusca(busca)
    return (produtos ?? []).filter((p) => !termo || normalizarBusca(`${p.nome} ${p.categoria}`).includes(termo))
  }, [produtos, busca])

  function adicionar(produtoId: string) {
    const produto = produtos?.find((p) => p.id === produtoId)
    if (!produto) return
    setErro('')
    setItens((atuais) => {
      const existente = atuais.find((i) => i.produtoId === produtoId)
      if (existente) return atuais.map((i) => (i.produtoId === produtoId ? { ...i, quantidade: i.quantidade + 1 } : i))
      return [...atuais, { produtoId, nome: produto.nome, quantidade: 1, precoUnitario: produto.preco, custoUnitario: produto.custo }]
    })
  }

  function mudarQuantidade(produtoId: string, delta: number) {
    setItens((atuais) =>
      atuais.map((i) => (i.produtoId === produtoId ? { ...i, quantidade: i.quantidade + delta } : i)).filter((i) => i.quantidade > 0),
    )
  }

  function tentarSalvar() {
    if (itens.length === 0) return setErro('Adicione pelo menos um produto')
    if (desconto > totais.subtotal) return setErro('O desconto é maior que o valor dos produtos')
    if (venda && venda.status !== 'cancelado' && status === 'cancelado') return setConfirmar('cancelar')
    salvar()
  }

  async function salvar() {
    setConfirmar(null)
    setSalvando(true)
    try {
      await salvarVenda(
        { data: deCampoData(dia, venda?.data ?? new Date()).toISOString(), cliente, itens, desconto, formaPagamento: forma, status, taxaPercentual },
        venda?.id,
      )
      try {
        localStorage.setItem(CHAVE_ULTIMA_FORMA, forma)
      } catch {
        // sem armazenamento: só não lembra a forma da próxima vez
      }
      avisar(venda ? (status === 'cancelado' && venda.status !== 'cancelado' ? 'Venda cancelada' : 'Venda atualizada') : 'Venda registrada')
      aoFechar()
    } catch {
      avisar('Não foi possível salvar a venda', 'erro')
      setSalvando(false)
    }
  }

  async function excluir() {
    if (!venda) return
    await excluirVenda(venda.id)
    avisar('Venda excluída')
    aoFechar()
  }

  const quantidadeNoCarrinho = (produtoId: string) => itens.find((i) => i.produtoId === produtoId)?.quantidade ?? 0

  return (
    <>
      <Modal
        titulo={venda ? 'Editar venda' : 'Nova venda'}
        aberto
        aoFechar={aoFechar}
        rodape={
          <div className="flex w-full items-center gap-3">
            {venda && (
              <Botao variante="fantasma" onClick={() => setConfirmar('excluir')} aria-label="Excluir venda" className="px-3 text-negativo hover:text-negativo">
                <Trash2 size={18} />
              </Botao>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs text-suave">Total</div>
              <div className="text-xl leading-tight font-bold">{formatarReais(totais.total)}</div>
            </div>
            <Botao className="px-6 py-3" onClick={tentarSalvar} disabled={salvando}>
              {venda ? 'Salvar' : 'Registrar venda'}
            </Botao>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          {/* Escolher produtos */}
          <section className="flex flex-col gap-3">
            {produtos && produtos.length === 0 ? (
              <div className="rounded-cartao bg-fundo px-4 py-5 text-center text-sm text-suave">
                Você ainda não tem produtos.{' '}
                <Link to="/produtos" onClick={aoFechar} className="font-semibold text-primaria">
                  Cadastrar produtos
                </Link>
              </div>
            ) : (
              <>
                {(produtos?.length ?? 0) > 6 && (
                  <div className="relative">
                    <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-suave" />
                    <input type="search" className={`${estiloEntrada} pl-10`} placeholder="Buscar produto" value={busca} onChange={(e) => setBusca(e.target.value)} />
                  </div>
                )}
                <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto">
                  {produtosVisiveis.map((p) => {
                    const qtd = quantidadeNoCarrinho(p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => adicionar(p.id)}
                        className={`relative flex items-center gap-2.5 rounded-cartao border p-2.5 text-left transition active:scale-[0.97] ${
                          qtd ? 'border-primaria bg-primaria/5' : 'border-borda hover:border-primaria/40'
                        }`}
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-fundo text-suave">
                          {p.foto ? <img src={p.foto} alt="" className="size-full object-cover" /> : <Package size={18} />}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{p.nome}</div>
                          <div className="text-xs text-suave">{formatarReais(p.preco)}</div>
                        </div>
                        {qtd > 0 && (
                          <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-primaria text-xs font-bold text-white">
                            {qtd}
                          </span>
                        )}
                      </button>
                    )
                  })}
                  {produtosVisiveis.length === 0 && <p className="col-span-2 py-4 text-center text-sm text-suave">Nenhum produto encontrado.</p>}
                </div>
              </>
            )}
          </section>

          {/* Itens da venda */}
          {itens.length > 0 && (
            <section className="flex flex-col divide-y divide-borda rounded-cartao border border-borda">
              {itens.map((item) => {
                const estoque = disponivel(item.produtoId)
                const faltando = estoque !== null && item.quantidade > estoque
                return (
                  <div key={item.produtoId} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{item.nome}</div>
                      <div className={`text-xs ${faltando ? 'text-amber-700 dark:text-pendente' : 'text-suave'}`}>
                        {faltando ? `Só ${Math.max(0, estoque)} em estoque` : `${formatarReais(item.precoUnitario)} cada`}
                      </div>
                    </div>
                    <div className="flex items-center rounded-full border border-borda">
                      <button type="button" onClick={() => mudarQuantidade(item.produtoId, -1)} className="flex size-9 items-center justify-center text-suave hover:text-texto" aria-label="Diminuir">
                        <Minus size={16} />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{item.quantidade}</span>
                      <button type="button" onClick={() => mudarQuantidade(item.produtoId, 1)} className="flex size-9 items-center justify-center text-suave hover:text-texto" aria-label="Aumentar">
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="w-20 text-right text-sm font-semibold">{formatarReais(item.quantidade * item.precoUnitario)}</div>
                  </div>
                )
              })}
            </section>
          )}

          {erro && <p className="-mt-3 text-sm text-negativo">{erro}</p>}

          {/* Pagamento */}
          <section className="flex flex-col gap-2">
            <span className="text-sm font-medium">Forma de pagamento</span>
            <Segmentado
              rotuloAcessivel="Forma de pagamento"
              valor={forma}
              aoMudar={setForma}
              opcoes={formasPagamento.map(({ valor, rotulo, icone: Icone }) => ({
                valor,
                rotulo: (
                  <>
                    <Icone size={18} />
                    <span className="text-xs">{rotulo}</span>
                  </>
                ),
              }))}
            />
          </section>

          <section className="flex flex-col gap-2">
            <span className="text-sm font-medium">Situação</span>
            <Segmentado
              rotuloAcessivel="Situação da venda"
              valor={status}
              aoMudar={setStatus}
              opcoes={(venda ? (['pago', 'pendente', 'cancelado'] as const) : (['pago', 'pendente'] as const)).map((s) => ({
                valor: s,
                rotulo: rotuloStatus[s],
                estiloAtivo: estilosStatusAtivo[s],
              }))}
            />
          </section>

          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Desconto">
              <EntradaDinheiro centavos={desconto} aoMudar={setDesconto} />
            </Campo>
            <Campo rotulo="Data">
              <input type="date" className={estiloEntrada} value={dia} onChange={(e) => e.target.value && setDia(e.target.value)} />
            </Campo>
          </div>

          <Campo rotulo="Cliente" dica="Opcional">
            <input className={estiloEntrada} value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nome do cliente" list="lista-clientes" maxLength={60} />
            <datalist id="lista-clientes">
              {clientes.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Campo>

          {/* Resumo calculado */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-cartao bg-fundo px-4 py-3 text-sm">
            <dt className="text-suave">Produtos</dt>
            <dd className="text-right">{formatarReais(totais.subtotal)}</dd>
            {desconto > 0 && (
              <>
                <dt className="text-suave">Desconto</dt>
                <dd className="text-right">− {formatarReais(desconto)}</dd>
              </>
            )}
            <dt className="text-suave">Custo dos produtos</dt>
            <dd className="text-right">− {formatarReais(totais.custo)}</dd>
            <dt className="text-suave">Taxa {taxaPercentual > 0 && `(${formatarPorcentagem(taxaPercentual, 2)})`}</dt>
            <dd className="text-right">− {formatarReais(totais.taxa)}</dd>
            <dt className="border-t border-borda pt-2 font-semibold">Lucro</dt>
            <dd className={`border-t border-borda pt-2 text-right font-semibold ${totais.lucro < 0 ? 'text-negativo' : ''}`}>{formatarReais(totais.lucro)}</dd>
          </dl>
        </div>
      </Modal>

      <Confirmar
        aberto={confirmar === 'cancelar'}
        titulo="Cancelar venda?"
        mensagem="Os produtos voltam para o estoque e a venda deixa de contar nos totais."
        textoConfirmar="Cancelar venda"
        aoConfirmar={salvar}
        aoCancelar={() => setConfirmar(null)}
      />
      <Confirmar
        aberto={confirmar === 'excluir'}
        titulo="Excluir venda?"
        mensagem="A venda será apagada de vez e os produtos voltam para o estoque. Não dá para desfazer."
        textoConfirmar="Excluir"
        aoConfirmar={excluir}
        aoCancelar={() => setConfirmar(null)}
      />
    </>
  )
}
