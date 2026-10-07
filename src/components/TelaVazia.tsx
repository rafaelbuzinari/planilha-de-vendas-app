import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  icone: LucideIcon
  titulo: string
  texto: string
  /** botão de convite (ex: "Cadastrar produto") */
  acao?: ReactNode
  /** etapa da construção em que esta tela ganha vida (temporário) */
  etapa?: number
}

export function TelaVazia({ icone: Icone, titulo, texto, acao, etapa }: Props) {
  return (
    <div className="flex flex-col items-center rounded-cartao border border-borda bg-cartao px-6 py-14 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:shadow-none">
      <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-primaria/10 text-primaria">
        <Icone size={30} />
      </div>
      <h2 className="text-lg font-semibold">{titulo}</h2>
      <p className="mt-2 max-w-sm text-suave">{texto}</p>
      {acao && <div className="mt-6">{acao}</div>}
      {etapa && (
        <span className="mt-6 rounded-full border border-borda px-3 py-1 text-xs font-medium text-suave">
          Em construção · etapa {etapa}
        </span>
      )}
    </div>
  )
}
