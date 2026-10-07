import { useSyncExternalStore } from 'react'
import { assinar, definirPreferencia, estaEscuro, obterPreferencia, type PreferenciaTema } from '../lib/tema'

const proximo: Record<PreferenciaTema, PreferenciaTema> = { auto: 'claro', claro: 'escuro', escuro: 'auto' }

export function useTema() {
  const preferencia = useSyncExternalStore(assinar, obterPreferencia)
  return {
    preferencia,
    alternar: () => definirPreferencia(proximo[preferencia]),
  }
}

/** true quando a tela está no modo escuro (para os gráficos escolherem as cores certas) */
export function useEscuro() {
  return useSyncExternalStore(assinar, estaEscuro)
}
