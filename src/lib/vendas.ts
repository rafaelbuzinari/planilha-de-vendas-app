import { db } from './db'
import { calcularVenda, variacoesEstoque } from './calculos'
import type { DadosVenda, Venda } from '../types/venda'

// Todas as gravações de vendas passam por aqui. Cada operação roda numa "transação":
// a venda e o estoque mudam juntos, ou nada muda (nunca fica pela metade).

async function aplicarNoEstoque(variacoes: Map<string, number>) {
  for (const [produtoId, variacao] of variacoes) {
    const produto = await db.produtos.get(produtoId)
    if (!produto) continue // produto excluído do catálogo: não há estoque para acertar
    await db.produtos.update(produtoId, { estoque: produto.estoque + variacao })
  }
}

/** Cria (sem id) ou edita (com id) uma venda, acertando o estoque */
export async function salvarVenda(dados: DadosVenda, id?: string): Promise<Venda> {
  return db.transaction('rw', db.vendas, db.produtos, async () => {
    const antes = id ? await db.vendas.get(id) : undefined
    if (id && !antes) throw new Error('Venda não encontrada')

    const agora = new Date().toISOString()
    const venda: Venda = {
      ...dados,
      ...calcularVenda(dados.itens, dados.desconto, dados.taxaPercentual),
      cliente: dados.cliente.trim(),
      id: antes?.id ?? crypto.randomUUID(),
      criadoEm: antes?.criadoEm ?? agora,
      atualizadoEm: agora,
    }

    await aplicarNoEstoque(variacoesEstoque(antes, venda))
    await db.vendas.put(venda)
    return venda
  })
}

/** Marca como cancelada e devolve os produtos ao estoque */
export async function cancelarVenda(id: string): Promise<void> {
  await db.transaction('rw', db.vendas, db.produtos, async () => {
    const antes = await db.vendas.get(id)
    if (!antes || antes.status === 'cancelado') return
    const depois: Venda = { ...antes, status: 'cancelado', atualizadoEm: new Date().toISOString() }
    await aplicarNoEstoque(variacoesEstoque(antes, depois))
    await db.vendas.put(depois)
  })
}

/** Apaga a venda de vez e devolve os produtos ao estoque */
export async function excluirVenda(id: string): Promise<void> {
  await db.transaction('rw', db.vendas, db.produtos, async () => {
    const antes = await db.vendas.get(id)
    if (!antes) return
    await aplicarNoEstoque(variacoesEstoque(antes, undefined))
    await db.vendas.delete(id)
  })
}
