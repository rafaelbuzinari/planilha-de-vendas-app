import type { LucideIcon } from 'lucide-react'

interface Props<T extends string> {
  opcoes: { valor: T; rotulo: string; icone?: LucideIcon }[]
  valor: T
  aoMudar: (valor: T) => void
  rotuloAcessivel: string
}

/** Etiquetas que quebram linha, só uma selecionada (para listas com muitas opções) */
export function Chips<T extends string>({ opcoes, valor, aoMudar, rotuloAcessivel }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={rotuloAcessivel} className="flex flex-wrap gap-2">
      {opcoes.map(({ valor: v, rotulo, icone: Icone }) => {
        const ativo = v === valor
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => aoMudar(v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition active:scale-[0.97] ${
              ativo ? 'border-primaria bg-primaria text-white' : 'border-borda bg-cartao text-suave hover:text-texto'
            }`}
          >
            {Icone && <Icone size={16} />}
            {rotulo}
          </button>
        )
      })}
    </div>
  )
}
