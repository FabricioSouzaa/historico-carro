import { describe, expect, it } from 'vitest'
import { expenseFromRow, expenseToRow, plannedFromRow, plannedToRow } from './mappers'
import type { Expense, PlannedExpense } from '../types'

describe('mappers', () => {
  it('gasto: ida e volta preserva os campos', () => {
    const e: Expense = {
      id: 'a', description: 'Óleo', amount: 199.9, date: '2026-10-01', categoryId: 'c', type: 'maintenance',
      odometer: 45000, notes: 'Filtro junto', attachments: ['f1'], createdAt: '2026-10-01T10:00:00Z',
    }
    expect(expenseFromRow({ ...expenseToRow(e), created_at: e.createdAt })).toEqual(e)
  })
  it('gasto: campos opcionais vazios viram null no banco e undefined no app', () => {
    const e: Expense = { id: 'a', description: 'x', amount: 1, date: '2026-10-01', categoryId: 'c', type: 'routine', createdAt: 't' }
    const row = expenseToRow(e)
    expect(row.odometer).toBeNull()
    expect(row.attachments).toEqual([])
    const back = expenseFromRow(row)
    expect(back.odometer).toBeUndefined()
    expect(back.attachments).toBeUndefined()
  })
  it('planejado: numeric que chega como string vira número', () => {
    const p = plannedFromRow({
      id: 'p', description: 'LED', estimated_amount: '350.00' as unknown as number, estimated_max: '500' as unknown as number,
      category_id: 'c', type: 'upgrade', priority: 'high', notes: null, status: 'planned', expense_id: null,
    })
    expect(p.estimatedAmount).toBe(350)
    expect(p.estimatedMax).toBe(500)
  })
  it('planejado: ida e volta', () => {
    const p: PlannedExpense = {
      id: 'p', description: 'LED', estimatedAmount: 300, categoryId: 'c', type: 'upgrade', priority: 'low',
      status: 'done', expenseId: 'e',
    }
    expect(plannedFromRow(plannedToRow(p))).toEqual(p)
  })
})
