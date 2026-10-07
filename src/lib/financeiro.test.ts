import { describe, expect, it } from 'vitest'
import { lucroDasVendas, lucroLiquido, retornoInvestimento, somarPor, totalDespesas, totalInvestido } from './financeiro'

const vendas = [
  { status: 'pago' as const, lucro: 1000 },
  { status: 'pago' as const, lucro: 500 },
  { status: 'pendente' as const, lucro: 700 },
  { status: 'cancelado' as const, lucro: 9999 },
]

describe('financeiro', () => {
  it('lucro conta só vendas pagas', () => {
    expect(lucroDasVendas(vendas)).toBe(1500)
  })

  it('despesas contam pagas e não pagas', () => {
    expect(totalDespesas([{ valor: 300 }, { valor: 200 }])).toBe(500)
  })

  it('lucro líquido = lucro das vendas − despesas', () => {
    expect(lucroLiquido(vendas, [{ valor: 400 }])).toBe(1100)
  })

  it('lucro líquido pode ficar negativo', () => {
    expect(lucroLiquido([], [{ valor: 400 }])).toBe(-400)
  })

  it('soma o total investido', () => {
    expect(totalInvestido([{ valor: 10000 }, { valor: 5000 }])).toBe(15000)
  })

  it('retorno do investimento em %', () => {
    expect(retornoInvestimento(5000, 20000)).toBe(25)
    expect(retornoInvestimento(30000, 20000)).toBe(150)
    expect(retornoInvestimento(-1000, 20000)).toBe(-5)
    expect(retornoInvestimento(5000, 0)).toBeNull()
  })

  it('soma por tipo, do maior para o menor', () => {
    const lista = [
      { tipo: 'estoque', valor: 100 },
      { tipo: 'marketing', valor: 300 },
      { tipo: 'estoque', valor: 50 },
    ]
    expect(somarPor(lista, (i) => i.tipo, (i) => i.valor)).toEqual([
      { chave: 'marketing', total: 300 },
      { chave: 'estoque', total: 150 },
    ])
  })
})
