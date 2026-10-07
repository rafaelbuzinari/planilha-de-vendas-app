import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Search, ShoppingCart } from 'lucide-react'
import { Pagina } from '../components/Pagina'
import { TelaVazia } from '../components/TelaVazia'
import { Botao } from '../components/ui/Botao'
import { estiloEntrada } from '../components/ui/Campo'
import { CartaoResumo } from '../components/ui/CartaoResumo'
import { DatasPersonalizadas, SelectPeriodo } from '../components/FiltroPeriodo'
import { FormularioVenda } from '../components/vendas/FormularioVenda'
import { LinhaVenda } from '../components/vendas/LinhaVenda'
import { db } from '../lib/db'
import { inicioDoDia, rotuloDoDia } from '../lib/datas'
import { formatarReais } from '../lib/dinheiro'
import { formasPagamento, rotuloStatus } from '../lib/pagamentos'
import { dentroDoIntervalo } from '../lib/periodo'
import { usePeriodo } from '../hooks/usePeriodo'
import { normalizarBusca } from '../lib/produtos'
import type { FormaPagamento, StatusVenda, Venda } from '../types/venda'

/** null = fechado; 'nova' = nova venda; Venda = edição */
type Formulario = null | 'nova' | Venda

export function Vendas() {
  const vendas = useLiveQuery(() => db.vendas.orderBy('data').reverse().toArray())
  const [formulario, setFormulario] = useState<Formulario>(null)

  const [busca, setBusca] = useState('')
  const periodo = usePeriodo('mes')
  const { intervalo } = periodo
  const [pagamento, setPagamento] = useState<'' | FormaPagamento>('')
  const [status, setStatus] = useState<'' | StatusVenda>('')

  const clientes = useMemo(
    () => [...new Set((vendas ?? []).map((v) => v.cliente).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [vendas],
  )

  const filtradas = useMemo(() => {
    const termo = normalizarBusca(busca)
    return (vendas ?? []).filter(
      (v) =>
        dentroDoIntervalo(v.data, intervalo) &&
        (!pagamento || v.formaPagamento === pagamento) &&
        (!status || v.status === status) &&
        (!termo || normalizarBusca(`${v.cliente} ${v.itens.map((i) => i.nome).join(' ')}`).includes(termo)),
    )
  }, [vendas, busca, intervalo, pagamento, status])

  // vendas canceladas não entram em nenhum total; pendentes ficam separadas ("a receber")
  const resumo = useMemo(() => {
    const validas = filtradas.filter((v) => v.status !== 'cancelado')
    const soma = (lista: Venda[]) => lista.reduce((s, v) => s + v.total, 0)
    return {
      recebido: soma(validas.filter((v) => v.status === 'pago')),
      aReceber: soma(validas.filter((v) => v.status === 'pendente')),
      quantidade: validas.length,
    }
  }, [filtradas])

  // agrupa por dia: "Hoje", "Ontem", "05/10/2026"...
  const dias = useMemo(() => {
    const grupos = new Map<number, Venda[]>()
    for (const v of filtradas) {
      const chave = inicioDoDia(new Date(v.data)).getTime()
      grupos.set(chave, [...(grupos.get(chave) ?? []), v])
    }
    return [...grupos.entries()].map(([chave, lista]) => ({
      rotulo: rotuloDoDia(new Date(chave)),
      total: lista.filter((v) => v.status !== 'cancelado').reduce((s, v) => s + v.total, 0),
      vendas: lista,
    }))
  }, [filtradas])

  const abrirNova = () => setFormulario('nova')

  if (vendas === undefined) return null

  return (
    <Pagina
      titulo="Vendas"
      descricao="Registre e acompanhe suas vendas"
      acoes={
        <Botao onClick={abrirNova} className="hidden md:inline-flex">
          <Plus size={18} /> Nova venda
        </Botao>
      }
    >
      {vendas.length === 0 ? (
        <TelaVazia
          icone={ShoppingCart}
          titulo="Registre sua primeira venda"
          texto="Escolha os produtos, a forma de pagamento e pronto: o app calcula total, taxa e lucro sozinho."
          acao={
            <Botao onClick={abrirNova}>
              <Plus size={18} /> Nova venda
            </Botao>
          }
        />
      ) : (
        <>
          {/* Resumo do período filtrado */}
          <div className="grid grid-cols-3 gap-3">
            <CartaoResumo rotulo="Recebido" valor={formatarReais(resumo.recebido)} />
            <CartaoResumo rotulo="A receber" valor={formatarReais(resumo.aReceber)} destaque={resumo.aReceber > 0 ? 'text-amber-700 dark:text-pendente' : ''} />
            <CartaoResumo rotulo="Vendas" valor={String(resumo.quantidade)} />
          </div>

          {/* Filtros */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-suave" />
              <input type="search" className={`${estiloEntrada} pl-10`} placeholder="Buscar cliente ou produto" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <SelectPeriodo estado={periodo} />
              <select className={`${estiloEntrada} px-2.5 text-sm`} value={pagamento} onChange={(e) => setPagamento(e.target.value as '' | FormaPagamento)} aria-label="Forma de pagamento">
                <option value="">Pagamento</option>
                {formasPagamento.map((f) => (
                  <option key={f.valor} value={f.valor}>
                    {f.rotulo}
                  </option>
                ))}
              </select>
              <select className={`${estiloEntrada} px-2.5 text-sm`} value={status} onChange={(e) => setStatus(e.target.value as '' | StatusVenda)} aria-label="Situação">
                <option value="">Situação</option>
                {(Object.keys(rotuloStatus) as StatusVenda[]).map((s) => (
                  <option key={s} value={s}>
                    {rotuloStatus[s]}
                  </option>
                ))}
              </select>
            </div>
            <DatasPersonalizadas estado={periodo} />
          </div>

          {/* Lista agrupada por dia */}
          {dias.length === 0 ? (
            <p className="py-10 text-center text-suave">Nenhuma venda encontrada com esses filtros.</p>
          ) : (
            <div className="flex flex-col gap-5">
              {dias.map((dia) => (
                <section key={dia.rotulo} className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between px-1">
                    <h2 className="text-sm font-semibold text-suave">{dia.rotulo}</h2>
                    <span className="text-sm text-suave">{formatarReais(dia.total)}</span>
                  </div>
                  <div className="divide-y divide-borda overflow-hidden rounded-cartao border border-borda bg-cartao shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:shadow-none">
                    {dia.vendas.map((v) => (
                      <LinhaVenda key={v.id} venda={v} aoAbrir={() => setFormulario(v)} />
                    ))}
                  </div>
                </section>
              ))}
              {/* espaço para o botão flutuante não cobrir a última venda no celular */}
              <div className="h-14 md:hidden" />
            </div>
          )}
        </>
      )}

      {/* Botão flutuante de Nova venda — celular */}
      {vendas.length > 0 && (
        <button
          type="button"
          onClick={abrirNova}
          className="fixed right-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-20 flex items-center gap-2 rounded-full bg-primaria py-3.5 pr-5 pl-4 font-semibold text-white shadow-lg shadow-primaria/30 transition active:scale-95 md:hidden"
        >
          <Plus size={20} /> Nova venda
        </button>
      )}

      {formulario && (
        <FormularioVenda
          key={formulario === 'nova' ? 'nova' : formulario.id}
          venda={formulario === 'nova' ? undefined : formulario}
          clientes={clientes}
          aoFechar={() => setFormulario(null)}
        />
      )}
    </Pagina>
  )
}
