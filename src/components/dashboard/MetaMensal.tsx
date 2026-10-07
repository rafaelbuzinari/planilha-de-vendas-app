import { Link } from 'react-router-dom'
import { Target } from 'lucide-react'
import { Medidor } from '../ui/Medidor'
import { formatarPorcentagem, formatarReais } from '../../lib/dinheiro'

const nomesMeses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

/** Progresso da meta de faturamento do mês atual (sempre o mês corrente, independente do filtro) */
export function MetaMensal({ meta, faturado, agora = new Date() }: { meta: number; faturado: number; agora?: Date }) {
  const mes = nomesMeses[agora.getMonth()]

  if (meta <= 0) {
    return (
      <section className="flex items-center gap-3 rounded-cartao border border-dashed border-borda bg-cartao p-4 text-sm">
        <Target size={20} className="shrink-0 text-primaria" />
        <span className="text-suave">
          Defina uma meta de faturamento para {mes}.{' '}
          <Link to="/configuracoes" className="font-semibold text-primaria">
            Definir meta
          </Link>
        </span>
      </section>
    )
  }

  const porcentagem = (faturado / meta) * 100
  const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate()
  const diasRestantes = ultimoDia - agora.getDate() + 1
  const falta = meta - faturado

  return (
    <section className="flex flex-col gap-3 rounded-cartao border border-borda bg-cartao p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:shadow-none">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">Meta de {mes}</h2>
        <div className="text-sm">
          <span className="font-bold">{formatarReais(faturado)}</span>
          <span className="text-suave"> de {formatarReais(meta)}</span>
        </div>
      </div>
      <Medidor porcentagem={porcentagem} rotuloAcessivel={`Meta de ${mes}`} corPreenchimento={porcentagem >= 100 ? 'bg-positivo' : 'bg-primaria'} />
      <p className="text-sm text-suave">
        {falta <= 0
          ? `Meta batida! 🎉 ${formatarReais(-falta)} acima da meta.`
          : `${formatarPorcentagem(porcentagem, 0)} da meta · faltam ${formatarReais(falta)} em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'} (${formatarReais(Math.ceil(falta / diasRestantes))} por dia)`}
      </p>
    </section>
  )
}
