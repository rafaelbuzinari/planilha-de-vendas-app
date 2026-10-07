import { useMemo, useState } from 'react'
import { deCampoData, paraCampoData } from '../lib/datas'
import { intervaloDoPeriodo, intervaloPersonalizado, type Periodo } from '../lib/periodo'

/** Estado do filtro de período (Hoje, Esta semana, ..., Personalizado) e o intervalo resultante */
export function usePeriodo(inicial: Periodo = 'mes') {
  const [periodo, setPeriodo] = useState<Periodo>(inicial)
  const [de, setDe] = useState(() => paraCampoData(new Date()))
  const [ate, setAte] = useState(() => paraCampoData(new Date()))

  const intervalo = useMemo(() => {
    if (periodo === 'tudo') return null
    if (periodo === 'personalizado') return intervaloPersonalizado(deCampoData(de), deCampoData(ate))
    return intervaloDoPeriodo(periodo)
  }, [periodo, de, ate])

  return { periodo, setPeriodo, de, setDe, ate, setAte, intervalo }
}

export type EstadoPeriodo = ReturnType<typeof usePeriodo>
