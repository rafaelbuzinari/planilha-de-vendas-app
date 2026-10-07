import { describe, expect, it } from 'vitest'
import { dentroDoIntervalo, intervaloDoPeriodo, intervaloPersonalizado } from './periodo'
import { deCampoData, formatarData, paraCampoData, rotuloDoDia } from './datas'

// quarta-feira, 7 de outubro de 2026, 15:30
const agora = new Date(2026, 9, 7, 15, 30)

describe('períodos', () => {
  it('hoje vai da meia-noite até a meia-noite seguinte', () => {
    const { inicio, fim } = intervaloDoPeriodo('hoje', agora)
    expect(inicio).toEqual(new Date(2026, 9, 7))
    expect(fim).toEqual(new Date(2026, 9, 8))
  })

  it('semana vai de segunda a domingo', () => {
    const { inicio, fim } = intervaloDoPeriodo('semana', agora)
    expect(inicio).toEqual(new Date(2026, 9, 5)) // segunda
    expect(fim).toEqual(new Date(2026, 9, 12)) // segunda seguinte (não inclusa)
  })

  it('no domingo, a semana ainda é a que começou na segunda anterior', () => {
    const { inicio } = intervaloDoPeriodo('semana', new Date(2026, 9, 11, 10))
    expect(inicio).toEqual(new Date(2026, 9, 5))
  })

  it('mês e ano do calendário', () => {
    expect(intervaloDoPeriodo('mes', agora)).toEqual({ inicio: new Date(2026, 9, 1), fim: new Date(2026, 10, 1) })
    expect(intervaloDoPeriodo('ano', agora)).toEqual({ inicio: new Date(2026, 0, 1), fim: new Date(2027, 0, 1) })
  })

  it('personalizado inclui os dois dias, mesmo se vierem invertidos', () => {
    const intervalo = intervaloPersonalizado(new Date(2026, 9, 10), new Date(2026, 9, 1))
    expect(dentroDoIntervalo(new Date(2026, 9, 1, 0, 0), intervalo)).toBe(true)
    expect(dentroDoIntervalo(new Date(2026, 9, 10, 23, 59), intervalo)).toBe(true)
    expect(dentroDoIntervalo(new Date(2026, 9, 11, 0, 0), intervalo)).toBe(false)
  })

  it('sem intervalo, tudo entra', () => {
    expect(dentroDoIntervalo(new Date(2000, 0, 1), null)).toBe(true)
  })
})

describe('datas', () => {
  it('formato brasileiro', () => {
    expect(formatarData(agora)).toBe('07/10/2026')
  })

  it('rótulos Hoje e Ontem', () => {
    expect(rotuloDoDia(new Date(2026, 9, 7, 8), agora)).toBe('Hoje')
    expect(rotuloDoDia(new Date(2026, 9, 6, 23), agora)).toBe('Ontem')
    expect(rotuloDoDia(new Date(2026, 9, 1), agora)).toBe('01/10/2026')
  })

  it('campo de data ida e volta, mantendo a hora', () => {
    expect(paraCampoData(agora)).toBe('2026-10-07')
    expect(deCampoData('2026-10-01', agora)).toEqual(new Date(2026, 9, 1, 15, 30))
  })
})
