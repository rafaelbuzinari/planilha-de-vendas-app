import { useLiveQuery } from 'dexie-react-hooks'
import { configuracoesPadrao, lerConfiguracoes } from '../lib/configuracoes'

/** Configurações sempre atualizadas (enquanto carrega, usa os valores padrão) */
export function useConfiguracoes() {
  return useLiveQuery(lerConfiguracoes, [], configuracoesPadrao)
}
