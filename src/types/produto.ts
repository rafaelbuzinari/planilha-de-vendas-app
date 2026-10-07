export interface Produto {
  id: string
  nome: string
  categoria: string
  /** em centavos */
  custo: number
  /** preço de venda, em centavos */
  preco: number
  /** unidades em estoque */
  estoque: number
  estoqueMinimo: number
  /** foto reduzida (JPEG em data URL), opcional */
  foto?: string
  /** datas em ISO (ex: 2026-10-07T14:30:00.000Z) */
  criadoEm: string
  atualizadoEm: string
}

/** O que o usuário preenche no formulário */
export type DadosProduto = Omit<Produto, 'id' | 'criadoEm' | 'atualizadoEm'>
