import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import { useEscuro } from '../../hooks/useTema'
import { coresGraficos } from '../../lib/coresGraficos'
import { formatarPorcentagem, formatarReais } from '../../lib/dinheiro'
import { formasPagamento } from '../../lib/pagamentos'
import type { FormaPagamento } from '../../types/venda'

/** Rosca por forma de pagamento, com a lista de valores e % ao lado (a cor nunca fica sozinha) */
export function GraficoPagamentos({ totais }: { totais: Record<FormaPagamento, number> }) {
  const cores = coresGraficos(useEscuro())
  const total = Object.values(totais).reduce((s, v) => s + v, 0)
  const dados = formasPagamento.map((f) => ({ ...f, total: totais[f.valor] }))

  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-cartao border border-borda bg-cartao p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:shadow-none">
      <h2 className="font-semibold">Formas de pagamento</h2>
      {total === 0 ? (
        <p className="py-16 text-center text-sm text-suave">Nenhuma venda paga neste período.</p>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col">
          <div className="relative size-36 shrink-0 md:size-40" role="img" aria-label="Gráfico de rosca das formas de pagamento">
            <PieChart responsive style={{ width: '100%', height: '100%' }}>
              <Pie
                data={dados.filter((d) => d.total > 0)}
                dataKey="total"
                nameKey="rotulo"
                innerRadius="62%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                stroke={cores.superficie}
                strokeWidth={2}
                isAnimationActive={false}
              >
                {dados
                  .filter((d) => d.total > 0)
                  .map((d) => (
                    <Cell key={d.valor} fill={cores.pagamentos[d.valor]} />
                  ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="rounded-lg border border-borda bg-cartao px-3 py-2 text-sm shadow-lg">
                      <span className="text-suave">{payload[0].name}</span>{' '}
                      <span className="font-semibold">{formatarReais(Number(payload[0].value))}</span>
                    </div>
                  ) : null
                }
              />
            </PieChart>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] text-suave">Total</span>
              <span className="text-sm font-bold">{formatarReais(total).replace(/,\d\d$/, '')}</span>
            </div>
          </div>

          <ul className="flex w-full min-w-0 flex-col gap-2.5">
            {dados.map((d) => (
              <li key={d.valor} className="flex items-center gap-2 text-sm">
                <span className="size-3 shrink-0 rounded-sm" style={{ background: cores.pagamentos[d.valor] }} />
                <span className="flex-1 truncate">{d.rotulo}</span>
                <span className="font-semibold">{formatarReais(d.total)}</span>
                <span className="w-10 text-right text-xs text-suave">{formatarPorcentagem((d.total / total) * 100, 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
