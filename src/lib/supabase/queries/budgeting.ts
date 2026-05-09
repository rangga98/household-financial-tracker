import { getSupabaseClient } from '@/lib/supabase/client'
import type { BudgetMetrics, Category } from '@/types'
import {
  calculateDailySpendingPower,
  isOverbudget,
  getProgressColor,
  getPercentageUsed,
} from '@/lib/utils/budgeting'

export async function getBudgetMetrics(
  householdId: string,
  yearMonth?: string
): Promise<BudgetMetrics[]> {
  const supabase = getSupabaseClient()

  const now = new Date()
  const targetMonth = yearMonth
    ? new Date(yearMonth + '-01')
    : new Date(now.getFullYear(), now.getMonth(), 1)

  const monthStart = targetMonth.toISOString().slice(0, 10)
  const nextMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 1)
  const monthEnd = nextMonth.toISOString().slice(0, 10)

  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_active', true)
    .order('type')
    .order('name')

  if (catError) {
    throw new Error(catError.message)
  }

  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('category_id, amount')
    .eq('household_id', householdId)
    .eq('type', 'expense')
    .gte('transaction_date', monthStart)
    .lt('transaction_date', monthEnd)

  if (txError) {
    throw new Error(txError.message)
  }

  const spentByCategory = new Map<string, number>()
  for (const tx of transactions || []) {
    const catId = String(tx.category_id)
    const current = spentByCategory.get(catId) || 0
    spentByCategory.set(catId, current + Number(tx.amount))
  }

  return (categories || []).map((c: Record<string, unknown>) => {
    const categoryId = String(c.id)
    const categoryName = String(c.name)
    const monthlyLimit = c.monthly_limit ? Number(c.monthly_limit) : null
    const totalSpent = spentByCategory.get(categoryId) || 0
    const remainingBudget = (monthlyLimit || 0) - totalSpent

    return {
      categoryId,
      categoryName,
      monthlyLimit,
      totalSpent,
      remainingBudget,
      percentageUsed: getPercentageUsed(totalSpent, monthlyLimit),
      dailySpendingPower: monthlyLimit
        ? calculateDailySpendingPower(monthlyLimit, totalSpent, now)
        : 0,
      isOverbudget: isOverbudget(totalSpent, monthlyLimit),
      progressColor: getProgressColor(totalSpent, monthlyLimit),
    }
  })
}

export async function updateCategoryLimit(
  categoryId: string,
  monthlyLimit: number
): Promise<Category> {
  const supabase = getSupabaseClient()

  if (monthlyLimit <= 0) {
    throw new Error('Monthly limit must be a positive number')
  }

  const { data, error } = await supabase
    .from('categories')
    .update({
      monthly_limit: monthlyLimit,
      updated_at: new Date().toISOString(),
    })
    .eq('id', categoryId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    id: String(data.id),
    householdId: String(data.household_id),
    name: String(data.name),
    type: String(data.type) as 'fixed' | 'variable',
    icon: data.icon ? String(data.icon) : undefined,
    color: data.color ? String(data.color) : undefined,
    isActive: Boolean(data.is_active),
    monthlyLimit: data.monthly_limit ? Number(data.monthly_limit) : undefined,
    createdAt: new Date(String(data.created_at)),
    updatedAt: new Date(String(data.updated_at)),
  }
}
