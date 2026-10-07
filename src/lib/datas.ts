// Datas são guardadas em ISO (padrão de banco de dados) e mostradas no formato brasileiro.

const formatoData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const formatoHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

/** → "07/10/2026" */
export function formatarData(data: Date | string): string {
  return formatoData.format(new Date(data))
}

/** → "14:30" */
export function formatarHora(data: Date | string): string {
  return formatoHora.format(new Date(data))
}

export function inicioDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

export function somarDias(data: Date, dias: number): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate() + dias, data.getHours(), data.getMinutes(), data.getSeconds())
}

/** "Hoje", "Ontem" ou "05/10/2026" */
export function rotuloDoDia(data: Date | string, agora = new Date()): string {
  const dia = inicioDoDia(new Date(data)).getTime()
  const hoje = inicioDoDia(agora)
  if (dia === hoje.getTime()) return 'Hoje'
  if (dia === somarDias(hoje, -1).getTime()) return 'Ontem'
  return formatarData(data)
}

/** Date → "2026-10-07" (valor do campo de data do navegador), no fuso local */
export function paraCampoData(data: Date | string): string {
  const d = new Date(data)
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

/** "2026-10-07" → Date no fuso local, mantendo o horário de "referencia" */
export function deCampoData(valor: string, referencia: Date | string = new Date()): Date {
  const [ano, mes, dia] = valor.split('-').map(Number)
  const r = new Date(referencia)
  return new Date(ano, mes - 1, dia, r.getHours(), r.getMinutes(), r.getSeconds())
}
