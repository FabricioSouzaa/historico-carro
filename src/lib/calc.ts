import type { Category, Expense, ExpenseType, PlannedExpense } from '../types'

const toCents = (n: number) => Math.round(n * 100)

/** Soma em centavos para evitar erro de ponto flutuante. */
export function sumAmounts(values: number[]): number {
  return values.reduce((acc, v) => acc + toCents(v), 0) / 100
}

export interface ExpenseFilters {
  categoryIds: string[] // vazio = todas
  type: ExpenseType | 'all'
  from?: string // yyyy-mm-dd
  to?: string
}

export function filterExpenses(expenses: Expense[], f: ExpenseFilters): Expense[] {
  return expenses.filter(
    (e) =>
      (f.categoryIds.length === 0 || f.categoryIds.includes(e.categoryId)) &&
      (f.type === 'all' || e.type === f.type) &&
      (!f.from || e.date >= f.from) &&
      (!f.to || e.date <= f.to),
  )
}

export function sortByDateDesc(expenses: Expense[]): Expense[] {
  return [...expenses].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  )
}

export function totalAmount(expenses: Expense[]): number {
  return sumAmounts(expenses.map((e) => e.amount))
}

export interface CategoryTotal {
  id: string
  name: string
  total: number
}

export function totalByCategory(expenses: Expense[], categories: Category[]): CategoryTotal[] {
  const names = new Map(categories.map((c) => [c.id, c.name]))
  const groups = new Map<string, number[]>()
  for (const e of expenses) groups.set(e.categoryId, [...(groups.get(e.categoryId) ?? []), e.amount])
  return [...groups.entries()]
    .map(([id, values]) => ({ id, name: names.get(id) ?? 'Sem categoria', total: sumAmounts(values) }))
    .sort((a, b) => b.total - a.total)
}

export function totalByType(expenses: Expense[]): Record<ExpenseType, number> {
  const pick = (t: ExpenseType) => totalAmount(expenses.filter((e) => e.type === t))
  return { maintenance: pick('maintenance'), upgrade: pick('upgrade'), routine: pick('routine') }
}

export interface MonthTotal {
  month: string // yyyy-mm
  total: number
}

/** Últimos `count` meses terminando em `endMonth` (yyyy-mm), incluindo meses sem gasto. */
export function totalByMonth(expenses: Expense[], endMonth: string, count = 12): MonthTotal[] {
  const [ey, em] = endMonth.split('-').map(Number)
  const months: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(ey, em - 1 - i, 1))
    months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`)
  }
  return months.map((month) => ({
    month,
    total: totalAmount(expenses.filter((e) => e.date.startsWith(month))),
  }))
}

export const totalForMonth = (expenses: Expense[], ym: string) =>
  totalAmount(expenses.filter((e) => e.date.startsWith(ym)))

export const totalForYear = (expenses: Expense[], year: string) =>
  totalAmount(expenses.filter((e) => e.date.startsWith(year)))

/**
 * Custo por km: gastos desde o registro de menor km até a maior km registrada,
 * divididos pelos km rodados entre eles. Null se não houver dois registros de km distintos.
 */
export function costPerKm(expenses: Expense[]): number | null {
  const withKm = expenses.filter((e) => typeof e.odometer === 'number')
  if (withKm.length < 2) return null
  const first = withKm.reduce((a, b) => (b.odometer! < a.odometer! ? b : a))
  const last = withKm.reduce((a, b) => (b.odometer! > a.odometer! ? b : a))
  const km = last.odometer! - first.odometer!
  if (km <= 0) return null
  const total = totalAmount(expenses.filter((e) => e.date >= first.date))
  return total / km
}

/** Total estimado dos planejados pendentes (mínimo e máximo, se houver faixa). */
export function plannedTotals(planned: PlannedExpense[]): { min: number; max: number; count: number } {
  const pending = planned.filter((p) => p.status === 'planned')
  return {
    min: sumAmounts(pending.map((p) => p.estimatedAmount)),
    max: sumAmounts(pending.map((p) => p.estimatedMax ?? p.estimatedAmount)),
    count: pending.length,
  }
}
