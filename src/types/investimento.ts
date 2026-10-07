export type TipoInvestimento = 'estoque' | 'equipamento' | 'marketing' | 'estrutura' | 'outros'

export interface Investimento {
  id: string
  /** data do investimento (ISO) */
  data: string
  descricao: string
  tipo: TipoInvestimento
  /** em centavos */
  valor: number
  criadoEm: string
  atualizadoEm: string
}

export type DadosInvestimento = Omit<Investimento, 'id' | 'criadoEm' | 'atualizadoEm'>
