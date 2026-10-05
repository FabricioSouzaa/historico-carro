import { describe, expect, it } from 'vitest'
import { fitSize } from './image'

describe('fitSize', () => {
  it('reduz mantendo a proporção', () => {
    expect(fitSize(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 })
    expect(fitSize(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 })
  })
  it('não amplia imagens pequenas', () => {
    expect(fitSize(800, 600, 1600)).toEqual({ width: 800, height: 600 })
  })
})
