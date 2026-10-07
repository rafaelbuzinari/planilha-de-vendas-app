import { describe, expect, it } from 'vitest'
import { lucroPorUnidade, margemPercentual, precisaRepor } from './calculos'
import { centavosDeTexto, formatarPorcentagem, formatarReais } from './dinheiro'
import { normalizarBusca, ordenarPorNome } from './produtos'
import type { Produto } from '../types/produto'

// o Intl usa espaço especial (não separável) entre "R$" e o número
const reais = (texto: string) => texto.replace(' ', ' ')

describe('dinheiro', () => {
  it('formata centavos em reais', () => {
    expect(formatarReais(1250)).toBe(reais('R$ 12,50'))
    expect(formatarReais(0)).toBe(reais('R$ 0,00'))
    expect(formatarReais(123456789)).toBe(reais('R$ 1.234.567,89'))
    expect(formatarReais(-500)).toBe(reais('-R$ 5,00'))
  })

  it('lê o valor digitado como centavos', () => {
    expect(centavosDeTexto('1250')).toBe(1250)
    expect(centavosDeTexto('R$ 12,50')).toBe(1250)
    expect(centavosDeTexto('R$ 1.000,00')).toBe(100000)
    expect(centavosDeTexto('')).toBe(0)
    expect(centavosDeTexto('abc')).toBe(0)
  })

  it('limita valores absurdos', () => {
    expect(centavosDeTexto('9'.repeat(20))).toBe(99999999999)
  })

  it('formata porcentagem', () => {
    expect(formatarPorcentagem(40)).toBe('40,0%')
    expect(formatarPorcentagem(33.3333)).toBe('33,3%')
    expect(formatarPorcentagem(-12.55, 2)).toBe('-12,55%')
  })
})

describe('margem', () => {
  it('calcula a margem sobre o preço de venda', () => {
    expect(margemPercentual(1000, 600)).toBe(40)
    expect(margemPercentual(1000, 0)).toBe(100)
  })

  it('fica negativa quando o custo é maior que o preço', () => {
    expect(margemPercentual(1000, 1200)).toBe(-20)
  })

  it('não existe sem preço', () => {
    expect(margemPercentual(0, 500)).toBeNull()
  })

  it('calcula o lucro por unidade', () => {
    expect(lucroPorUnidade(1000, 600)).toBe(400)
  })
})

describe('repor estoque', () => {
  it('só pede reposição abaixo do mínimo', () => {
    expect(precisaRepor({ estoque: 2, estoqueMinimo: 5 })).toBe(true)
    expect(precisaRepor({ estoque: 5, estoqueMinimo: 5 })).toBe(false)
    expect(precisaRepor({ estoque: 0, estoqueMinimo: 0 })).toBe(false)
  })
})

describe('busca e ordem de produtos', () => {
  it('ignora acentos e maiúsculas', () => {
    expect(normalizarBusca('  Açaí GRANDE ')).toBe('acai grande')
  })

  it('ordena em ordem alfabética com acentos', () => {
    const nomes = ['banana', 'Água', 'abacaxi', 'Ébano'].map((nome) => ({ nome }) as Produto)
    expect(ordenarPorNome(nomes).map((p) => p.nome)).toEqual(['abacaxi', 'Água', 'banana', 'Ébano'])
  })
})
