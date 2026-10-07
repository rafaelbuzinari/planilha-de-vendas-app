import { calcularVenda } from './calculos'
import { configuracoesPadrao } from './configuracoes'
import type { DadosApp } from './backup'
import type { Produto } from '../types/produto'
import type { FormaPagamento, ItemVenda, StatusVenda, Venda } from '../types/venda'
import type { Investimento } from '../types/investimento'
import type { Despesa } from '../types/despesa'

/** Sorteio com "semente": gera sempre os mesmos dados, para o exemplo ser previsível */
function sorteador(semente: number) {
  let s = semente
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const DIAS = 75

/** Dados de mentira, realistas, para testar o app: ~2 meses e meio de vendas */
export function gerarDadosExemplo(agora = new Date()): DadosApp {
  const sortear = sorteador(42)
  const entre = (min: number, max: number) => min + Math.floor(sortear() * (max - min + 1))
  const escolher = <T,>(pesos: [T, number][]): T => {
    let r = sortear() * pesos.reduce((s, [, p]) => s + p, 0)
    for (const [valor, peso] of pesos) if ((r -= peso) < 0) return valor
    return pesos[0][0]
  }
  const dia = (diasAtras: number, hora: number, minuto = 0) =>
    new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - diasAtras, hora, minuto).toISOString()
  const inicio = dia(DIAS, 8)

  const produto = (nome: string, categoria: string, custo: number, preco: number, estoque: number, estoqueMinimo: number): Produto => ({
    id: crypto.randomUUID(),
    nome,
    categoria,
    custo,
    preco,
    estoque,
    estoqueMinimo,
    criadoEm: inicio,
    atualizadoEm: inicio,
  })

  const produtos = [
    produto('Kit Fini Tubes', 'Kits', 550, 1000, 42, 10),
    produto('Kit Fini Beijos', 'Kits', 500, 1000, 7, 10), // abaixo do mínimo → "Repor"
    produto('Kit Fini Dentaduras', 'Kits', 520, 1000, 18, 10),
    produto('Bala Fini 100g', 'Balas', 320, 600, 25, 5),
    produto('Pirulito Fini', 'Balas', 100, 250, 3, 15), // abaixo do mínimo → "Repor"
    produto('Kit Presente', 'Presentes', 1300, 2500, 6, 3),
  ]
  // os kits vendem mais
  const pesosProdutos: [Produto, number][] = [
    [produtos[0], 30],
    [produtos[1], 22],
    [produtos[2], 18],
    [produtos[3], 12],
    [produtos[4], 12],
    [produtos[5], 6],
  ]

  const vendas: Venda[] = []
  for (let d = DIAS; d >= 0; d--) {
    const data = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - d)
    const domingo = data.getDay() === 0
    if (domingo && sortear() < 0.7) continue // quase nunca vende no domingo
    // as vendas crescem com o tempo, para o gráfico ficar interessante
    const quantidadeVendas = entre(2, 5) + Math.floor(((DIAS - d) / DIAS) * 4)
    for (let n = 0; n < quantidadeVendas; n++) {
      const hora = entre(9, 18)
      const itens: ItemVenda[] = []
      const quantosProdutos = escolher<number>([
        [1, 70],
        [2, 25],
        [3, 5],
      ])
      for (let i = 0; i < quantosProdutos; i++) {
        const p = escolher(pesosProdutos)
        const existente = itens.find((it) => it.produtoId === p.id)
        const quantidade = escolher<number>([
          [1, 65],
          [2, 25],
          [3, 10],
        ])
        if (existente) existente.quantidade += quantidade
        else itens.push({ produtoId: p.id, nome: p.nome, quantidade, precoUnitario: p.preco, custoUnitario: p.custo })
      }
      const formaPagamento = escolher<FormaPagamento>([
        ['pix', 45],
        ['dinheiro', 30],
        ['debito', 15],
        ['credito', 10],
      ])
      // pendentes só nos últimos dias (os antigos já foram pagos)
      const status = escolher<StatusVenda>([
        ['pago', 90],
        ['pendente', d <= 7 ? 7 : 0],
        ['cancelado', 3],
      ])
      const subtotal = itens.reduce((s, i) => s + i.quantidade * i.precoUnitario, 0)
      const desconto = subtotal >= 3000 && sortear() < 0.3 ? 200 : 0
      const taxaPercentual = configuracoesPadrao.taxas[formaPagamento]
      const sorteado = dia(d, hora, entre(0, 59))
      // vendas de hoje nunca ficam no futuro: as que passariam da hora atual vão para pouco antes dela
      const quando = new Date(sorteado) > agora ? new Date(agora.getTime() - (n + 1) * 7 * 60000).toISOString() : sorteado
      vendas.push({
        id: crypto.randomUUID(),
        data: quando,
        cliente: status === 'pendente' ? escolher([['Dona Maria', 1], ['João da banca', 1], ['Carla', 1]]) : sortear() < 0.15 ? escolher([['Ana', 1], ['Pedro', 1], ['Lúcia', 1], ['Marcos', 1]]) : '',
        itens,
        desconto,
        formaPagamento,
        status,
        taxaPercentual,
        ...calcularVenda(itens, desconto, taxaPercentual),
        criadoEm: quando,
        atualizadoEm: quando,
      })
    }
  }

  const registro = <T extends object>(dados: T, quando: string) => ({ ...dados, id: crypto.randomUUID(), criadoEm: quando, atualizadoEm: quando })

  const investimentos: Investimento[] = [
    registro({ data: dia(DIAS, 9), descricao: 'Primeiro lote de kits', tipo: 'estoque' as const, valor: 60000 }, dia(DIAS, 9)),
    registro({ data: dia(DIAS - 1, 10), descricao: 'Caixa térmica e mochila', tipo: 'equipamento' as const, valor: 18000 }, dia(DIAS - 1, 10)),
    registro({ data: dia(DIAS - 2, 11), descricao: 'Maquininha de cartão', tipo: 'equipamento' as const, valor: 9900 }, dia(DIAS - 2, 11)),
    registro({ data: dia(40, 9), descricao: 'Panfletos e adesivos', tipo: 'marketing' as const, valor: 8000 }, dia(40, 9)),
    registro({ data: dia(30, 9), descricao: 'Segundo lote de kits', tipo: 'estoque' as const, valor: 45000 }, dia(30, 9)),
  ]

  const despesas: Despesa[] = []
  for (let d = DIAS - 3; d >= 0; d -= 7) {
    despesas.push(registro({ data: dia(d, 8), descricao: 'Ônibus da semana', categoria: 'transporte' as const, valor: 3500, fixa: false, paga: true }, dia(d, 8)))
  }
  for (const d of [DIAS - 5, 45, 15]) {
    despesas.push(registro({ data: dia(d, 10), descricao: 'Sacolinhas e etiquetas', categoria: 'embalagem' as const, valor: 2800, fixa: false, paga: true }, dia(d, 10)))
  }
  for (const d of [62, 32, 2]) {
    despesas.push(registro({ data: dia(d, 9), descricao: 'Internet do celular', categoria: 'internet' as const, valor: 4500, fixa: true, paga: d !== 2 }, dia(d, 9)))
  }
  despesas.push(registro({ data: dia(20, 14), descricao: 'Taxa do MEI', categoria: 'impostos' as const, valor: 7600, fixa: true, paga: true }, dia(20, 14)))

  return {
    produtos,
    vendas,
    investimentos,
    despesas,
    configuracoes: [{ ...configuracoesPadrao, id: 'geral', nomeNegocio: 'Fini na Rua', metaMensal: 300000 }],
  }
}
