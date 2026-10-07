import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import './lib/tema'
import { Layout } from './components/Layout'
import { AvisosProvider } from './components/ui/Avisos'
import { Dashboard } from './pages/Dashboard'
import { Vendas } from './pages/Vendas'
import { Produtos } from './pages/Produtos'
import { Investimentos } from './pages/Investimentos'
import { Despesas } from './pages/Despesas'
import { Configuracoes } from './pages/Configuracoes'

async function iniciar() {
  // Só na versão de demonstração (VITE_DEMO=1, usada para tirar fotos das telas): começa com dados de exemplo.
  // Na versão normal este bloco nem entra no app.
  if (import.meta.env.VITE_DEMO === '1') {
    const [{ db }, { substituirTudo }, { gerarDadosExemplo }] = await Promise.all([import('./lib/db'), import('./lib/backup'), import('./lib/exemplo')])
    if ((await db.vendas.count()) === 0) await substituirTudo(gerarDadosExemplo())
  }

  // HashRouter (endereços com #/): funciona offline e em hospedagem simples como o GitHub Pages
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AvisosProvider>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="vendas" element={<Vendas />} />
              <Route path="produtos" element={<Produtos />} />
              <Route path="investimentos" element={<Investimentos />} />
              <Route path="despesas" element={<Despesas />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>
          </Routes>
        </HashRouter>
      </AvisosProvider>
    </StrictMode>,
  )
}

iniciar()
