import { describe, expect, it } from 'vitest'
import { clampIndex, slideIndex } from './carousel'

describe('clampIndex', () => {
  it('mantém o índice dentro da lista', () => {
    expect(clampIndex(-1, 5)).toBe(0)
    expect(clampIndex(2, 5)).toBe(2)
    expect(clampIndex(9, 5)).toBe(4)
  })
  it('lista vazia devolve 0', () => {
    expect(clampIndex(3, 0)).toBe(0)
  })
})

describe('slideIndex', () => {
  it('arredonda para o slide mais próximo', () => {
    expect(slideIndex(0, 400, 6)).toBe(0)
    expect(slideIndex(190, 400, 6)).toBe(0)
    expect(slideIndex(210, 400, 6)).toBe(1)
    expect(slideIndex(2000, 400, 6)).toBe(5)
  })
  it('largura zero não quebra', () => {
    expect(slideIndex(100, 0, 6)).toBe(0)
  })
})
