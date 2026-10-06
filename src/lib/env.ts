/**
 * Variáveis de ambiente coladas em painéis (Vercel etc.) podem ganhar espaços ou quebras de
 * linha no meio. URL e chaves nunca têm espaço, então removemos qualquer whitespace.
 */
export function cleanEnv(value: string | undefined): string | undefined {
  return value?.replace(/\s+/g, '')
}
