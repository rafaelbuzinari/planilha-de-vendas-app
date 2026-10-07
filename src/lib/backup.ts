import { db } from './db'
import { formatarData, formatarHora } from './datas'
import { rotuloPagamento, rotuloStatus } from './pagamentos'
import type { Produto } from '../types/produto'
import type { Venda } from '../types/venda'
import type { Investimento } from '../types/investimento'
import type { Despesa } from '../types/despesa'
import type { Configuracoes } from '../types/configuracoes'

const APP = 'planilha-de-vendas'
const VERSAO = 1

export interface DadosApp {
  produtos: Produto[]
  vendas: Venda[]
  investimentos: Investimento[]
  despesas: Despesa[]
  configuracoes: (Configuracoes & { id: string })[]
}

export interface Backup {
  app: typeof APP
  versao: number
  exportadoEm: string
  dados: DadosApp
}

const tabelas = () => [db.produtos, db.vendas, db.investimentos, db.despesas, db.configuracoes]

export async function lerTudo(): Promise<DadosApp> {
  const [produtos, vendas, investimentos, despesas, configuracoes] = await Promise.all([
    db.produtos.toArray(),
    db.vendas.toArray(),
    db.investimentos.toArray(),
    db.despesas.toArray(),
    db.configuracoes.toArray(),
  ])
  return { produtos, vendas, investimentos, despesas, configuracoes }
}

export async function gerarBackup(agora = new Date()): Promise<Backup> {
  return { app: APP, versao: VERSAO, exportadoEm: agora.toISOString(), dados: await lerTudo() }
}

/** Confere se o arquivo é mesmo um backup deste app. Lança erro com mensagem amigável se não for. */
export function validarBackup(conteudo: unknown): Backup {
  const b = conteudo as Partial<Backup> | null
  if (!b || typeof b !== 'object' || b.app !== APP || !b.dados) throw new Error('Este arquivo não é um backup da Planilha de Vendas')
  if (typeof b.versao !== 'number' || b.versao > VERSAO) throw new Error('Este backup é de uma versão mais nova do app')
  const d = b.dados as Partial<DadosApp>
  for (const nome of ['produtos', 'vendas', 'investimentos', 'despesas', 'configuracoes'] as const) {
    if (d[nome] !== undefined && !Array.isArray(d[nome])) throw new Error('O backup está danificado')
  }
  return {
    app: APP,
    versao: b.versao,
    exportadoEm: String(b.exportadoEm ?? ''),
    dados: {
      produtos: d.produtos ?? [],
      vendas: d.vendas ?? [],
      investimentos: d.investimentos ?? [],
      despesas: d.despesas ?? [],
      configuracoes: d.configuracoes ?? [],
    },
  }
}

/** Troca TODOS os dados atuais pelos do backup (tudo ou nada) */
export async function substituirTudo(dados: DadosApp): Promise<void> {
  await db.transaction('rw', tabelas(), async () => {
    await Promise.all(tabelas().map((t) => t.clear()))
    await db.produtos.bulkAdd(dados.produtos)
    await db.vendas.bulkAdd(dados.vendas)
    await db.investimentos.bulkAdd(dados.investimentos)
    await db.despesas.bulkAdd(dados.despesas)
    await db.configuracoes.bulkAdd(dados.configuracoes)
  })
}

export async function apagarTudo(): Promise<void> {
  await db.transaction('rw', tabelas(), async () => {
    await Promise.all(tabelas().map((t) => t.clear()))
  })
}

// ---------- Relatório de vendas em CSV (abre direto no Excel em português) ----------

/** 1250 → "12,50" (sem "R$", para o Excel entender como número) */
function numeroExcel(centavos: number): string {
  return (centavos / 100).toFixed(2).replace('.', ',')
}

function celula(valor: string): string {
  return /[;"\r\n]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor
}

export function gerarCsvVendas(vendas: Venda[]): string {
  const cabecalho = ['Data', 'Hora', 'Cliente', 'Itens', 'Pagamento', 'Situação', 'Produtos', 'Desconto', 'Total', 'Custo', 'Taxa', 'Lucro']
  const linhas = [...vendas]
    .sort((a, b) => a.data.localeCompare(b.data))
    .map((v) => [
      formatarData(v.data),
      formatarHora(v.data),
      v.cliente,
      v.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(', '),
      rotuloPagamento[v.formaPagamento],
      rotuloStatus[v.status],
      numeroExcel(v.subtotal),
      numeroExcel(v.desconto),
      numeroExcel(v.total),
      numeroExcel(v.custo),
      numeroExcel(v.taxa),
      numeroExcel(v.lucro),
    ])
  // ﻿ no início: faz o Excel reconhecer os acentos; ";" é o separador do Excel brasileiro
  return '﻿' + [cabecalho, ...linhas].map((linha) => linha.map(celula).join(';')).join('\r\n')
}

// ---------- Baixar arquivo ----------

export function baixarArquivo(nome: string, conteudo: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }))
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
