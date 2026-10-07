import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { formatarPorcentagem } from '../../lib/dinheiro'

interface Props {
  rotulo: string
  valor: string
  /** variação vs período anterior: em % ou, para a margem, em pontos percentuais */
  variacao?: number | null
  unidadeVariacao?: '%' | 'p.p.'
  /** "bom" = subir é bom (verde); "neutro" = só informa, sem cor */
  sentido?: 'bom' | 'neutro'
  /** texto pequeno no lugar da variação (ex: "desde o início") */
  nota?: string
  destaqueValor?: string
}

/** Cartão de número com a seta de variação (verde subiu / vermelho caiu) */
export function CartaoMetrica({ rotulo, valor, variacao, unidadeVariacao = '%', sentido = 'bom', nota, destaqueValor = '' }: Props) {
  let rodape = <span className="text-suave">{nota ?? 'sem comparação'}</span>
  if (variacao !== undefined && variacao !== null && Number.isFinite(variacao)) {
    const subiu = variacao > 0.05
    const caiu = variacao < -0.05
    const cor = sentido === 'neutro' || (!subiu && !caiu) ? 'text-suave' : subiu ? 'text-emerald-700 dark:text-positivo' : 'text-red-700 dark:text-negativo'
    const Seta = caiu ? ArrowDownRight : ArrowUpRight
    const numero = unidadeVariacao === '%' ? formatarPorcentagem(Math.abs(variacao), 0) : `${Math.abs(variacao).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} p.p.`
    rodape = (
      <span className={`inline-flex items-center gap-0.5 font-medium ${cor}`}>
        {(subiu || caiu) && <Seta size={14} aria-label={subiu ? 'subiu' : 'caiu'} />}
        {subiu || caiu ? numero : 'igual'}
        <span className="ml-1 font-normal text-suave">vs. anterior</span>
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-1 rounded-cartao border border-borda bg-cartao p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:shadow-none">
      <div className="text-xs font-medium text-suave">{rotulo}</div>
      <div className={`truncate text-xl font-bold tracking-tight md:text-2xl ${destaqueValor}`}>{valor}</div>
      <div className="truncate text-xs">{rodape}</div>
    </div>
  )
}
