import type { Produto } from '../types/produto'
import type { ItemVenda, Venda } from '../types/venda'

/**
 * Margem sobre o preço de venda: quanto de cada real vendido é lucro (antes de taxas e despesas).
 * Ex: custo R$ 6, preço R$ 10 → 40%. Sem preço, não há margem (null).
 */
export function margemPercentual(precoCentavos: number, custoCentavos: number): number | null {
  if (precoCentavos <= 0) return null
  return ((precoCentavos - custoCentavos) / precoCentavos) * 100
}

/** Lucro bruto de uma unidade, em centavos */
export function lucroPorUnidade(precoCentavos: number, custoCentavos: number): number {
  return precoCentavos - custoCentavos
}

/** Selo "Repor": estoque abaixo do mínimo definido */
export function precisaRepor(produto: Pick<Produto, 'estoque' | 'estoqueMinimo'>): boolean {
  return produto.estoque < produto.estoqueMinimo
}

export interface TotaisVenda {
  subtotal: number
  total: number
  custo: number
  taxa: number
  lucro: number
}

/**
 * Regras da especificação (tudo em centavos):
 * total = soma dos itens − desconto
 * lucro = total − custo dos produtos − taxa do pagamento
 */
export function calcularVenda(itens: ItemVenda[], desconto: number, taxaPercentual: number): TotaisVenda {
  const subtotal = itens.reduce((soma, i) => soma + i.quantidade * i.precoUnitario, 0)
  const total = Math.max(0, subtotal - desconto)
  const custo = itens.reduce((soma, i) => soma + i.quantidade * i.custoUnitario, 0)
  // % convertida em centésimos inteiros (4,99% → 499) para a conta não ter erro de arredondamento
  const taxa = Math.round((total * Math.round(taxaPercentual * 100)) / 10000)
  return { subtotal, total, custo, taxa, lucro: total - custo - taxa }
}

/**
 * Quanto o estoque de cada produto muda ao trocar a venda "antes" pela "depois".
 * Criar: só "depois". Excluir: só "antes". Venda cancelada não mexe no estoque.
 * Ex: vender 3 → { produto: -3 }; cancelar essa venda → { produto: +3 }.
 */
export function variacoesEstoque(
  antes: Pick<Venda, 'itens' | 'status'> | undefined,
  depois: Pick<Venda, 'itens' | 'status'> | undefined,
): Map<string, number> {
  const variacoes = new Map<string, number>()
  const somar = (venda: typeof antes, sinal: 1 | -1) => {
    if (!venda || venda.status === 'cancelado') return
    for (const item of venda.itens) {
      variacoes.set(item.produtoId, (variacoes.get(item.produtoId) ?? 0) + sinal * item.quantidade)
    }
  }
  somar(antes, 1) // devolve o que a venda antiga tinha tirado
  somar(depois, -1) // tira o que a venda nova leva
  for (const [id, valor] of variacoes) if (valor === 0) variacoes.delete(id)
  return variacoes
}
