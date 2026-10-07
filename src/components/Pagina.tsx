import type { ReactNode } from 'react'

interface Props {
  titulo: string
  descricao?: string
  /** botões que ficam ao lado do título (ex: "Nova venda") */
  acoes?: ReactNode
  children: ReactNode
}

export function Pagina({ titulo, descricao, acoes, children }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{titulo}</h1>
          {descricao && <p className="mt-1 text-suave">{descricao}</p>}
        </div>
        {acoes}
      </div>
      {children}
    </div>
  )
}
