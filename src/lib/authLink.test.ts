import { describe, expect, it } from 'vitest'
import { parseAuthLink } from './authLink'

describe('parseAuthLink', () => {
  it('reconhece link de recuperação no hash', () => {
    expect(parseAuthLink('#access_token=abc&refresh_token=x&type=recovery', '')).toEqual({ recovery: true, error: null })
  })
  it('url normal não é recuperação', () => {
    expect(parseAuthLink('', '')).toEqual({ recovery: false, error: null })
  })
  it('link expirado vira mensagem em português', () => {
    const r = parseAuthLink('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid', '')
    expect(r.recovery).toBe(false)
    expect(r.error).toMatch(/expirou/)
  })
  it('outro erro de link tem mensagem genérica', () => {
    expect(parseAuthLink('', '?error=server_error').error).toMatch(/Não foi possível validar/)
  })
})
