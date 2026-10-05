const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const number = new Intl.NumberFormat('pt-BR')
const monthFmt = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' })

export const formatCurrency = (value: number) => currency.format(value)
export const formatKm = (km: number) => `${number.format(km)} km`

/** yyyy-mm-dd -> dd/mm/aaaa (sem passar por Date, evita problema de fuso) */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/** yyyy-mm -> "out. de 26" */
export function formatMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return monthFmt.format(new Date(Date.UTC(y, m - 1, 1))).replace(' de ', '/')
}

/** Data de hoje no fuso local, formato yyyy-mm-dd */
export function todayISO(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${mm}-${dd}`
}

/** Aceita "1.234,56", "12,5" ou "12.5". Devolve null se inválido. */
export function parseMoney(text: string): number | null {
  const t = text.trim().replace(/^R\$\s*/, '')
  if (!t) return null
  const normalized = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t
  const n = Number(normalized)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null
}
