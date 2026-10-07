import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { FlaskConical, Package, ShoppingCart } from 'lucide-react'
import { Pagina } from '../components/Pagina'
import { DatasPersonalizadas, SelectPeriodo } from '../components/FiltroPeriodo'
import { Botao } from '../components/ui/Botao'
import { useAvisos } from '../components/ui/Avisos'
import { CartaoMetrica } from '../components/dashboard/CartaoMetrica'
import { GraficoFaturamento } from '../components/dashboard/GraficoFaturamento'
import { GraficoPagamentos } from '../components/dashboard/GraficoPagamentos'
import { TopProdutos } from '../components/dashboard/TopProdutos'
import { Alertas } from '../components/dashboard/Alertas'
import { MetaMensal } from '../components/dashboard/MetaMensal'
import { useConfiguracoes } from '../hooks/useConfiguracoes'
import { usePeriodo } from '../hooks/usePeriodo'
import { db } from '../lib/db'
import { substituirTudo } from '../lib/backup'
import { precisaRepor } from '../lib/calculos'
import { calcularMetricas, intervaloAnterior, porFormaPagamento, serieFaturamento, topProdutos, variacaoPercentual } from '../lib/dashboard'
import { formatarPorcentagem, formatarReais } from '../lib/dinheiro'
import { gerarDadosExemplo } from '../lib/exemplo'
import { lucroLiquido, retornoInvestimento, totalInvestido } from '../lib/financeiro'
import { intervaloDoPeriodo, rotulosPeriodo } from '../lib/periodo'
import { ordenarPorNome } from '../lib/produtos'

export function Dashboard() {
  const vendas = useLiveQuery(() => db.vendas.toArray())
  const despesas = useLiveQuery(() => db.despesas.toArray())
  const investimentos = useLiveQuery(() => db.investimentos.toArray())
  const produtos = useLiveQuery(() => db.produtos.toArray().then(ordenarPorNome))
  const config = useConfiguracoes()
  const periodo = usePeriodo('mes')
  const { intervalo } = periodo

  const painel = useMemo(() => {
    if (!vendas || !despesas || !investimentos) return null
    const anterior = intervaloAnterior(periodo.periodo, intervalo)
    const atual = calcularMetricas(vendas, despesas, investimentos, intervalo)
    const antes = anterior ? calcularMetricas(vendas, despesas, investimentos, anterior) : null
    const pendentes = vendas.filter((v) => v.status === 'pendente')
    const aPagar = despesas.filter((d) => !d.paga)
    return {
      atual,
      antes,
      // retorno usa tudo desde o início, independente do filtro
      retorno: retornoInvestimento(lucroLiquido(vendas, despesas), totalInvestido(investimentos)),
      faturadoNoMes: calcularMetricas(vendas, [], [], intervaloDoPeriodo('mes')).faturamento,
      serie: serieFaturamento(vendas, intervalo),
      porForma: porFormaPagamento(vendas, intervalo),
      top: topProdutos(vendas, intervalo),
      pendentes: { quantidade: pendentes.length, total: pendentes.reduce((s, v) => s + v.total, 0) },
      aPagar: { quantidade: aPagar.length, total: aPagar.reduce((s, d) => s + d.valor, 0) },
    }
  }, [vendas, despesas, investimentos, intervalo, periodo.periodo])

  if (!painel || !produtos) return null

  if (vendas!.length === 0) return <BoasVindas temProdutos={produtos.length > 0} />

  const { atual, antes } = painel
  const variacao = (chave: 'faturamento' | 'lucroLiquido' | 'numeroVendas' | 'investido') => (antes ? variacaoPercentual(atual[chave], antes[chave]) : null)
  const variacaoTicket = antes && atual.ticketMedio !== null && antes.ticketMedio !== null ? variacaoPercentual(atual.ticketMedio, antes.ticketMedio) : null
  const variacaoMargem = antes && atual.margem !== null && antes.margem !== null ? atual.margem - antes.margem : null

  return (
    <Pagina
      titulo="Início"
      descricao={`Resumo · ${rotulosPeriodo[periodo.periodo].toLowerCase()}`}
      acoes={
        <div className="w-full sm:w-48">
          <SelectPeriodo estado={periodo} />
        </div>
      }
    >
      <DatasPersonalizadas estado={periodo} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <CartaoMetrica rotulo="Faturamento" valor={formatarReais(atual.faturamento)} variacao={variacao('faturamento')} />
        <CartaoMetrica
          rotulo="Lucro líquido"
          valor={formatarReais(atual.lucroLiquido)}
          variacao={variacao('lucroLiquido')}
          destaqueValor={atual.lucroLiquido < 0 ? 'text-red-700 dark:text-negativo' : ''}
        />
        <CartaoMetrica rotulo="Margem" valor={atual.margem === null ? '—' : formatarPorcentagem(atual.margem)} variacao={variacaoMargem} unidadeVariacao="p.p." />
        <CartaoMetrica rotulo="Ticket médio" valor={atual.ticketMedio === null ? '—' : formatarReais(atual.ticketMedio)} variacao={variacaoTicket} />
        <CartaoMetrica rotulo="Vendas pagas" valor={String(atual.numeroVendas)} variacao={variacao('numeroVendas')} />
        <CartaoMetrica
          rotulo="A receber"
          valor={formatarReais(atual.aReceber)}
          nota={`${atual.vendasPendentes} ${atual.vendasPendentes === 1 ? 'venda pendente' : 'vendas pendentes'}`}
          destaqueValor={atual.aReceber > 0 ? 'text-amber-700 dark:text-pendente' : ''}
        />
        <CartaoMetrica rotulo="Investido" valor={formatarReais(atual.investido)} variacao={variacao('investido')} sentido="neutro" />
        <CartaoMetrica
          rotulo="Retorno do investimento"
          valor={painel.retorno === null ? '—' : formatarPorcentagem(painel.retorno, 0)}
          nota="desde o início"
        />
      </div>

      <MetaMensal meta={config.metaMensal} faturado={painel.faturadoNoMes} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <GraficoFaturamento pontos={painel.serie.pontos} agrupamento={painel.serie.agrupamento} />
        </div>
        <GraficoPagamentos totais={painel.porForma} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopProdutos produtos={painel.top} />
        <Alertas paraRepor={produtos.filter(precisaRepor)} vendasPendentes={painel.pendentes} despesasAPagar={painel.aPagar} />
      </div>
    </Pagina>
  )
}

/** Primeira vez no app: mostra o caminho e oferece dados de exemplo */
function BoasVindas({ temProdutos }: { temProdutos: boolean }) {
  const avisar = useAvisos()

  async function carregarExemplo() {
    await substituirTudo(gerarDadosExemplo())
    avisar('Dados de exemplo carregados')
  }

  return (
    <Pagina titulo="Bem-vindo! 👋" descricao="Vamos colocar seu negócio na palma da mão">
      <div className="grid gap-3 md:grid-cols-2">
        <Passo numero={1} feito={temProdutos} icone={<Package size={20} />} titulo="Cadastre seus produtos" texto="Nome, custo, preço e estoque." para="/produtos" />
        <Passo numero={2} feito={false} icone={<ShoppingCart size={20} />} titulo="Registre sua primeira venda" texto="Poucos toques e o app calcula tudo." para="/vendas" />
      </div>
      {!temProdutos && (
        <div className="flex flex-col items-start gap-3 rounded-cartao border border-dashed border-borda p-5">
          <div>
            <h2 className="font-semibold">Quer ver o app funcionando antes?</h2>
            <p className="mt-1 text-sm text-suave">Carregue dados de exemplo (2 meses de vendas de mentira). Depois é só apagar em Configurações.</p>
          </div>
          <Botao variante="secundaria" onClick={carregarExemplo}>
            <FlaskConical size={18} /> Carregar dados de exemplo
          </Botao>
        </div>
      )}
    </Pagina>
  )
}

function Passo({ numero, feito, icone, titulo, texto, para }: { numero: number; feito: boolean; icone: ReactNode; titulo: string; texto: string; para: string }) {
  return (
    <Link
      to={para}
      className="flex items-center gap-4 rounded-cartao border border-borda bg-cartao p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition hover:border-primaria/40 dark:shadow-none"
    >
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${feito ? 'bg-positivo/15 text-positivo' : 'bg-primaria/10 text-primaria'}`}>{icone}</div>
      <div>
        <div className="text-xs font-medium text-suave">{feito ? 'Feito ✓' : `Passo ${numero}`}</div>
        <div className="font-semibold">{titulo}</div>
        <div className="text-sm text-suave">{texto}</div>
      </div>
    </Link>
  )
}
