import { Package } from 'lucide-react'
import { margemPercentual, precisaRepor } from '../../lib/calculos'
import { formatarPorcentagem, formatarReais } from '../../lib/dinheiro'
import type { Produto } from '../../types/produto'

export function CartaoProduto({ produto, aoAbrir }: { produto: Produto; aoAbrir: () => void }) {
  const margem = margemPercentual(produto.preco, produto.custo)
  const repor = precisaRepor(produto)

  return (
    <button
      type="button"
      onClick={aoAbrir}
      className="flex w-full flex-col gap-4 rounded-cartao border border-borda bg-cartao p-4 text-left shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition hover:border-primaria/40 active:scale-[0.99] dark:shadow-none"
    >
      <div className="flex w-full items-start gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-fundo text-suave">
          {produto.foto ? <img src={produto.foto} alt="" className="size-full object-cover" /> : <Package size={24} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{produto.nome}</div>
          <div className="truncate text-sm text-suave">{produto.categoria || 'Sem categoria'}</div>
        </div>
        {repor && (
          <span className="shrink-0 rounded-full bg-pendente/15 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-pendente">
            Repor
          </span>
        )}
      </div>

      <dl className="grid w-full grid-cols-3 gap-2 border-t border-borda pt-3 text-sm">
        <div>
          <dt className="text-xs text-suave">Preço</dt>
          <dd className="font-semibold">{formatarReais(produto.preco)}</dd>
        </div>
        <div>
          <dt className="text-xs text-suave">Margem</dt>
          <dd className={`font-semibold ${margem !== null && margem < 0 ? 'text-negativo' : ''}`}>
            {margem === null ? '—' : formatarPorcentagem(margem, 0)}
          </dd>
        </div>
        <div className="text-right">
          <dt className="text-xs text-suave">Estoque</dt>
          <dd className={`font-semibold ${repor ? 'text-amber-700 dark:text-pendente' : ''}`}>{produto.estoque} un.</dd>
        </div>
      </dl>
    </button>
  )
}
