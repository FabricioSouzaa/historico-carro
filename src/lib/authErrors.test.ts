import { describe, expect, it } from 'vitest'
import { loginErrorMessage } from './authErrors'

describe('loginErrorMessage', () => {
  it('senha ou e-mail errados', () => {
    expect(loginErrorMessage({ code: 'invalid_credentials', status: 400 })).toBe('E-mail ou senha incorretos.')
  })
  it('limite de tentativas', () => {
    expect(loginErrorMessage({ status: 429 })).toMatch(/Muitas tentativas/)
  })
  it('chave inválida não é confundida com senha errada', () => {
    expect(loginErrorMessage({ status: 401, message: 'Invalid API key' })).toMatch(/chave do Supabase/)
  })
  it('falha de rede ou cabeçalho inválido', () => {
    expect(loginErrorMessage({ name: 'AuthRetryableFetchError', status: 0 })).toMatch(/servidor/)
  })
  it('erro desconhecido tem mensagem genérica', () => {
    expect(loginErrorMessage({ status: 500, code: 'unexpected_failure' })).toBe('Não foi possível entrar. Tente novamente.')
  })
})
