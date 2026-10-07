import type { FormaPagamento } from './venda'

export interface Configuracoes {
  /** taxa em % de cada forma de pagamento (ex: 4.99) */
  taxas: Record<FormaPagamento, number>
  /** meta de faturamento do mês, em centavos */
  metaMensal: number
  nomeNegocio: string
}
