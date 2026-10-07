import { formatarReais } from '../../lib/dinheiro'
import { formatarHora } from '../../lib/datas'
import { estiloStatus, formasPagamento, rotuloPagamento, rotuloStatus } from '../../lib/pagamentos'
import type { Venda } from '../../types/venda'

export function LinhaVenda({ venda, aoAbrir }: { venda: Venda; aoAbrir: () => void }) {
  const Icone = formasPagamento.find((f) => f.valor === venda.formaPagamento)!.icone
  const cancelada = venda.status === 'cancelado'
  const resumoItens = venda.itens.map((i) => `${i.quantidade}× ${i.nome}`).join(', ')

  return (
    <button type="button" onClick={aoAbrir} className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-fundo">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primaria/10 text-primaria">
        <Icone size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`truncate font-semibold ${cancelada ? 'text-suave' : ''}`}>{venda.cliente || 'Venda'}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${estiloStatus[venda.status]}`}>{rotuloStatus[venda.status]}</span>
        </div>
        <div className="truncate text-sm text-suave">{resumoItens}</div>
      </div>
      <div className="shrink-0 text-right">
        <div className={`font-semibold ${cancelada ? 'text-suave line-through' : ''}`}>{formatarReais(venda.total)}</div>
        <div className="text-xs text-suave">
          {formatarHora(venda.data)} · {rotuloPagamento[venda.formaPagamento]}
        </div>
      </div>
    </button>
  )
}
