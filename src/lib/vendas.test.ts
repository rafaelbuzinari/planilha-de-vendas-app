import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { calcularVenda, variacoesEstoque } from './calculos'
import { db } from './db'
import { criarProduto } from './produtos'
import { cancelarVenda, excluirVenda, salvarVenda } from './vendas'
import type { DadosVenda, ItemVenda } from '../types/venda'

const item = (quantidade: number, precoUnitario = 1000, custoUnitario = 600, produtoId = 'p1'): ItemVenda => ({
  produtoId,
  nome: 'Kit Fini',
  quantidade,
  precoUnitario,
  custoUnitario,
})

describe('cálculo da venda', () => {
  it('segue as regras: total = itens − desconto; lucro = total − custo − taxa', () => {
    // 3 × R$ 10,00 = R$ 30,00; desconto R$ 2,00 → total R$ 28,00
    // custo 3 × R$ 6,00 = R$ 18,00; taxa 4,99% de R$ 28,00 = R$ 1,40 (1,3972 arredonda)
    expect(calcularVenda([item(3)], 200, 4.99)).toEqual({
      subtotal: 3000,
      total: 2800,
      custo: 1800,
      taxa: 140,
      lucro: 860,
    })
  })

  it('soma vários itens', () => {
    const r = calcularVenda([item(2, 1000, 600), item(1, 2500, 1000, 'p2')], 0, 0)
    expect(r.subtotal).toBe(4500)
    expect(r.custo).toBe(2200)
    expect(r.lucro).toBe(2300)
  })

  it('sem taxa no Pix/Dinheiro', () => {
    expect(calcularVenda([item(1)], 0, 0).taxa).toBe(0)
  })

  it('não deixa o total ficar negativo com desconto grande', () => {
    expect(calcularVenda([item(1)], 5000, 0).total).toBe(0)
  })

  it('arredonda a taxa para o centavo mais próximo', () => {
    // 1,99% de R$ 10,00 = 19,9 centavos → 20
    expect(calcularVenda([item(1)], 0, 1.99).taxa).toBe(20)
  })
})

describe('variações de estoque', () => {
  const pago = { status: 'pago' as const, itens: [item(3)] }

  it('nova venda tira do estoque', () => {
    expect(variacoesEstoque(undefined, pago)).toEqual(new Map([['p1', -3]]))
  })

  it('venda cancelada devolve', () => {
    expect(variacoesEstoque(pago, { ...pago, status: 'cancelado' })).toEqual(new Map([['p1', 3]]))
  })

  it('pendente também tira do estoque', () => {
    expect(variacoesEstoque(undefined, { ...pago, status: 'pendente' })).toEqual(new Map([['p1', -3]]))
  })

  it('editar a quantidade acerta só a diferença', () => {
    expect(variacoesEstoque(pago, { ...pago, itens: [item(5)] })).toEqual(new Map([['p1', -2]]))
  })

  it('pago → pendente não mexe no estoque', () => {
    expect(variacoesEstoque(pago, { ...pago, status: 'pendente' }).size).toBe(0)
  })

  it('excluir venda devolve', () => {
    expect(variacoesEstoque(pago, undefined)).toEqual(new Map([['p1', 3]]))
  })

  it('excluir venda já cancelada não devolve de novo', () => {
    expect(variacoesEstoque({ ...pago, status: 'cancelado' }, undefined).size).toBe(0)
  })
})

describe('vendas no banco (de ponta a ponta)', () => {
  let produtoId: string
  const estoque = async () => (await db.produtos.get(produtoId))!.estoque
  const dados = (quantidade: number, status: DadosVenda['status'] = 'pago'): DadosVenda => ({
    data: new Date().toISOString(),
    cliente: '',
    itens: [item(quantidade, 1000, 600, produtoId)],
    desconto: 0,
    formaPagamento: 'pix',
    status,
    taxaPercentual: 0,
  })

  beforeEach(async () => {
    await db.vendas.clear()
    await db.produtos.clear()
    const p = await criarProduto({ nome: 'Kit Fini', categoria: '', custo: 600, preco: 1000, estoque: 10, estoqueMinimo: 2 })
    produtoId = p.id
  })

  it('registrar venda baixa o estoque e guarda os totais', async () => {
    const venda = await salvarVenda(dados(3))
    expect(await estoque()).toBe(7)
    expect(venda.total).toBe(3000)
    expect(venda.lucro).toBe(1200)
  })

  it('editar a venda acerta o estoque pela diferença', async () => {
    const venda = await salvarVenda(dados(3))
    await salvarVenda(dados(1), venda.id)
    expect(await estoque()).toBe(9)
    expect(await db.vendas.count()).toBe(1)
  })

  it('cancelar devolve ao estoque, e cancelar de novo não devolve duas vezes', async () => {
    const venda = await salvarVenda(dados(3))
    await cancelarVenda(venda.id)
    await cancelarVenda(venda.id)
    expect(await estoque()).toBe(10)
    expect((await db.vendas.get(venda.id))!.status).toBe('cancelado')
  })

  it('excluir devolve ao estoque', async () => {
    const venda = await salvarVenda(dados(4, 'pendente'))
    expect(await estoque()).toBe(6)
    await excluirVenda(venda.id)
    expect(await estoque()).toBe(10)
    expect(await db.vendas.count()).toBe(0)
  })

  it('preço da venda não muda se o produto mudar depois', async () => {
    const venda = await salvarVenda(dados(1))
    await db.produtos.update(produtoId, { preco: 9999 })
    expect((await db.vendas.get(venda.id))!.itens[0].precoUnitario).toBe(1000)
  })

  it('venda de produto excluído do catálogo pode ser cancelada sem erro', async () => {
    const venda = await salvarVenda(dados(2))
    await db.produtos.delete(produtoId)
    await expect(cancelarVenda(venda.id)).resolves.toBeUndefined()
  })
})
