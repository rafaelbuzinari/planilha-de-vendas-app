import type { InputHTMLAttributes, ReactNode } from 'react'
import { centavosDeTexto, formatarReais } from '../../lib/dinheiro'

/** Visual padrão das caixas de texto */
export const estiloEntrada =
  'w-full rounded-cartao border border-borda bg-cartao px-3.5 py-2.5 text-base text-texto placeholder:text-suave/70 outline-none transition focus:border-primaria focus:ring-3 focus:ring-primaria/15'

interface CampoProps {
  rotulo: ReactNode
  /** texto pequeno de ajuda embaixo do campo */
  dica?: ReactNode
  erro?: string
  children: ReactNode
}

/** Rótulo + campo + dica/erro */
export function Campo({ rotulo, dica, erro, children }: CampoProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{rotulo}</span>
      {children}
      {erro ? <span className="text-sm text-negativo">{erro}</span> : dica && <span className="text-xs text-suave">{dica}</span>}
    </label>
  )
}

interface EntradaDinheiroProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  centavos: number
  aoMudar: (centavos: number) => void
}

/**
 * Campo de valor em R$: os números entram pela direita, como na maquininha.
 * Digitar 1, 2, 5, 0 → R$ 0,01 → R$ 0,12 → R$ 1,25 → R$ 12,50
 */
export function EntradaDinheiro({ centavos, aoMudar, className = '', ...resto }: EntradaDinheiroProps) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={formatarReais(centavos)}
      onChange={(e) => aoMudar(centavosDeTexto(e.target.value))}
      onFocus={(e) => e.target.select()}
      className={`${estiloEntrada} text-right font-medium ${className}`}
      {...resto}
    />
  )
}

interface EntradaPorcentagemProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  /** ex: 4.99 */
  valor: number
  aoMudar: (valor: number) => void
}

/** Porcentagem com 2 casas, números entram pela direita: 4, 9, 9 → 0,04 → 0,49 → 4,99 % */
export function EntradaPorcentagem({ valor, aoMudar, className = '', ...resto }: EntradaPorcentagemProps) {
  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        onChange={(e) => {
          const digitos = e.target.value.replace(/\D/g, '').slice(-5)
          aoMudar(Math.min(9999, Number(digitos || 0)) / 100)
        }}
        onFocus={(e) => e.target.select()}
        className={`${estiloEntrada} pr-9 text-right font-medium ${className}`}
        {...resto}
      />
      <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-suave">%</span>
    </div>
  )
}

interface EntradaNumeroProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  valor: number
  aoMudar: (valor: number) => void
}

/** Número inteiro não negativo (quantidades, estoque) */
export function EntradaNumero({ valor, aoMudar, className = '', ...resto }: EntradaNumeroProps) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={String(valor)}
      onChange={(e) => {
        const digitos = e.target.value.replace(/\D/g, '').slice(0, 7)
        aoMudar(digitos ? Number(digitos) : 0)
      }}
      onFocus={(e) => e.target.select()}
      className={`${estiloEntrada} text-right ${className}`}
      {...resto}
    />
  )
}
