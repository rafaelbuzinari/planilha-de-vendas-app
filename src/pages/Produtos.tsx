import { useMemo, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Package, Plus, Search } from 'lucide-react'
import { Pagina } from '../components/Pagina'
import { TelaVazia } from '../components/TelaVazia'
import { Botao } from '../components/ui/Botao'
import { estiloEntrada } from '../components/ui/Campo'
import { CartaoProduto } from '../components/produtos/CartaoProduto'
import { FormularioProduto } from '../components/produtos/FormularioProduto'
import { db } from '../lib/db'
import { precisaRepor } from '../lib/calculos'
import { normalizarBusca, ordenarPorNome } from '../lib/produtos'
import type { Produto } from '../types/produto'

/** null = fechado; 'novo' = cadastro; Produto = edição */
type Formulario = null | 'novo' | Produto

const TODAS = ''
const REPOR = '__repor__'

export function Produtos() {
  const produtos = useLiveQuery(() => db.produtos.toArray().then(ordenarPorNome))
  const [formulario, setFormulario] = useState<Formulario>(null)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState(TODAS)

  const categorias = useMemo(
    () => [...new Set((produtos ?? []).map((p) => p.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [produtos],
  )
  const qtdRepor = (produtos ?? []).filter(precisaRepor).length

  const visiveis = useMemo(() => {
    const termo = normalizarBusca(busca)
    return (produtos ?? []).filter((p) => {
      if (filtro === REPOR && !precisaRepor(p)) return false
      if (filtro !== TODAS && filtro !== REPOR && p.categoria !== filtro) return false
      return !termo || normalizarBusca(`${p.nome} ${p.categoria}`).includes(termo)
    })
  }, [produtos, busca, filtro])

  const botaoNovo = (
    <Botao onClick={() => setFormulario('novo')}>
      <Plus size={18} /> Novo produto
    </Botao>
  )

  // ainda carregando do banco
  if (produtos === undefined) return null

  return (
    <Pagina
      titulo="Produtos"
      descricao={
        produtos.length === 0
          ? 'Seu catálogo e estoque'
          : `${produtos.length} ${produtos.length === 1 ? 'produto' : 'produtos'}${qtdRepor ? ` · ${qtdRepor} para repor` : ''}`
      }
      acoes={produtos.length > 0 && botaoNovo}
    >
      {produtos.length === 0 ? (
        <TelaVazia
          icone={Package}
          titulo="Cadastre seu primeiro produto"
          texto="Com os produtos cadastrados, o preço, o custo e o estoque entram sozinhos nas vendas."
          acao={botaoNovo}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-suave" />
              <input
                type="search"
                className={`${estiloEntrada} pl-10`}
                placeholder="Buscar produto"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            {(categorias.length > 0 || qtdRepor > 0) && (
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
                <Filtro ativo={filtro === TODAS} onClick={() => setFiltro(TODAS)}>
                  Todos
                </Filtro>
                {qtdRepor > 0 && (
                  <Filtro ativo={filtro === REPOR} onClick={() => setFiltro(REPOR)}>
                    Para repor ({qtdRepor})
                  </Filtro>
                )}
                {categorias.map((c) => (
                  <Filtro key={c} ativo={filtro === c} onClick={() => setFiltro(c)}>
                    {c}
                  </Filtro>
                ))}
              </div>
            )}
          </div>

          {visiveis.length === 0 ? (
            <p className="py-10 text-center text-suave">Nenhum produto encontrado.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visiveis.map((p) => (
                <CartaoProduto key={p.id} produto={p} aoAbrir={() => setFormulario(p)} />
              ))}
            </div>
          )}
        </>
      )}

      {formulario && (
        <FormularioProduto
          // key: garante formulário limpo ao trocar de produto
          key={formulario === 'novo' ? 'novo' : formulario.id}
          produto={formulario === 'novo' ? undefined : formulario}
          categorias={categorias}
          aoFechar={() => setFormulario(null)}
        />
      )}
    </Pagina>
  )
}

function Filtro({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        ativo ? 'border-primaria bg-primaria text-white' : 'border-borda bg-cartao text-suave hover:text-texto'
      }`}
    >
      {children}
    </button>
  )
}
