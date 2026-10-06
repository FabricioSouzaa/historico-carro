import { describe, expect, it } from 'vitest'
import { cleanEnv } from './env'

describe('cleanEnv', () => {
  it('remove quebra de linha e espaços do meio e das pontas', () => {
    expect(cleanEnv('  eyJabc.eyJdef\n  ghi.jkl \n')).toBe('eyJabc.eyJdefghi.jkl')
  })
  it('mantém um valor limpo como está', () => {
    expect(cleanEnv('https://x.supabase.co')).toBe('https://x.supabase.co')
  })
  it('aceita ausência de valor', () => {
    expect(cleanEnv(undefined)).toBeUndefined()
  })
})
