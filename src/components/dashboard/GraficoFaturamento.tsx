import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { useEscuro } from '../../hooks/useTema'
import { coresGraficos } from '../../lib/coresGraficos'
import { formatarReais } from '../../lib/dinheiro'
import type { Agrupamento, PontoSerie } from '../../lib/dashboard'

const compacto = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 })

const subtitulos: Record<Agrupamento, string> = { hora: 'por hora', dia: 'por dia', mes: 'por mês' }

/** Barras de faturamento e lucro lado a lado, num eixo só (os dois são em R$) */
export function GraficoFaturamento({ pontos, agrupamento }: { pontos: PontoSerie[]; agrupamento: Agrupamento }) {
  const cores = coresGraficos(useEscuro())
  const vazio = pontos.every((p) => p.faturamento === 0)

  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-cartao border border-borda bg-cartao p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Faturamento x lucro</h2>
          <p className="text-xs text-suave">{subtitulos[agrupamento]} · lucro das vendas, antes das despesas</p>
        </div>
        <div className="flex gap-4 text-xs text-suave">
          <Legenda cor={cores.faturamento} texto="Faturamento" />
          <Legenda cor={cores.lucro} texto="Lucro" />
        </div>
      </div>

      {vazio ? (
        <p className="py-16 text-center text-sm text-suave">Nenhuma venda paga neste período.</p>
      ) : (
        <div className="h-60 min-w-0 md:h-72" role="img" aria-label="Gráfico de barras com faturamento e lucro">
          {/* "responsive": o gráfico acompanha a largura do cartão */}
          <BarChart responsive style={{ width: '100%', height: '100%' }} data={pontos} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={2} barCategoryGap="20%">
            <CartesianGrid vertical={false} stroke={cores.grade} />
            <XAxis dataKey="rotulo" tickLine={false} axisLine={{ stroke: cores.grade }} tick={{ fill: cores.eixo, fontSize: 11 }} minTickGap={12} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: cores.eixo, fontSize: 11 }}
              tickFormatter={(v: number) => compacto.format(v / 100)}
              width={64}
            />
            <Tooltip
              cursor={{ fill: cores.grade, opacity: 0.5 }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="rounded-lg border border-borda bg-cartao px-3 py-2 text-sm shadow-lg">
                    <div className="mb-1 font-semibold">{label}</div>
                    {payload.map((p) => (
                      <div key={String(p.dataKey)} className="flex items-center gap-2">
                        <span className="size-2.5 rounded-sm" style={{ background: p.color }} />
                        <span className="text-suave">{p.dataKey === 'faturamento' ? 'Faturamento' : 'Lucro'}</span>
                        <span className="ml-auto pl-3 font-semibold">{formatarReais(Number(p.value))}</span>
                      </div>
                    ))}
                  </div>
                ) : null
              }
            />
            <Bar dataKey="faturamento" fill={cores.faturamento} radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="lucro" fill={cores.lucro} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </div>
      )}
    </section>
  )
}

function Legenda({ cor, texto }: { cor: string; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-3 rounded-sm" style={{ background: cor }} />
      {texto}
    </span>
  )
}
