import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PiggyBank, Plus } from 'lucide-react'
import { Pagina } from '../components/Pagina'
import { TelaVazia } from '../components/TelaVazia'
import { Botao } from '../components/ui/Botao'
import { Medidor } from '../components/ui/Medidor'
import { FormularioInvestimento } from '../components/investimentos/FormularioInvestimento'
import { db } from '../lib/db'
import { formatarData } from '../lib/datas'
import { formatarPorcentagem, formatarReais } from '../lib/dinheiro'
import { lucroLiquido, retornoInvestimento, somarPor, totalInvestido } from '../lib/financeiro'
import { infoTipo } from '../lib/rotulos'
import type { Investimento } from '../types/investimento'

type Formulario = null | 'novo' | Investimento

const sombra = 'shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:shadow-none'

export function Investimentos() {
  const investimentos = useLiveQuery(() => db.investimentos.orderBy('data').reverse().toArray())
  const vendas = useLiveQuery(() => db.vendas.toArray())
  const despesas = useLiveQuery(() => db.despesas.toArray())
  const [formulario, setFormulario] = useState<Formulario>(null)

  const investido = totalInvestido(investimentos ?? [])
  // retorno usa o lucro líquido acumulado desde o início (não depende de período)
  const lucroAcumulado = lucroLiquido(vendas ?? [], despesas ?? [])
  const retorno = retornoInvestimento(lucroAcumulado, investido)
  const porTipo = useMemo(() => somarPor(investimentos ?? [], (i) => i.tipo, (i) => i.valor), [investimentos])
  const maiorTipo = porTipo[0]?.total ?? 0

  const botaoNovo = (
    <Botao onClick={() => setFormulario('novo')}>
      <Plus size={18} /> Novo investimento
    </Botao>
  )

  if (investimentos === undefined || vendas === undefined || despesas === undefined) return null

  return (
    <Pagina titulo="Investimentos" descricao="O que você colocou no negócio e quanto já voltou" acoes={investimentos.length > 0 && botaoNovo}>
      {investimentos.length === 0 ? (
        <TelaVazia
          icone={PiggyBank}
          titulo="Registre seu primeiro investimento"
          texto="Estoque inicial, equipamentos, marketing... Acompanhe quanto do investimento já voltou em lucro."
          acao={botaoNovo}
        />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {/* Total investido */}
            <div className={`rounded-cartao border border-borda bg-cartao p-5 ${sombra}`}>
              <div className="text-sm text-suave">Total investido</div>
              <div className="mt-1 text-3xl font-bold tracking-tight">{formatarReais(investido)}</div>
              <div className="mt-1 text-sm text-suave">
                {investimentos.length} {investimentos.length === 1 ? 'investimento' : 'investimentos'}
              </div>
            </div>

            {/* Retorno do investimento */}
            <div className={`flex flex-col gap-3 rounded-cartao border border-borda bg-cartao p-5 ${sombra}`}>
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-sm text-suave">Já voltou em lucro</div>
                <div className={`text-2xl font-bold ${retorno !== null && retorno < 0 ? 'text-negativo' : ''}`}>
                  {retorno === null ? '—' : formatarPorcentagem(retorno, 0)}
                </div>
              </div>
              <Medidor
                porcentagem={retorno ?? 0}
                rotuloAcessivel="Quanto do investimento já voltou em lucro"
                corPreenchimento={retorno !== null && retorno >= 100 ? 'bg-positivo' : 'bg-primaria'}
              />
              <p className="text-sm text-suave">
                {lucroAcumulado <= 0
                  ? `Lucro acumulado de ${formatarReais(lucroAcumulado)}: ainda não começou a pagar o investimento.`
                  : lucroAcumulado < investido
                    ? `Lucro acumulado de ${formatarReais(lucroAcumulado)}. Faltam ${formatarReais(investido - lucroAcumulado)} para recuperar tudo.`
                    : `Investimento recuperado! 🎉 ${formatarReais(lucroAcumulado - investido)} de lucro além do que foi investido.`}
              </p>
            </div>
          </div>

          {/* Investido por tipo: barras horizontais, uma cor só, da maior para a menor */}
          <section className={`rounded-cartao border border-borda bg-cartao p-5 ${sombra}`}>
            <h2 className="mb-4 font-semibold">Por tipo</h2>
            <ul className="flex flex-col gap-4">
              {porTipo.map(({ chave, total }) => {
                const { rotulo, icone: Icone } = infoTipo(chave)
                return (
                  <li key={chave} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <Icone size={16} className="text-suave" />
                        {rotulo}
                      </span>
                      <span>
                        <span className="font-semibold">{formatarReais(total)}</span>
                        <span className="ml-2 text-suave">{formatarPorcentagem((total / investido) * 100, 0)}</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-primaria/10">
                      <div className="h-full rounded-full bg-primaria" style={{ width: `${(total / maiorTipo) * 100}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Lista */}
          <section className="flex flex-col gap-2">
            <h2 className="px-1 text-sm font-semibold text-suave">Histórico</h2>
            <div className={`divide-y divide-borda overflow-hidden rounded-cartao border border-borda bg-cartao ${sombra}`}>
              {investimentos.map((inv) => {
                const { rotulo, icone: Icone } = infoTipo(inv.tipo)
                return (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => setFormulario(inv)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-fundo"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primaria/10 text-primaria">
                      <Icone size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{inv.descricao}</div>
                      <div className="text-sm text-suave">{rotulo}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-semibold">{formatarReais(inv.valor)}</div>
                      <div className="text-xs text-suave">{formatarData(inv.data)}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        </>
      )}

      {formulario && (
        <FormularioInvestimento
          key={formulario === 'novo' ? 'novo' : formulario.id}
          investimento={formulario === 'novo' ? undefined : formulario}
          aoFechar={() => setFormulario(null)}
        />
      )}
    </Pagina>
  )
}
