// Todo valor em dinheiro do app é guardado em CENTAVOS (número inteiro).
// Ex: R$ 12,50 → 1250. Assim nunca há erro de arredondamento (0,1 + 0,2 ≠ 0,3).

const formatoReais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** 1250 → "R$ 12,50" */
export function formatarReais(centavos: number): string {
  return formatoReais.format(centavos / 100)
}

/** Lê só os dígitos digitados e trata como centavos: "12,50" → 1250, "R$ 1.000,00" → 100000 */
export function centavosDeTexto(texto: string): number {
  const digitos = texto.replace(/\D/g, '').slice(0, 11) // até R$ 999.999.999,99
  return digitos ? Number(digitos) : 0
}

/** 45.456 → "45,5%" */
export function formatarPorcentagem(valor: number, casas = 1): string {
  return `${valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`
}
