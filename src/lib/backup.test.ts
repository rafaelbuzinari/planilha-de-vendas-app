import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { apagarTudo, gerarBackup, gerarCsvVendas, lerTudo, substituirTudo, validarBackup } from './backup'
import { gerarDadosExemplo } from './exemplo'
import { calcularVenda } from './calculos'
import type { Venda } from '../types/venda'

const agora = new Date(2026, 9, 7, 15, 30)

describe('backup', () => {
  beforeEach(apagarTudo)

  it('exporta e importa sem perder nada (ida e volta)', async () => {
    const exemplo = gerarDadosExemplo(agora)
    await substituirTudo(exemplo)
    const backup = JSON.parse(JSON.stringify(await gerarBackup(agora)))
    await apagarTudo()
    expect((await lerTudo()).vendas).toHaveLength(0)

    await substituirTudo(validarBackup(backup).dados)
    const depois = await lerTudo()
    expect(depois.produtos).toHaveLength(exemplo.produtos.length)
    expect(depois.vendas).toHaveLength(exemplo.vendas.length)
    expect(depois.despesas).toHaveLength(exemplo.despesas.length)
    expect(depois.investimentos).toHaveLength(exemplo.investimentos.length)
    expect(depois.configuracoes[0].nomeNegocio).toBe('Fini na Rua')
  })

  it('recusa arquivos que não são backup do app', () => {
    expect(() => validarBackup({ qualquer: 'coisa' })).toThrow('não é um backup')
    expect(() => validarBackup(null)).toThrow('não é um backup')
    expect(() => validarBackup({ app: 'planilha-de-vendas', versao: 99, dados: {} })).toThrow('versão mais nova')
    expect(() => validarBackup({ app: 'planilha-de-vendas', versao: 1, dados: { vendas: 'x' } })).toThrow('danificado')
  })

  it('importar substitui os dados atuais (não duplica)', async () => {
    const exemplo = gerarDadosExemplo(agora)
    await substituirTudo(exemplo)
    await substituirTudo(exemplo)
    expect((await lerTudo()).vendas).toHaveLength(exemplo.vendas.length)
  })
})

describe('dados de exemplo', () => {
  const exemplo = gerarDadosExemplo(agora)

  it('tem de tudo um pouco', () => {
    expect(exemplo.produtos.length).toBeGreaterThan(3)
    expect(exemplo.vendas.length).toBeGreaterThan(100)
    expect(exemplo.investimentos.length).toBeGreaterThan(0)
    expect(exemplo.despesas.length).toBeGreaterThan(0)
  })

  it('tem vendas pagas, pendentes e canceladas, e produtos para repor', () => {
    const status = new Set(exemplo.vendas.map((v) => v.status))
    expect(status).toEqual(new Set(['pago', 'pendente', 'cancelado']))
    expect(exemplo.produtos.some((p) => p.estoque < p.estoqueMinimo)).toBe(true)
  })

  it('os totais das vendas batem com as regras', () => {
    for (const v of exemplo.vendas) {
      expect({ subtotal: v.subtotal, total: v.total, custo: v.custo, taxa: v.taxa, lucro: v.lucro }).toEqual(calcularVenda(v.itens, v.desconto, v.taxaPercentual))
    }
  })

  it('nenhuma venda no futuro', () => {
    expect(exemplo.vendas.every((v) => new Date(v.data) <= agora)).toBe(true)
  })
})

describe('relatório CSV', () => {
  const venda: Venda = {
    id: '1',
    data: new Date(2026, 9, 7, 14, 5).toISOString(),
    cliente: 'Maria; a "boa"',
    itens: [{ produtoId: 'p', nome: 'Kit Fini', quantidade: 3, precoUnitario: 1000, custoUnitario: 600 }],
    desconto: 200,
    formaPagamento: 'credito',
    status: 'pago',
    taxaPercentual: 4.99,
    ...calcularVenda([{ produtoId: 'p', nome: 'Kit Fini', quantidade: 3, precoUnitario: 1000, custoUnitario: 600 }], 200, 4.99),
    criadoEm: '',
    atualizadoEm: '',
  }

  it('sai no formato do Excel brasileiro', () => {
    const csv = gerarCsvVendas([venda])
    expect(csv.startsWith('﻿')).toBe(true)
    const [cabecalho, linha] = csv.slice(1).split('\r\n')
    expect(cabecalho).toBe('Data;Hora;Cliente;Itens;Pagamento;Situação;Produtos;Desconto;Total;Custo;Taxa;Lucro')
    expect(linha).toBe('07/10/2026;14:05;"Maria; a ""boa""";3x Kit Fini;Crédito;Pago;30,00;2,00;28,00;18,00;1,40;8,60')
  })
})
