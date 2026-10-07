import type { Table } from 'dexie'
import { db } from './db'

// Gravação genérica para registros simples (investimentos, despesas).
// Se um dia o app for para a nuvem, só este arquivo (e os parecidos) mudam.

interface Base {
  id: string
  criadoEm: string
  atualizadoEm: string
}

export async function criarRegistro<T extends Base>(tabela: Table<T, string>, dados: Omit<T, keyof Base>): Promise<T> {
  const agora = new Date().toISOString()
  const registro = { ...dados, id: crypto.randomUUID(), criadoEm: agora, atualizadoEm: agora } as T
  await tabela.add(registro)
  return registro
}

export async function atualizarRegistro<T extends Base>(tabela: Table<T, string>, id: string, dados: Omit<T, keyof Base>): Promise<void> {
  await db.transaction('rw', tabela, async () => {
    const atual = await tabela.get(id)
    if (!atual) throw new Error('Registro não encontrado')
    await tabela.put({ ...dados, id, criadoEm: atual.criadoEm, atualizadoEm: new Date().toISOString() } as T)
  })
}

export async function excluirRegistro<T extends Base>(tabela: Table<T, string>, id: string): Promise<void> {
  await tabela.delete(id)
}
