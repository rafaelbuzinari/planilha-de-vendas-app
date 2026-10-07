import type { ReactNode } from 'react'

interface Props {
  rotulo: string
  valor: string
  /** classes extras para o valor (ex: amarelo para "A receber") */
  destaque?: string
  children?: ReactNode
}

/** Cartão pequeno com um número de destaque (ex: "Recebido R$ 120,00") */
export function CartaoResumo({ rotulo, valor, destaque = '', children }: Props) {
  return (
    <div className="rounded-cartao border border-borda bg-cartao px-3 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] md:px-4 dark:shadow-none">
      <div className="text-xs text-suave">{rotulo}</div>
      <div className={`mt-0.5 truncate text-base font-bold md:text-lg ${destaque}`}>{valor}</div>
      {children}
    </div>
  )
}
