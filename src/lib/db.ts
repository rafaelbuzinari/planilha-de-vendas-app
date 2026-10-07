import Dexie, { type Table } from 'dexie'
import type { Produto } from '../types/produto'
import type { Venda } from '../types/venda'
import type { Configuracoes } from '../types/configuracoes'
import type { Investimento } from '../types/investimento'
import type { Despesa } from '../types/despesa'

// Banco local (IndexedDB) — os dados ficam só neste aparelho.
// Cada registro tem id em texto (UUID) e datas em ISO: o mesmo formato de um banco online
// como o Supabase, para facilitar uma migração no futuro.
class BancoLocal extends Dexie {
  produtos!: Table<Produto, string>
  vendas!: Table<Venda, string>
  configuracoes!: Table<Configuracoes & { id: string }, string>
  investimentos!: Table<Investimento, string>
  despesas!: Table<Despesa, string>

  constructor() {
    super('planilha-de-vendas')
    // só os campos usados em buscas/ordenação entram aqui; o resto é guardado igual
    this.version(1).stores({
      produtos: 'id, nome, categoria',
    })
    this.version(2).stores({
      vendas: 'id, data, status, formaPagamento',
      configuracoes: 'id',
    })
    this.version(3).stores({
      investimentos: 'id, data, tipo',
      despesas: 'id, data, categoria',
    })
  }
}

export const db = new BancoLocal()

// Pede ao navegador para não apagar os dados quando o aparelho estiver com pouco espaço
navigator.storage?.persist?.().catch(() => {})
