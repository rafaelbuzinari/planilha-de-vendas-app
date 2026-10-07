import {
  Boxes,
  Building2,
  Bus,
  CircleEllipsis,
  Home,
  Landmark,
  Megaphone,
  Package,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { TipoInvestimento } from '../types/investimento'
import type { CategoriaDespesa } from '../types/despesa'

export const tiposInvestimento: { valor: TipoInvestimento; rotulo: string; icone: LucideIcon }[] = [
  { valor: 'estoque', rotulo: 'Estoque', icone: Boxes },
  { valor: 'equipamento', rotulo: 'Equipamento', icone: Wrench },
  { valor: 'marketing', rotulo: 'Marketing', icone: Megaphone },
  { valor: 'estrutura', rotulo: 'Estrutura', icone: Building2 },
  { valor: 'outros', rotulo: 'Outros', icone: CircleEllipsis },
]

export const categoriasDespesa: { valor: CategoriaDespesa; rotulo: string; icone: LucideIcon }[] = [
  { valor: 'aluguel', rotulo: 'Aluguel', icone: Home },
  { valor: 'energia', rotulo: 'Energia', icone: Zap },
  { valor: 'internet', rotulo: 'Internet', icone: Wifi },
  { valor: 'transporte', rotulo: 'Transporte', icone: Bus },
  { valor: 'embalagem', rotulo: 'Embalagem', icone: Package },
  { valor: 'impostos', rotulo: 'Impostos', icone: Landmark },
  { valor: 'outros', rotulo: 'Outros', icone: CircleEllipsis },
]

export function infoTipo(tipo: TipoInvestimento) {
  return tiposInvestimento.find((t) => t.valor === tipo)!
}

export function infoCategoria(categoria: CategoriaDespesa) {
  return categoriasDespesa.find((c) => c.valor === categoria)!
}
