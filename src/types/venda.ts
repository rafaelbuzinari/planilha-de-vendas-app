export type FormaPagamento = 'dinheiro' | 'pix' | 'debito' | 'credito'
export type StatusVenda = 'pago' | 'pendente' | 'cancelado'

export interface ItemVenda {
  produtoId: string
  /** nome, preço e custo "congelados" no momento da venda */
  nome: string
  quantidade: number
  /** em centavos */
  precoUnitario: number
  /** em centavos */
  custoUnitario: number
}

export interface Venda {
  id: string
  /** data e hora da venda (ISO) */
  data: string
  cliente: string
  itens: ItemVenda[]
  /** em centavos */
  desconto: number
  formaPagamento: FormaPagamento
  status: StatusVenda
  /** taxa da forma de pagamento usada nesta venda, em % (ex: 4.99) */
  taxaPercentual: number

  // valores calculados (em centavos), guardados para relatórios e para uma futura migração
  subtotal: number
  total: number
  custo: number
  taxa: number
  lucro: number

  criadoEm: string
  atualizadoEm: string
}

/** O que o formulário envia; os valores calculados o app preenche sozinho */
export type DadosVenda = Pick<Venda, 'data' | 'cliente' | 'itens' | 'desconto' | 'formaPagamento' | 'status' | 'taxaPercentual'>
