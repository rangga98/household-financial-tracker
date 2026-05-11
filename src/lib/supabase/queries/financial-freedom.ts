import { getSupabaseClient } from '@/lib/supabase/client'
import type { FIProfile, FIProfileInput, FIProfileRow } from '@/types/financial-freedom'

/**
 * Transform database row (snake_case) to TypeScript interface (camelCase)
 */
function rowToProfile(data: FIProfileRow): FIProfile {
  return {
    id: data.id,
    householdId: data.household_id,
    fiAnnualExpenses: data.fi_annual_expenses ? Number(data.fi_annual_expenses) : null,
    fiSavingsRate: data.fi_savings_rate ? Number(data.fi_savings_rate) : null,
    fiCurrentAge: data.fi_current_age,
    fiCurrentNetWorth: data.fi_current_net_worth ? Number(data.fi_current_net_worth) : null,
    fiExpectedReturn: data.fi_expected_return ? Number(data.fi_expected_return) : null,
  }
}

/**
 * Transform TypeScript interface (camelCase) to database updates (snake_case)
 */
function inputToRow(updates: FIProfileInput): Record<string, unknown> {
  const dbUpdates: Record<string, unknown> = {}

  if (updates.fiAnnualExpenses !== undefined) {
    dbUpdates.fi_annual_expenses = updates.fiAnnualExpenses
  }
  if (updates.fiSavingsRate !== undefined) {
    dbUpdates.fi_savings_rate = updates.fiSavingsRate
  }
  if (updates.fiCurrentAge !== undefined) {
    dbUpdates.fi_current_age = updates.fiCurrentAge
  }
  if (updates.fiCurrentNetWorth !== undefined) {
    dbUpdates.fi_current_net_worth = updates.fiCurrentNetWorth
  }
  if (updates.fiExpectedReturn !== undefined) {
    dbUpdates.fi_expected_return = updates.fiExpectedReturn
  }

  dbUpdates.updated_at = new Date().toISOString()

  return dbUpdates
}

/**
 * Get FI profile for a user
 */
export async function getFIProfile(userId: string): Promise<FIProfile | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, household_id, fi_annual_expenses, fi_savings_rate, fi_current_age, fi_current_net_worth, fi_expected_return')
    .eq('id', userId)
    .single()

  if (error) {
    return null
  }

  return rowToProfile(data as unknown as FIProfileRow)
}

/**
 * Update FI profile for a user
 */
export async function updateFIProfile(
  userId: string,
  updates: FIProfileInput
): Promise<FIProfile> {
  const supabase = getSupabaseClient()

  const dbUpdates = inputToRow(updates)

  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId)
    .select('id, household_id, fi_annual_expenses, fi_savings_rate, fi_current_age, fi_current_net_worth, fi_expected_return')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return rowToProfile(data as unknown as FIProfileRow)
}

/**
 * Get budget-based annual expenses estimate
 * Sums monthly limits from categories (fixed + variable) and annualizes
 */
export async function getBudgetBasedAnnualExpenses(householdId: string): Promise<number | null> {
  const supabase = getSupabaseClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('monthly_limit')
    .eq('household_id', householdId)
    .eq('is_active', true)
    .not('monthly_limit', 'is', null)

  if (error || !categories || categories.length === 0) {
    return null
  }

  // Sum all monthly limits and multiply by 12
  const totalMonthly = categories.reduce(
    (sum: number, cat: { monthly_limit: string | null }) => {
      return sum + (cat.monthly_limit ? Number(cat.monthly_limit) : 0)
    },
    0
  )

  return totalMonthly * 12
}
