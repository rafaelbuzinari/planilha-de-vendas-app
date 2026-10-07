import { formatarReais } from '../../lib/dinheiro'
import type { ProdutoVendido } from '../../lib/dashboard'

/** Os 5 mais vendidos: barras deitadas numa cor só, do maior para o menor */
export function TopProdutos({ produtos }: { produtos: ProdutoVendido[] }) {
  const maior = produtos[0]?.quantidade ?? 0
  return (
    <section className="flex flex-col gap-4 rounded-cartao border border-borda bg-cartao p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:shadow-none">
      <h2 className="font-semibold">Mais vendidos</h2>
      {produtos.length === 0 ? (
        <p className="py-8 text-center text-sm text-suave">Nenhuma venda neste período.</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {produtos.map((p, i) => (
            <li key={p.produtoId} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium">
                  <span className="mr-2 text-suave">{i + 1}.</span>
                  {p.nome}
                </span>
                <span className="shrink-0">
                  <span className="font-semibold">{p.quantidade} un.</span>
                  <span className="ml-2 text-xs text-suave">{formatarReais(p.faturamento)}</span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-primaria/10">
                <div className="h-full rounded-full bg-primaria" style={{ width: `${(p.quantidade / maior) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
