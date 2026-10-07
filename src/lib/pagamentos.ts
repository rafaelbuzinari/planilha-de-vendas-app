import { Banknote, CreditCard, QrCode, type LucideIcon } from 'lucide-react'
import type { FormaPagamento, StatusVenda } from '../types/venda'

export const formasPagamento: { valor: FormaPagamento; rotulo: string; icone: LucideIcon }[] = [
  { valor: 'dinheiro', rotulo: 'Dinheiro', icone: Banknote },
  { valor: 'pix', rotulo: 'Pix', icone: QrCode },
  { valor: 'debito', rotulo: 'Débito', icone: CreditCard },
  { valor: 'credito', rotulo: 'Crédito', icone: CreditCard },
]

export const rotuloPagamento: Record<FormaPagamento, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  debito: 'Débito',
  credito: 'Crédito',
}

export const rotuloStatus: Record<StatusVenda, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
}

/** Cores fixas: verde = pago, amarelo = pendente, vermelho = cancelado */
export const estiloStatus: Record<StatusVenda, string> = {
  pago: 'bg-positivo/15 text-emerald-700 dark:text-positivo',
  pendente: 'bg-pendente/15 text-amber-700 dark:text-pendente',
  cancelado: 'bg-negativo/15 text-red-700 dark:text-negativo',
}
