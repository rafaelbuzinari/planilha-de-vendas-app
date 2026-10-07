import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CircleCheck, Clock, PackageX, Receipt } from 'lucide-react'
import { formatarReais } from '../../lib/dinheiro'
import type { Produto } from '../../types/produto'

interface Props {
  paraRepor: Produto[]
  vendasPendentes: { quantidade: number; total: number }
  despesasAPagar: { quantidade: number; total: number }
}

/** Avisos que pedem ação: estoque baixo, vendas a receber, contas a pagar (de todo o período) */
export function Alertas({ paraRepor, vendasPendentes, despesasAPagar }: Props) {
  const nada = paraRepor.length === 0 && vendasPendentes.quantidade === 0 && despesasAPagar.quantidade === 0
  const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

  return (
    <section className="flex flex-col gap-3 rounded-cartao border border-borda bg-cartao p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:shadow-none">
      <h2 className="font-semibold">Alertas</h2>
      {nada ? (
        <div className="flex items-center gap-2.5 py-6 text-sm text-suave">
          <CircleCheck size={20} className="text-positivo" /> Tudo em dia por aqui.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {vendasPendentes.quantidade > 0 && (
            <Alerta para="/vendas" icone={<Clock size={18} />}>
              <strong>{plural(vendasPendentes.quantidade, 'venda pendente', 'vendas pendentes')}</strong> · {formatarReais(vendasPendentes.total)} a receber
            </Alerta>
          )}
          {despesasAPagar.quantidade > 0 && (
            <Alerta para="/despesas" icone={<Receipt size={18} />}>
              <strong>{plural(despesasAPagar.quantidade, 'despesa a pagar', 'despesas a pagar')}</strong> · {formatarReais(despesasAPagar.total)}
            </Alerta>
          )}
          {paraRepor.map((p) => (
            <Alerta key={p.id} para="/produtos" icone={<PackageX size={18} />}>
              <strong>Repor {p.nome}</strong> · {p.estoque} un. (mínimo {p.estoqueMinimo})
            </Alerta>
          ))}
        </ul>
      )}
    </section>
  )
}

function Alerta({ para, icone, children }: { para: string; icone: ReactNode; children: ReactNode }) {
  return (
    <li>
      <Link to={para} className="flex items-center gap-3 rounded-lg bg-pendente/10 px-3 py-2.5 text-sm transition hover:bg-pendente/15">
        <span className="shrink-0 text-amber-700 dark:text-pendente">{icone}</span>
        <span className="min-w-0">{children}</span>
      </Link>
    </li>
  )
}
