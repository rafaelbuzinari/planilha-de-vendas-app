import { db } from './db'
import type { Configuracoes } from '../types/configuracoes'

export const configuracoesPadrao: Configuracoes = {
  taxas: { dinheiro: 0, pix: 0, debito: 1.99, credito: 4.99 },
  metaMensal: 0,
  nomeNegocio: '',
}

const ID = 'geral'

/** Junta o que está salvo com os valores padrão (para campos novos nunca ficarem vazios) */
export async function lerConfiguracoes(): Promise<Configuracoes> {
  const salvo = await db.configuracoes.get(ID)
  if (!salvo) return configuracoesPadrao
  const { id: _id, ...resto } = salvo
  return { ...configuracoesPadrao, ...resto, taxas: { ...configuracoesPadrao.taxas, ...resto.taxas } }
}

export async function salvarConfiguracoes(config: Configuracoes): Promise<void> {
  await db.configuracoes.put({ ...config, id: ID })
}
