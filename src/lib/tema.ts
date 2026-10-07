export type PreferenciaTema = 'auto' | 'claro' | 'escuro'

const CHAVE = 'tema'
const consultaEscuro = window.matchMedia('(prefers-color-scheme: dark)')
const ouvintes = new Set<() => void>()

function lerPreferencia(): PreferenciaTema {
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo === 'claro' || salvo === 'escuro') return salvo
  } catch {
    // armazenamento indisponível (ex: navegação privada): segue no automático
  }
  return 'auto'
}

let preferencia = lerPreferencia()

function aplicar() {
  const escuro = preferencia === 'escuro' || (preferencia === 'auto' && consultaEscuro.matches)
  document.documentElement.classList.toggle('dark', escuro)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', escuro ? '#020617' : '#0F172A')
}

consultaEscuro.addEventListener('change', () => {
  if (preferencia !== 'auto') return
  aplicar()
  ouvintes.forEach((avisar) => avisar())
})
aplicar()

export function obterPreferencia() {
  return preferencia
}

export function definirPreferencia(nova: PreferenciaTema) {
  preferencia = nova
  try {
    localStorage.setItem(CHAVE, nova)
  } catch {
    // sem armazenamento: vale só até fechar o app
  }
  aplicar()
  ouvintes.forEach((avisar) => avisar())
}

export function assinar(avisar: () => void) {
  ouvintes.add(avisar)
  return () => {
    ouvintes.delete(avisar)
  }
}

/** O tema que está valendo agora (já resolvendo o "Auto") */
export function estaEscuro() {
  return document.documentElement.classList.contains('dark')
}
