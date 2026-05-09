'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { savingsRate, expensePercentChange } from '@/lib/utils/calculations'
import type {
  ReportData,
  ExpenseBreakdownItem,
  MonthlyTotals,
  MonthOverMonthComparison,
} from '@/types/report'

function getMonthBoundaries(yearMonth: string): {
  startDate: string
  endDate: string
  prevStartDate: string
  prevEndDate: string
} {
  const [year, month] = yearMonth.split('-').map(Number)
  const startDate = `${yearMonth}-01`
  const endDate = new Date(year, month, 1).toISOString().split('T')[0]

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prevMonthStr = String(prevMonth).padStart(2, '0')
  const prevStartDate = `${prevYear}-${prevMonthStr}-01`
  const prevEndDate = startDate

  return { startDate, endDate, prevStartDate, prevEndDate }
}

function aggregateExpenses(
  transactions: Array<{
    category_id: string
    amount: number
    categories: { name: string; color: string | null } | null
  }>
): ExpenseBreakdownItem[] {
  const map = new Map<string, ExpenseBreakdownItem>()
  let totalExpenses = 0

  for (const t of transactions) {
    totalExpenses += t.amount
    const existing = map.get(t.category_id)
    if (existing) {
      existing.totalAmount += t.amount
    } else {
      map.set(t.category_id, {
        categoryId: t.category_id,
        categoryName: t.categories?.name ?? 'Unknown',
        categoryColor: t.categories?.color ?? null,
        totalAmount: t.amount,
        percentage: 0,
      })
    }
  }

  const items = Array.from(map.values())
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .map((item) => ({
      ...item,
      percentage: totalExpenses > 0 ? Math.round((item.totalAmount / totalExpenses) * 10000) / 100 : 0,
    }))

  return items
}

function calculateMonthlyTotals(
  transactions: Array<{ type: string; amount: number }>
): MonthlyTotals {
  let totalIncome = 0
  let totalExpenses = 0

  for (const t of transactions) {
    if (t.type === 'income') {
      totalIncome += t.amount
    } else {
      totalExpenses += t.amount
    }
  }

  return {
    totalIncome,
    totalExpenses,
    savingsRate: savingsRate(totalIncome, totalExpenses),
    netSavings: totalIncome - totalExpenses,
  }
}

export async function getReportData(
  householdId: string,
  yearMonth: string
): Promise<ReportData> {
  const supabase = await getSupabaseServerClient()
  const { startDate, endDate, prevStartDate, prevEndDate } = getMonthBoundaries(yearMonth)

  try {
    const { data: currentTransactions, error: currentError } = await supabase
      .from('transactions')
      .select('type, amount, category_id, categories(name, color)')
      .eq('household_id', householdId)
      .gte('transaction_date', startDate)
      .lt('transaction_date', endDate)

    if (currentError) {
      console.error(
        JSON.stringify({
          event: 'REPORT_FETCH_CURRENT_FAIL',
          error: currentError.message,
          householdId,
          yearMonth,
        })
      )
      throw new Error(currentError.message)
    }

    const { data: previousTransactions, error: previousError } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('household_id', householdId)
      .gte('transaction_date', prevStartDate)
      .lt('transaction_date', prevEndDate)

    if (previousError) {
      console.error(
        JSON.stringify({
          event: 'REPORT_FETCH_PREVIOUS_FAIL',
          error: previousError.message,
          householdId,
          yearMonth,
        })
      )
      throw new Error(previousError.message)
    }

    const currentTx = currentTransactions ?? []
    const previousTx = previousTransactions ?? []

    const expenseBreakdown = aggregateExpenses(
      currentTx
        .filter((t) => t.type === 'expense')
        .map((t) => ({
          category_id: t.category_id as string,
          amount: t.amount as number,
          categories: t.categories && Array.isArray(t.categories) && t.categories.length > 0
            ? { name: String(t.categories[0].name), color: t.categories[0].color ? String(t.categories[0].color) : null }
            : null,
        }))
    )

    const monthlyTotals = calculateMonthlyTotals(currentTx)

    const previousTotals = calculateMonthlyTotals(previousTx)

    const expenseDifference = monthlyTotals.totalExpenses - previousTotals.totalExpenses
    const expensePctChange = expensePercentChange(monthlyTotals.totalExpenses, previousTotals.totalExpenses)

    const comparison: MonthOverMonthComparison | null =
      previousTx.length > 0
        ? {
            currentMonth: monthlyTotals,
            previousMonth: previousTotals,
            expenseDifference,
            expensePercentChange: expensePctChange,
            isIncrease: expenseDifference > 0,
            isSignificantIncrease: expensePctChange > 10,
          }
        : null

    return {
      selectedMonth: yearMonth,
      expenseBreakdown,
      monthlyTotals,
      comparison,
    }
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'REPORT_FETCH_FAIL',
        error: err instanceof Error ? err.message : 'Unknown error',
        householdId,
        yearMonth,
      })
    )
    throw err
  }
}
