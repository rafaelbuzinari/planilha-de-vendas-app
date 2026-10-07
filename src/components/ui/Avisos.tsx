import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CircleCheck, CircleX } from 'lucide-react'

type Tipo = 'sucesso' | 'erro'
interface Aviso {
  id: number
  texto: string
  tipo: Tipo
}

const ContextoAvisos = createContext<(texto: string, tipo?: Tipo) => void>(() => {})

/** Mensagens curtas que aparecem por 2,5 s: "Produto salvo" */
export function AvisosProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const proximoId = useRef(0)

  const avisar = useCallback((texto: string, tipo: Tipo = 'sucesso') => {
    const id = ++proximoId.current
    setAvisos((atuais) => [...atuais, { id, texto, tipo }])
    setTimeout(() => setAvisos((atuais) => atuais.filter((a) => a.id !== id)), 2500)
  }, [])

  return (
    <ContextoAvisos.Provider value={avisar}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 md:bottom-8">
          {avisos.map(({ id, texto, tipo }) => (
            <div
              key={id}
              role="status"
              className="animate-[surgir_.2s_ease-out] flex items-center gap-2.5 rounded-full bg-marinho px-4 py-2.5 text-sm font-medium text-white shadow-lg ring-1 ring-white/10"
            >
              {tipo === 'sucesso' ? <CircleCheck size={18} className="text-positivo" /> : <CircleX size={18} className="text-negativo" />}
              {texto}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ContextoAvisos.Provider>
  )
}

export function useAvisos() {
  return useContext(ContextoAvisos)
}
