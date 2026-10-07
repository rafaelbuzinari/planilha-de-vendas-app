import { db } from './db'
import type { DadosProduto, Produto } from '../types/produto'

// Todas as gravações de produtos passam por aqui (e não direto pelo banco nas telas).
// Se um dia o app for para a nuvem, só este arquivo muda.

export async function criarProduto(dados: DadosProduto): Promise<Produto> {
  const agora = new Date().toISOString()
  const produto: Produto = { ...dados, id: crypto.randomUUID(), criadoEm: agora, atualizadoEm: agora }
  await db.produtos.add(produto)
  return produto
}

export async function atualizarProduto(id: string, dados: DadosProduto): Promise<void> {
  await db.transaction('rw', db.produtos, async () => {
    const atual = await db.produtos.get(id)
    if (!atual) throw new Error('Produto não encontrado')
    // substitui o registro inteiro: se a foto foi removida, ela some de verdade
    await db.produtos.put({ ...dados, id, criadoEm: atual.criadoEm, atualizadoEm: new Date().toISOString() })
  })
}

export async function excluirProduto(id: string): Promise<void> {
  await db.produtos.delete(id)
}

/** Ordem alfabética respeitando acentos (Água vem antes de Banana) */
export function ordenarPorNome(produtos: Produto[]): Produto[] {
  return [...produtos].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
}

/** Para buscar sem se importar com acentos e maiúsculas: "Açaí" → "acai" */
export function normalizarBusca(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}
