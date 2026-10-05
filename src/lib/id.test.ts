import { afterEach, describe, expect, it, vi } from 'vitest'
import { newId } from './id'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('newId', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('gera uuid v4 válido e único', () => {
    expect(newId()).toMatch(UUID)
    expect(newId()).not.toBe(newId())
  })

  it('funciona sem crypto.randomUUID (contexto inseguro)', () => {
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a.fill(7) })
    expect(newId()).toMatch(UUID)
  })

  it('funciona sem crypto nenhum', () => {
    vi.stubGlobal('crypto', undefined)
    expect(newId()).toMatch(UUID)
  })
})
