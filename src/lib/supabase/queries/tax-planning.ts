import { getSupabaseClient } from '@/lib/supabase/client'
import {
  buildObligationWithSchedule,
  computeDaysUntilDeadline,
  isFilingDeadlineUrgent,
} from '@/lib/utils/tax-planning'
import type {
  TaxObligation,
  TaxFilingDeadline,
  TaxDeductionRecord,
  TaxObligationWithSchedule,
  TaxFilingDeadlineWithCountdown,
  TaxDashboardData,
} from '@/types/tax-planning'

const OBLIGATION_SELECT =
  'id, household_id, name, tax_type, target_amount, current_amount, target_date, description, created_at, updated_at'

const DEADLINE_SELECT =
  'id, household_id, tax_type, fiscal_year, filing_deadline, status, filed_at, notes, created_at, updated_at'

function mapRowToObligation(row: Record<string, unknown>): TaxObligation {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    name: row.name as string,
    taxType: row.tax_type as TaxObligation['taxType'],
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    targetDate: row.target_date as string,
    notes: (row.description as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapRowToDeadline(row: Record<string, unknown>): TaxFilingDeadline {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    taxType: row.tax_type as TaxFilingDeadline['taxType'],
    fiscalYear: Number(row.fiscal_year),
    filingDeadline: row.filing_deadline as string,
    status: row.status as TaxFilingDeadline['status'],
    filedAt: (row.filed_at as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function getTaxObligations(householdId: string): Promise<TaxObligation[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('financial_goals')
    .select(OBLIGATION_SELECT)
    .eq('household_id', householdId)
    .eq('goal_type', 'tax_obligation')
    .is('deleted_at', null)
    .order('target_date', { ascending: true })

  if (error) {
    console.error(JSON.stringify({ event: 'TAX_OBLIGATIONS_FETCH_FAIL', error: error.message }))
    return []
  }

  return (data ?? []).map(mapRowToObligation)
}

export async function getFilingDeadlines(householdId: string): Promise<TaxFilingDeadline[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('tax_filing_deadlines')
    .select(DEADLINE_SELECT)
    .eq('household_id', householdId)
    .order('filing_deadline', { ascending: true })

  if (error) {
    console.error(JSON.stringify({ event: 'FILING_DEADLINES_FETCH_FAIL', error: error.message }))
    return []
  }

  return (data ?? []).map(mapRowToDeadline)
}

export async function getDeductibleTransactions(
  householdId: string,
  fiscalYear: number
): Promise<TaxDeductionRecord[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('transactions')
    .select('id, amount, transaction_date, description, category_id, fiscal_year, categories(name)')
    .eq('household_id', householdId)
    .eq('is_tax_deductible', true)
    .eq('fiscal_year', fiscalYear)
    .order('transaction_date', { ascending: false })

  if (error) {
    console.error(JSON.stringify({ event: 'DEDUCTIBLE_TRANSACTIONS_FETCH_FAIL', error: error.message }))
    return []
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    amount: Number(row.amount),
    transactionDate: row.transaction_date as string,
    description: (row.description as string | null) ?? null,
    categoryId: row.category_id as string,
    categoryName: ((row.categories as Record<string, unknown> | null)?.name as string | null) ?? 'Unknown',
    fiscalYear: Number(row.fiscal_year),
  }))
}

export async function getDeductionTotalsByCategory(
  householdId: string,
  fiscalYear: number
): Promise<Array<{ categoryId: string; categoryName: string; total: number }>> {
  const records = await getDeductibleTransactions(householdId, fiscalYear)

  const totalsMap = new Map<string, { categoryName: string; total: number }>()
  for (const r of records) {
    const existing = totalsMap.get(r.categoryId)
    if (existing) {
      existing.total += r.amount
    } else {
      totalsMap.set(r.categoryId, { categoryName: r.categoryName, total: r.amount })
    }
  }

  return Array.from(totalsMap.entries())
    .map(([categoryId, { categoryName, total }]) => ({ categoryId, categoryName, total }))
    .sort((a, b) => b.total - a.total)
}

export async function getTaxDashboardData(
  householdId: string,
  today: Date = new Date()
): Promise<TaxDashboardData> {
  const [obligations, filingDeadlines] = await Promise.all([
    getTaxObligations(householdId),
    getFilingDeadlines(householdId),
  ])

  const obligationsWithSchedule: TaxObligationWithSchedule[] = obligations.map((o) =>
    buildObligationWithSchedule(o, today)
  )

  const deadlinesWithCountdown: TaxFilingDeadlineWithCountdown[] = filingDeadlines.map((d) => ({
    ...d,
    daysUntilDeadline: computeDaysUntilDeadline(d.filingDeadline, today),
    isUrgent: isFilingDeadlineUrgent(d.filingDeadline, d.status, today),
  }))

  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const currentMonthInstallmentTotal = obligationsWithSchedule.reduce((sum, o) => {
    const thisMonth = o.installmentSchedule.find((i) => i.month === currentMonthKey)
    return sum + (thisMonth?.amount ?? 0)
  }, 0)

  const overdueObligationCount = obligationsWithSchedule.filter((o) => o.isOverdue).length
  const urgentDeadlineCount = deadlinesWithCountdown.filter((d) => d.isUrgent).length

  return {
    obligations: obligationsWithSchedule,
    filingDeadlines: deadlinesWithCountdown,
    currentMonthInstallmentTotal,
    overdueObligationCount,
    urgentDeadlineCount,
  }
}
