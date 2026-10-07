import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Receipt } from 'lucide-react'
import { Pagina } from '../components/Pagina'
import { TelaVazia } from '../components/TelaVazia'
import { DatasPersonalizadas, SelectPeriodo } from '../components/FiltroPeriodo'
import { Botao } from '../components/ui/Botao'
import { estiloEntrada } from '../components/ui/Campo'
import { CartaoResumo } from '../components/ui/CartaoResumo'
import { FormularioDespesa } from '../components/despesas/FormularioDespesa'
import { usePeriodo } from '../hooks/usePeriodo'
import { db } from '../lib/db'
import { formatarData } from '../lib/datas'
import { formatarReais } from '../lib/dinheiro'
import { totalDespesas } from '../lib/financeiro'
import { dentroDoIntervalo } from '../lib/periodo'
import { categoriasDespesa, infoCategoria } from '../lib/rotulos'
import type { CategoriaDespesa, Despesa } from '../types/despesa'

type Formulario = null | 'nova' | Despesa

export function Despesas() {
  const despesas = useLiveQuery(() => db.despesas.orderBy('data').reverse().toArray())
  const [formulario, setFormulario] = useState<Formulario>(null)
  const periodo = usePeriodo('mes')
  const { intervalo } = periodo
  const [categoria, setCategoria] = useState<'' | CategoriaDespesa>('')
  const [situacao, setSituacao] = useState<'' | 'paga' | 'apagar'>('')

  const filtradas = useMemo(
    () =>
      (despesas ?? []).filter(
        (d) =>
          dentroDoIntervalo(d.data, intervalo) &&
          (!categoria || d.categoria === categoria) &&
          (!situacao || (situacao === 'paga' ? d.paga : !d.paga)),
      ),
    [despesas, intervalo, categoria, situacao],
  )

  const total = totalDespesas(filtradas)
  const aPagar = totalDespesas(filtradas.filter((d) => !d.paga))

  const botaoNova = (
    <Botao onClick={() => setFormulario('nova')}>
      <Plus size={18} /> Nova despesa
    </Botao>
  )

  if (despesas === undefined) return null

  return (
    <Pagina titulo="Despesas" descricao="Contas e gastos do dia a dia" acoes={despesas.length > 0 && botaoNova}>
      {despesas.length === 0 ? (
        <TelaVazia
          icone={Receipt}
          titulo="Registre sua primeira despesa"
          texto="Aluguel, transporte, embalagem... As despesas entram no cálculo do seu lucro líquido."
          acao={botaoNova}
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <CartaoResumo rotulo="Total" valor={formatarReais(total)} />
            <CartaoResumo rotulo="Pagas" valor={formatarReais(total - aPagar)} />
            <CartaoResumo rotulo="A pagar" valor={formatarReais(aPagar)} destaque={aPagar > 0 ? 'text-amber-700 dark:text-pendente' : ''} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              <SelectPeriodo estado={periodo} />
              <select className={`${estiloEntrada} px-2.5 text-sm`} value={categoria} onChange={(e) => setCategoria(e.target.value as '' | CategoriaDespesa)} aria-label="Categoria">
                <option value="">Categoria</option>
                {categoriasDespesa.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.rotulo}
                  </option>
                ))}
              </select>
              <select className={`${estiloEntrada} px-2.5 text-sm`} value={situacao} onChange={(e) => setSituacao(e.target.value as '' | 'paga' | 'apagar')} aria-label="Situação">
                <option value="">Situação</option>
                <option value="paga">Pagas</option>
                <option value="apagar">A pagar</option>
              </select>
            </div>
            <DatasPersonalizadas estado={periodo} />
          </div>

          {filtradas.length === 0 ? (
            <p className="py-10 text-center text-suave">Nenhuma despesa encontrada com esses filtros.</p>
          ) : (
            <div className="divide-y divide-borda overflow-hidden rounded-cartao border border-borda bg-cartao shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:shadow-none">
              {filtradas.map((d) => {
                const { rotulo, icone: Icone } = infoCategoria(d.categoria)
                return (
                  <button key={d.id} type="button" onClick={() => setFormulario(d)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-fundo">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primaria/10 text-primaria">
                      <Icone size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold">{d.descricao}</span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            d.paga ? 'bg-positivo/15 text-emerald-700 dark:text-positivo' : 'bg-pendente/15 text-amber-700 dark:text-pendente'
                          }`}
                        >
                          {d.paga ? 'Paga' : 'A pagar'}
                        </span>
                      </div>
                      <div className="truncate text-sm text-suave">
                        {rotulo} · {d.fixa ? 'Fixa' : 'Variável'}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-semibold">{formatarReais(d.valor)}</div>
                      <div className="text-xs text-suave">{formatarData(d.data)}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}

      {formulario && (
        <FormularioDespesa key={formulario === 'nova' ? 'nova' : formulario.id} despesa={formulario === 'nova' ? undefined : formulario} aoFechar={() => setFormulario(null)} />
      )}
    </Pagina>
  )
}
