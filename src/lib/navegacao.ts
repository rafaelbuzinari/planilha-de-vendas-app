import { LayoutDashboard, Package, PiggyBank, Receipt, Settings, ShoppingCart, type LucideIcon } from 'lucide-react'

export interface ItemMenu {
  caminho: string
  rotulo: string
  icone: LucideIcon
  /** aparece direto na barra inferior do celular (os outros ficam em "Mais") */
  naBarra: boolean
}

export const itensMenu: ItemMenu[] = [
  { caminho: '/', rotulo: 'Início', icone: LayoutDashboard, naBarra: true },
  { caminho: '/vendas', rotulo: 'Vendas', icone: ShoppingCart, naBarra: true },
  { caminho: '/produtos', rotulo: 'Produtos', icone: Package, naBarra: true },
  { caminho: '/despesas', rotulo: 'Despesas', icone: Receipt, naBarra: true },
  { caminho: '/investimentos', rotulo: 'Investimentos', icone: PiggyBank, naBarra: false },
  { caminho: '/configuracoes', rotulo: 'Configurações', icone: Settings, naBarra: false },
]
