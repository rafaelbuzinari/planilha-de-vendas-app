import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface Props {
  titulo: string
  aberto: boolean
  aoFechar: () => void
  children: ReactNode
  /** área fixa no rodapé (botões Salvar/Cancelar) */
  rodape?: ReactNode
  tamanho?: 'pequeno' | 'medio'
}

/** No celular abre de baixo para cima (como uma gaveta); no computador, centralizado */
export function Modal({ titulo, aberto, aoFechar, children, rodape, tamanho = 'medio' }: Props) {
  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar()
    document.addEventListener('keydown', aoTeclar)
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = overflowAnterior
    }
  }, [aberto, aoFechar])

  if (!aberto) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="absolute inset-0 bg-marinho/50 backdrop-blur-[2px]" onClick={aoFechar} />
      <div
        className={`relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-cartao shadow-xl md:rounded-2xl ${
          tamanho === 'pequeno' ? 'md:max-w-sm' : 'md:max-w-lg'
        }`}
      >
        <div className="flex items-center justify-between border-b border-borda px-5 py-4">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button type="button" onClick={aoFechar} className="rounded-full p-1.5 text-suave hover:bg-fundo" aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {rodape && (
          <div className="flex gap-3 border-t border-borda px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{rodape}</div>
        )}
      </div>
    </div>,
    document.body,
  )
}
