export type CategoriaDespesa = 'aluguel' | 'energia' | 'internet' | 'transporte' | 'embalagem' | 'impostos' | 'outros'

export interface Despesa {
  id: string
  /** data da despesa (ISO) */
  data: string
  descricao: string
  categoria: CategoriaDespesa
  /** em centavos */
  valor: number
  /** fixa = todo mês (aluguel); variável = muda (transporte) */
  fixa: boolean
  paga: boolean
  criadoEm: string
  atualizadoEm: string
}

export type DadosDespesa = Omit<Despesa, 'id' | 'criadoEm' | 'atualizadoEm'>
