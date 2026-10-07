import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Ellipsis, X } from 'lucide-react'
import { itensMenu } from '../lib/navegacao'
import { BotaoTema } from './BotaoTema'
import { Logo } from './Logo'
import { useConfiguracoes } from '../hooks/useConfiguracoes'

const itensBarra = itensMenu.filter((item) => item.naBarra)
const itensMais = itensMenu.filter((item) => !item.naBarra)

export function Layout() {
  const [maisAberto, setMaisAberto] = useState(false)
  const nome = useConfiguracoes().nomeNegocio || 'Planilha de Vendas'
  const { pathname } = useLocation()
  const emItemDoMais = itensMais.some((item) => item.caminho === pathname)

  return (
    <div className="min-h-dvh md:flex">
      {/* Menu lateral — computador */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-menu px-4 py-6 text-white md:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <Logo />
          <span className="truncate text-lg font-semibold">{nome}</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {itensMenu.map(({ caminho, rotulo, icone: Icone }) => (
            <NavLink
              key={caminho}
              to={caminho}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-cartao px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-primaria text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icone size={20} />
              {rotulo}
            </NavLink>
          ))}
        </nav>
        <BotaoTema className="self-start" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topo — celular */}
        <header className="sticky top-0 z-20 flex items-center justify-between bg-menu px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 text-white md:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <Logo pequeno />
            <span className="truncate text-lg font-semibold">{nome}</span>
          </div>
          <BotaoTema />
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28 md:px-8 md:pt-10 md:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Barra inferior — celular */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-borda bg-cartao pb-[env(safe-area-inset-bottom)] md:hidden">
        {itensBarra.map(({ caminho, rotulo, icone: Icone }) => (
          <NavLink
            key={caminho}
            to={caminho}
            end
            onClick={() => setMaisAberto(false)}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${isActive ? 'text-primaria' : 'text-suave'}`
            }
          >
            <Icone size={22} />
            {rotulo}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMaisAberto(!maisAberto)}
          className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
            emItemDoMais || maisAberto ? 'text-primaria' : 'text-suave'
          }`}
        >
          <Ellipsis size={22} />
          Mais
        </button>
      </nav>

      {/* Painel "Mais" — celular */}
      {maisAberto && (
        <div className="fixed inset-0 z-20 md:hidden" onClick={() => setMaisAberto(false)}>
          <div className="absolute inset-0 bg-marinho/40" />
          <div
            className="absolute inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] mx-3 rounded-cartao border border-borda bg-cartao p-2 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-semibold text-suave">Mais opções</span>
              <button type="button" onClick={() => setMaisAberto(false)} className="text-suave" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            {itensMais.map(({ caminho, rotulo, icone: Icone }) => (
              <NavLink
                key={caminho}
                to={caminho}
                onClick={() => setMaisAberto(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium ${
                    isActive ? 'bg-primaria/10 text-primaria' : 'text-texto'
                  }`
                }
              >
                <Icone size={20} />
                {rotulo}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
