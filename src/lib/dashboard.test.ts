import { describe, expect, it } from 'vitest'
import { calcularMetricas, intervaloAnterior, porFormaPagamento, serieFaturamento, topProdutos, variacaoPercentual } from './dashboard'
import { intervaloDoPeriodo } from './periodo'
import type { Venda } from '../types/venda'
import type { Despesa } from '../types/despesa'
import type { Investimento } from '../types/investimento'

// quarta-feira, 7 de outubro de 2026, 15:30
const agora = new Date(2026, 9, 7, 15, 30)
const mes = intervaloDoPeriodo('mes', agora)

function venda(dia: number, total: number, lucro: number, extra: Partial<Venda> = {}): Venda {
  return {
    id: String(Math.random()),
    data: new Date(2026, 9, dia, 10).toISOString(),
    cliente: '',
    itens: [{ produtoId: 'p1', nome: 'Kit', quantidade: 1, precoUnitario: total, custoUnitario: 0 }],
    desconto: 0,
    formaPagamento: 'pix',
    status: 'pago',
    taxaPercentual: 0,
    subtotal: total,
    total,
    custo: total - lucro,
    taxa: 0,
    lucro,
    criadoEm: '',
    atualizadoEm: '',
    ...extra,
  }
}

const despesa = (dia: number, valor: number) => ({ id: 'd', data: new Date(2026, 9, dia).toISOString(), valor }) as Despesa
const investimento = (dia: number, valor: number) => ({ id: 'i', data: new Date(2026, 9, dia).toISOString(), valor }) as Investimento

describe('métricas', () => {
  const vendas = [
    venda(1, 1000, 400),
    venda(2, 3000, 1000),
    venda(3, 5000, 2000, { status: 'pendente' }),
    venda(4, 9000, 9000, { status: 'cancelado' }),
    venda(20, 2000, 500, { data: new Date(2026, 8, 20).toISOString() }), // mês passado
  ]

  it('segue as regras da especificação', () => {
    const m = calcularMetricas(vendas, [despesa(5, 200)], [investimento(1, 10000)], mes)
    expect(m.faturamento).toBe(4000) // só pagas do mês
    expect(m.lucroLiquido).toBe(1200) // 400 + 1000 − 200 de despesa
    expect(m.margem).toBe(30)
    expect(m.ticketMedio).toBe(2000)
    expect(m.numeroVendas).toBe(2)
    expect(m.investido).toBe(10000)
    expect(m.aReceber).toBe(5000)
    expect(m.vendasPendentes).toBe(1)
  })

  it('sem vendas, margem e ticket não existem', () => {
    const m = calcularMetricas([], [], [], mes)
    expect(m.margem).toBeNull()
    expect(m.ticketMedio).toBeNull()
  })
})

describe('período anterior', () => {
  it('mês: compara até o mesmo dia do mês passado', () => {
    const anterior = intervaloAnterior('mes', mes, agora)!
    expect(anterior.inicio).toEqual(new Date(2026, 8, 1))
    expect(anterior.fim).toEqual(new Date(2026, 8, 7, 15, 30))
  })

  it('hoje: compara com ontem até a mesma hora', () => {
    const anterior = intervaloAnterior('hoje', intervaloDoPeriodo('hoje', agora), agora)!
    expect(anterior.inicio).toEqual(new Date(2026, 9, 6))
    expect(anterior.fim).toEqual(new Date(2026, 9, 6, 15, 30))
  })

  it('período já terminado compara com o período inteiro anterior', () => {
    const passado = { inicio: new Date(2026, 8, 1), fim: new Date(2026, 8, 11) }
    expect(intervaloAnterior('personalizado', passado, agora)).toEqual({ inicio: new Date(2026, 7, 22), fim: new Date(2026, 8, 1) })
  })

  it('"tudo" não tem período anterior', () => {
    expect(intervaloAnterior('tudo', null, agora)).toBeNull()
  })

  it('variação percentual', () => {
    expect(variacaoPercentual(150, 100)).toBe(50)
    expect(variacaoPercentual(50, 100)).toBe(-50)
    expect(variacaoPercentual(100, 0)).toBeNull()
    expect(variacaoPercentual(-50, -100)).toBe(50) // prejuízo diminuiu = melhorou
  })
})

describe('gráficos', () => {
  it('agrupa por dia no mês, até hoje', () => {
    const { agrupamento, pontos } = serieFaturamento([venda(2, 3000, 1000), venda(2, 1000, 400)], mes, agora)
    expect(agrupamento).toBe('dia')
    expect(pontos).toHaveLength(7) // 1 a 7 de outubro
    expect(pontos[1]).toEqual({ rotulo: '02/10', faturamento: 4000, lucro: 1400 })
    expect(pontos[0].faturamento).toBe(0)
  })

  it('agrupa por hora no dia de hoje', () => {
    const { agrupamento, pontos } = serieFaturamento([venda(7, 1000, 400)], intervaloDoPeriodo('hoje', agora), agora)
    expect(agrupamento).toBe('hora')
    expect(pontos.find((p) => p.rotulo === '10h')?.faturamento).toBe(1000)
  })

  it('agrupa por mês no ano', () => {
    const { agrupamento, pontos } = serieFaturamento([venda(2, 1000, 400)], intervaloDoPeriodo('ano', agora), agora)
    expect(agrupamento).toBe('mes')
    expect(pontos.map((p) => p.rotulo)).toEqual(['jan/26', 'fev/26', 'mar/26', 'abr/26', 'mai/26', 'jun/26', 'jul/26', 'ago/26', 'set/26', 'out/26'])
  })

  it('soma por forma de pagamento (só pagas)', () => {
    const totais = porFormaPagamento([venda(1, 1000, 0), venda(2, 500, 0, { formaPagamento: 'credito' }), venda(3, 700, 0, { status: 'pendente' })], mes)
    expect(totais).toEqual({ dinheiro: 0, pix: 1000, debito: 0, credito: 500 })
  })

  it('top produtos por quantidade', () => {
    const v1 = venda(1, 1000, 0, { itens: [{ produtoId: 'a', nome: 'A', quantidade: 2, precoUnitario: 500, custoUnitario: 0 }] })
    const v2 = venda(1, 1000, 0, { itens: [{ produtoId: 'b', nome: 'B', quantidade: 5, precoUnitario: 200, custoUnitario: 0 }] })
    const v3 = venda(1, 1000, 0, { status: 'cancelado', itens: [{ produtoId: 'a', nome: 'A', quantidade: 99, precoUnitario: 1, custoUnitario: 0 }] })
    expect(topProdutos([v1, v2, v3], mes).map((p) => [p.nome, p.quantidade])).toEqual([
      ['B', 5],
      ['A', 2],
    ])
  })
})
