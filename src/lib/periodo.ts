import { inicioDoDia, somarDias } from './datas'

export type Periodo = 'hoje' | 'semana' | 'mes' | 'ano' | 'tudo' | 'personalizado'

export const rotulosPeriodo: Record<Periodo, string> = {
  hoje: 'Hoje',
  semana: 'Esta semana',
  mes: 'Este mês',
  ano: 'Este ano',
  tudo: 'Tudo',
  personalizado: 'Personalizado',
}

/** Intervalo [inicio, fim) — o fim NÃO está incluído */
export interface Intervalo {
  inicio: Date
  fim: Date
}

/** Semana de segunda a domingo; mês e ano do calendário */
export function intervaloDoPeriodo(periodo: Exclude<Periodo, 'tudo' | 'personalizado'>, agora = new Date()): Intervalo {
  const hoje = inicioDoDia(agora)
  switch (periodo) {
    case 'hoje':
      return { inicio: hoje, fim: somarDias(hoje, 1) }
    case 'semana': {
      const diasDesdeSegunda = (hoje.getDay() + 6) % 7
      const inicio = somarDias(hoje, -diasDesdeSegunda)
      return { inicio, fim: somarDias(inicio, 7) }
    }
    case 'mes':
      return { inicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1), fim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1) }
    case 'ano':
      return { inicio: new Date(hoje.getFullYear(), 0, 1), fim: new Date(hoje.getFullYear() + 1, 0, 1) }
  }
}

/** Intervalo personalizado: de um dia até outro, os dois inclusos */
export function intervaloPersonalizado(de: Date, ate: Date): Intervalo {
  const [a, b] = de <= ate ? [de, ate] : [ate, de]
  return { inicio: inicioDoDia(a), fim: somarDias(inicioDoDia(b), 1) }
}

export function dentroDoIntervalo(data: string | Date, intervalo: Intervalo | null): boolean {
  if (!intervalo) return true
  const t = new Date(data).getTime()
  return t >= intervalo.inicio.getTime() && t < intervalo.fim.getTime()
}
