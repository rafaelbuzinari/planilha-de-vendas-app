import type { Venda } from '../types/venda'
import type { Despesa } from '../types/despesa'
import type { Investimento } from '../types/investimento'

// Contas do negócio como um todo. Tudo em centavos.

/** Lucro das vendas PAGAS (canceladas nunca contam; pendentes ainda não entraram) */
export function lucroDasVendas(vendas: Pick<Venda, 'status' | 'lucro'>[]): number {
  return vendas.filter((v) => v.status === 'pago').reduce((soma, v) => soma + v.lucro, 0)
}

/** Despesas pagas e não pagas: é dinheiro que o negócio deve de qualquer jeito */
export function totalDespesas(despesas: Pick<Despesa, 'valor'>[]): number {
  return despesas.reduce((soma, d) => soma + d.valor, 0)
}

export function totalInvestido(investimentos: Pick<Investimento, 'valor'>[]): number {
  return investimentos.reduce((soma, i) => soma + i.valor, 0)
}

/** Lucro líquido = lucro das vendas − despesas */
export function lucroLiquido(vendas: Pick<Venda, 'status' | 'lucro'>[], despesas: Pick<Despesa, 'valor'>[]): number {
  return lucroDasVendas(vendas) - totalDespesas(despesas)
}

/** Quanto % do investimento já voltou em lucro. Sem investimento, não há retorno (null). */
export function retornoInvestimento(lucroAcumulado: number, investido: number): number | null {
  if (investido <= 0) return null
  return (lucroAcumulado / investido) * 100
}

/** Soma os valores por uma chave (ex: por tipo), do maior para o menor */
export function somarPor<T, K extends string>(lista: T[], chave: (item: T) => K, valor: (item: T) => number): { chave: K; total: number }[] {
  const totais = new Map<K, number>()
  for (const item of lista) totais.set(chave(item), (totais.get(chave(item)) ?? 0) + valor(item))
  return [...totais.entries()].map(([chave, total]) => ({ chave, total })).sort((a, b) => b.total - a.total)
}
