import { supabase } from '../supabase'
import type { AppData, Category, Expense, PlannedExpense } from '../types'
import {
  categoryFromRow,
  expenseFromRow,
  expenseToRow,
  plannedFromRow,
  plannedToRow,
  type CategoryRow,
  type ExpenseRow,
  type PlannedRow,
} from './mappers'

// Única camada que fala com o banco. user_id é preenchido pelo próprio banco (auth.uid()).

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data as T
}

export async function fetchAll(): Promise<AppData> {
  const [cats, exps, plans] = await Promise.all([
    supabase.from('categories').select('id,name,is_fallback').order('created_at'),
    supabase.from('expenses').select('*').order('created_at'),
    supabase.from('planned_expenses').select('*').order('created_at'),
  ])
  return {
    categories: check<CategoryRow[]>(cats).map(categoryFromRow),
    expenses: check<ExpenseRow[]>(exps).map(expenseFromRow),
    planned: check<PlannedRow[]>(plans).map(plannedFromRow),
  }
}

export async function insertExpenses(list: Expense[]): Promise<void> {
  if (list.length === 0) return
  check(await supabase.from('expenses').insert(list.map(expenseToRow)))
}

export async function updateExpense(e: Expense): Promise<void> {
  const { id, ...row } = expenseToRow(e)
  check(await supabase.from('expenses').update(row).eq('id', id))
}

export async function deleteExpense(id: string): Promise<void> {
  // o planejado que originou o gasto volta a ficar pendente
  check(await supabase.from('planned_expenses').update({ status: 'planned', expense_id: null }).eq('expense_id', id))
  check(await supabase.from('expenses').delete().eq('id', id))
}

export async function insertPlanned(list: PlannedExpense[]): Promise<void> {
  if (list.length === 0) return
  check(await supabase.from('planned_expenses').insert(list.map(plannedToRow)))
}

export async function updatePlanned(p: PlannedExpense): Promise<void> {
  const { id, ...row } = plannedToRow(p)
  check(await supabase.from('planned_expenses').update(row).eq('id', id))
}

export async function deletePlanned(id: string): Promise<void> {
  check(await supabase.from('planned_expenses').delete().eq('id', id))
}

export async function completePlanned(plannedId: string, expense: Expense): Promise<void> {
  await insertExpenses([expense])
  check(await supabase.from('planned_expenses').update({ status: 'done', expense_id: expense.id }).eq('id', plannedId))
}

export async function insertCategories(list: Category[]): Promise<void> {
  if (list.length === 0) return
  check(await supabase.from('categories').insert(list.map((c) => ({ id: c.id, name: c.name }))))
}

export async function renameCategory(id: string, name: string): Promise<void> {
  check(await supabase.from('categories').update({ name }).eq('id', id))
}

/** Move os lançamentos para a categoria "Outros" e remove a categoria. */
export async function removeCategory(id: string, fallbackId: string): Promise<void> {
  check(await supabase.from('expenses').update({ category_id: fallbackId }).eq('category_id', id))
  check(await supabase.from('planned_expenses').update({ category_id: fallbackId }).eq('category_id', id))
  check(await supabase.from('categories').delete().eq('id', id))
}
