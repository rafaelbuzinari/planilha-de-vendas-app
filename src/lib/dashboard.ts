import { dentroDoIntervalo, type Intervalo, type Periodo } from './periodo'
import { inicioDoDia, somarDias } from './datas'
import type { Venda, FormaPagamento } from '../types/venda'
import type { Despesa } from '../types/despesa'
import type { Investimento } from '../types/investimento'

// Contas da tela Início. Tudo em centavos. Canceladas nunca contam; faturamento e lucro
// contam só as vendas pagas; pendentes aparecem à parte ("a receber").

export interface Metricas {
  faturamento: number
  lucroLiquido: number
  /** lucro líquido ÷ faturamento, em % (null sem faturamento) */
  margem: number | null
  /** faturamento ÷ nº de vendas pagas (null sem vendas) */
  ticketMedio: number | null
  numeroVendas: number
  investido: number
  aReceber: number
  vendasPendentes: number
}

export function calcularMetricas(vendas: Venda[], despesas: Despesa[], investimentos: Investimento[], intervalo: Intervalo | null): Metricas {
  const noPeriodo = vendas.filter((v) => dentroDoIntervalo(v.data, intervalo))
  const pagas = noPeriodo.filter((v) => v.status === 'pago')
  const pendentes = noPeriodo.filter((v) => v.status === 'pendente')
  const faturamento = pagas.reduce((s, v) => s + v.total, 0)
  const lucroVendas = pagas.reduce((s, v) => s + v.lucro, 0)
  const gastos = despesas.filter((d) => dentroDoIntervalo(d.data, intervalo)).reduce((s, d) => s + d.valor, 0)
  const lucroLiquido = lucroVendas - gastos
  return {
    faturamento,
    lucroLiquido,
    margem: faturamento > 0 ? (lucroLiquido / faturamento) * 100 : null,
    ticketMedio: pagas.length ? Math.round(faturamento / pagas.length) : null,
    numeroVendas: pagas.length,
    investido: investimentos.filter((i) => dentroDoIntervalo(i.data, intervalo)).reduce((s, i) => s + i.valor, 0),
    aReceber: pendentes.reduce((s, v) => s + v.total, 0),
    vendasPendentes: pendentes.length,
  }
}

/**
 * Período anterior para comparar, "até o mesmo ponto": no dia 7 do mês, compara com
 * os dias 1 a 7 do mês passado (e não com o mês passado inteiro, que seria injusto).
 */
export function intervaloAnterior(periodo: Periodo, intervalo: Intervalo | null, agora = new Date()): Intervalo | null {
  if (!intervalo) return null
  const { inicio, fim } = intervalo
  let inicioAnterior: Date
  if (periodo === 'mes') inicioAnterior = new Date(inicio.getFullYear(), inicio.getMonth() - 1, 1)
  else if (periodo === 'ano') inicioAnterior = new Date(inicio.getFullYear() - 1, 0, 1)
  else {
    const dias = Math.round((fim.getTime() - inicio.getTime()) / 86400000)
    inicioAnterior = somarDias(inicio, -dias)
  }
  const corte = Math.min(fim.getTime(), agora.getTime())
  const decorrido = Math.max(0, corte - inicio.getTime())
  return { inicio: inicioAnterior, fim: new Date(Math.min(inicioAnterior.getTime() + decorrido, inicio.getTime())) }
}

/** Variação em % (null quando não há base para comparar) */
export function variacaoPercentual(atual: number, anterior: number): number | null {
  if (anterior === 0) return null
  return ((atual - anterior) / Math.abs(anterior)) * 100
}

// ---------- Gráfico de faturamento x lucro ----------

export type Agrupamento = 'hora' | 'dia' | 'mes'

export interface PontoSerie {
  rotulo: string
  faturamento: number
  lucro: number
}

const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/**
 * Faturamento e lucro das vendas pagas, agrupados por hora (um dia só), por dia (até ~3 meses)
 * ou por mês. Mostra só até hoje — dias futuros do período não aparecem.
 */
export function serieFaturamento(vendas: Venda[], intervalo: Intervalo | null, agora = new Date()): { agrupamento: Agrupamento; pontos: PontoSerie[] } {
  const pagas = vendas.filter((v) => v.status === 'pago' && dentroDoIntervalo(v.data, intervalo))
  const primeira = vendas.reduce<number | null>((min, v) => (min === null || new Date(v.data).getTime() < min ? new Date(v.data).getTime() : min), null)
  const inicio = intervalo?.inicio ?? inicioDoDia(new Date(primeira ?? agora.getTime()))
  const fimDeHoje = somarDias(inicioDoDia(agora), 1)
  const fim = new Date(Math.min((intervalo?.fim ?? fimDeHoje).getTime(), fimDeHoje.getTime()))
  const dias = Math.max(1, Math.round((fim.getTime() - inicio.getTime()) / 86400000))
  const agrupamento: Agrupamento = dias <= 1 ? 'hora' : dias <= 92 ? 'dia' : 'mes'

  const chaveDe = (d: Date) =>
    agrupamento === 'hora' ? d.getHours() : agrupamento === 'dia' ? inicioDoDia(d).getTime() : d.getFullYear() * 12 + d.getMonth()
  const somas = new Map<number, PontoSerie>()
  for (const v of pagas) {
    const chave = chaveDe(new Date(v.data))
    const ponto = somas.get(chave) ?? { rotulo: '', faturamento: 0, lucro: 0 }
    ponto.faturamento += v.total
    ponto.lucro += v.lucro
    somas.set(chave, ponto)
  }

  const pontos: PontoSerie[] = []
  const ponto = (chave: number, rotulo: string) => pontos.push({ ...(somas.get(chave) ?? { faturamento: 0, lucro: 0 }), rotulo })
  if (agrupamento === 'hora') {
    const horas = [...somas.keys()]
    const de = Math.min(8, ...horas)
    const ate = Math.max(18, ...horas)
    for (let h = de; h <= ate; h++) ponto(h, `${h}h`)
  } else if (agrupamento === 'dia') {
    for (let d = inicio; d < fim; d = somarDias(d, 1)) {
      ponto(d.getTime(), `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
  } else {
    const ultimo = (fim.getFullYear() * 12 + fim.getMonth()) - (fim.getDate() === 1 ? 1 : 0)
    for (let m = inicio.getFullYear() * 12 + inicio.getMonth(); m <= ultimo; m++) {
      ponto(m, `${meses[m % 12]}/${String(Math.floor(m / 12)).slice(2)}`)
    }
  }
  return { agrupamento, pontos }
}

// ---------- Formas de pagamento e produtos ----------

export function porFormaPagamento(vendas: Venda[], intervalo: Intervalo | null): Record<FormaPagamento, number> {
  const totais: Record<FormaPagamento, number> = { dinheiro: 0, pix: 0, debito: 0, credito: 0 }
  for (const v of vendas) if (v.status === 'pago' && dentroDoIntervalo(v.data, intervalo)) totais[v.formaPagamento] += v.total
  return totais
}

export interface ProdutoVendido {
  produtoId: string
  nome: string
  quantidade: number
  faturamento: number
}

/** Mais vendidos por quantidade (vendas pagas e pendentes — os produtos saíram de qualquer jeito) */
export function topProdutos(vendas: Venda[], intervalo: Intervalo | null, limite = 5): ProdutoVendido[] {
  const mapa = new Map<string, ProdutoVendido>()
  for (const v of vendas) {
    if (v.status === 'cancelado' || !dentroDoIntervalo(v.data, intervalo)) continue
    for (const i of v.itens) {
      const atual = mapa.get(i.produtoId) ?? { produtoId: i.produtoId, nome: i.nome, quantidade: 0, faturamento: 0 }
      atual.quantidade += i.quantidade
      atual.faturamento += i.quantidade * i.precoUnitario
      mapa.set(i.produtoId, atual)
    }
  }
  return [...mapa.values()].sort((a, b) => b.quantidade - a.quantidade || b.faturamento - a.faturamento).slice(0, limite)
}
