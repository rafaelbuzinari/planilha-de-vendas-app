import type { FormaPagamento } from '../types/venda'

// Cores dos gráficos, conferidas com o validador de paletas (contraste e daltonismo).
// Tons de um azul só: verde, vermelho e amarelo ficam reservados para pago/cancelado/pendente.
// Cada série tem SEMPRE o mesmo tom (o Pix é sempre o mesmo azul), nunca pela posição.
// No escuro a ordem dos tons se inverte: o mais claro é o que mais aparece no fundo escuro.

export function coresGraficos(escuro: boolean) {
  return {
    faturamento: escuro ? '#1c5cab' : '#86b6ef',
    lucro: escuro ? '#86b6ef' : '#1c5cab',
    grade: escuro ? '#334155' : '#e2e8f0',
    eixo: escuro ? '#94a3b8' : '#64748b',
    superficie: escuro ? '#1e293b' : '#ffffff',
    pagamentos: (escuro
      ? { dinheiro: '#cde2fb', pix: '#86b6ef', debito: '#3987e5', credito: '#1c5cab' }
      : { dinheiro: '#0d366b', pix: '#1c5cab', debito: '#3987e5', credito: '#86b6ef' }) as Record<FormaPagamento, string>,
  }
}
