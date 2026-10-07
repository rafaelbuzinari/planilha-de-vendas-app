import { estiloEntrada } from './ui/Campo'
import { rotulosPeriodo, type Periodo } from '../lib/periodo'
import type { EstadoPeriodo } from '../hooks/usePeriodo'

/** Caixa de seleção do período */
export function SelectPeriodo({ estado, className = '' }: { estado: EstadoPeriodo; className?: string }) {
  return (
    <select
      className={`${estiloEntrada} px-2.5 text-sm ${className}`}
      value={estado.periodo}
      onChange={(e) => estado.setPeriodo(e.target.value as Periodo)}
      aria-label="Período"
    >
      {(Object.keys(rotulosPeriodo) as Periodo[]).map((p) => (
        <option key={p} value={p}>
          {rotulosPeriodo[p]}
        </option>
      ))}
    </select>
  )
}

/** Campos "De" e "Até" — só aparecem no período Personalizado */
export function DatasPersonalizadas({ estado }: { estado: EstadoPeriodo }) {
  if (estado.periodo !== 'personalizado') return null
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="flex flex-col gap-1 text-xs text-suave">
        De
        <input type="date" className={estiloEntrada} value={estado.de} onChange={(e) => e.target.value && estado.setDe(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-suave">
        Até
        <input type="date" className={estiloEntrada} value={estado.ate} onChange={(e) => e.target.value && estado.setAte(e.target.value)} />
      </label>
    </div>
  )
}
