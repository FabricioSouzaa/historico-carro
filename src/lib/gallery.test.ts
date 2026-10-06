import { describe, expect, it } from 'vitest'
import { sameNames } from './gallery'

describe('sameNames', () => {
  it('ignora o endereço, compara só os nomes e a ordem', () => {
    expect(sameNames([{ name: 'a' }, { name: 'b' }], [{ name: 'a' }, { name: 'b' }])).toBe(true)
    expect(sameNames([{ name: 'a' }, { name: 'b' }], [{ name: 'b' }, { name: 'a' }])).toBe(false)
  })
  it('tamanhos diferentes ou lista ausente', () => {
    expect(sameNames([{ name: 'a' }], [{ name: 'a' }, { name: 'b' }])).toBe(false)
    expect(sameNames(null, [])).toBe(false)
  })
})
