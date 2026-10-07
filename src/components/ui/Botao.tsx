import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primaria' | 'secundaria' | 'perigo' | 'fantasma'

const estilos: Record<Variante, string> = {
  primaria: 'bg-primaria text-white hover:bg-primaria-forte shadow-sm',
  secundaria: 'border border-borda bg-cartao text-texto hover:bg-fundo',
  perigo: 'bg-negativo text-white hover:brightness-95',
  fantasma: 'text-suave hover:bg-fundo hover:text-texto',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
}

export function Botao({ variante = 'primaria', className = '', type = 'button', ...resto }: Props) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-cartao px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${estilos[variante]} ${className}`}
      {...resto}
    />
  )
}
