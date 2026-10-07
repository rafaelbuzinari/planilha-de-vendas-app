import { Moon, Sun, SunMoon } from 'lucide-react'
import { useTema } from '../hooks/useTema'

const visual = {
  auto: { icone: SunMoon, rotulo: 'Auto' },
  claro: { icone: Sun, rotulo: 'Claro' },
  escuro: { icone: Moon, rotulo: 'Escuro' },
}

export function BotaoTema({ className = '' }: { className?: string }) {
  const { preferencia, alternar } = useTema()
  const { icone: Icone, rotulo } = visual[preferencia]

  return (
    <button
      type="button"
      onClick={alternar}
      title="Trocar tema: Auto (segue o aparelho) → Claro → Escuro"
      className={`inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-white/15 active:scale-95 ${className}`}
    >
      <Icone size={16} />
      {rotulo}
    </button>
  )
}
