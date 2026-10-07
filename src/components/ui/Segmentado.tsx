import type { ReactNode } from 'react'

interface Opcao<T extends string> {
  valor: T
  rotulo: ReactNode
  /** classes quando selecionado (padrão: cor principal) */
  estiloAtivo?: string
}

interface Props<T extends string> {
  opcoes: Opcao<T>[]
  valor: T
  aoMudar: (valor: T) => void
  rotuloAcessivel: string
}

/** Botões lado a lado em que só um fica selecionado (ex: forma de pagamento) */
export function Segmentado<T extends string>({ opcoes, valor, aoMudar, rotuloAcessivel }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={rotuloAcessivel} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${opcoes.length}, minmax(0, 1fr))` }}>
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === valor
        return (
          <button
            key={opcao.valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => aoMudar(opcao.valor)}
            className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-cartao border px-1 py-2 text-sm font-medium transition active:scale-[0.97] ${
              ativo ? (opcao.estiloAtivo ?? 'border-primaria bg-primaria text-white') : 'border-borda bg-cartao text-suave hover:text-texto'
            }`}
          >
            {opcao.rotulo}
          </button>
        )
      })}
    </div>
  )
}
