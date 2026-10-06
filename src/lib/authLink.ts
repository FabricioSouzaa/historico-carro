export interface AuthLinkInfo {
  recovery: boolean // o usuário chegou por um link de recuperação de senha
  error: string | null // mensagem em português se o link veio com erro (expirado etc.)
}

/** Lê o que o Supabase deixa na URL ao abrir um link do e-mail (no hash ou na query). */
export function parseAuthLink(hash: string, search: string): AuthLinkInfo {
  const params = new URLSearchParams(`${hash.replace(/^#/, '')}&${search.replace(/^\?/, '')}`)
  const errorCode = params.get('error_code')
  const hasError = params.has('error') || errorCode !== null
  return {
    recovery: params.get('type') === 'recovery',
    error: hasError
      ? errorCode === 'otp_expired'
        ? 'Esse link expirou ou já foi usado. Peça um novo link de recuperação.'
        : 'Não foi possível validar o link. Peça um novo link de recuperação.'
      : null,
  }
}
