interface AuthLikeError {
  code?: string
  status?: number
  message?: string
  name?: string
}

/** Traduz o erro de login para uma mensagem que diz o que realmente aconteceu. */
export function loginErrorMessage(error: AuthLikeError): string {
  if (error.code === 'invalid_credentials') return 'E-mail ou senha incorretos.'
  if (error.status === 429 || error.code === 'over_request_rate_limit') {
    return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'
  }
  if (error.status === 401 || error.status === 403 || /api key/i.test(error.message ?? '')) {
    return 'Erro de configuração do app: a chave do Supabase parece inválida.'
  }
  if (error.name === 'AuthRetryableFetchError' || error.status === 0 || error.status === undefined) {
    return 'Não foi possível falar com o servidor. Verifique a conexão; se persistir, a configuração do app pode estar incorreta.'
  }
  return 'Não foi possível entrar. Tente novamente.'
}
