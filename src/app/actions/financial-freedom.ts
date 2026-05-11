'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { FIProfile, FIProfileInput } from '@/types/financial-freedom'

/**
 * Get FI profile for a user
 */
export async function getFIProfile(userId: string): Promise<FIProfile | null> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, household_id, fi_annual_expenses, fi_savings_rate, fi_current_age, fi_current_net_worth, fi_expected_return')
    .eq('id', userId)
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'FI_PROFILE_FETCH_FAIL', error: error.message }))
    return null
  }

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
 * Update FI profile for a user
 */
export async function updateFIProfile(
  userId: string,
  updates: FIProfileInput
): Promise<{ success: true; profile: FIProfile } | { success: false; error: string }> {
  const supabase = await getSupabaseServerClient()

  // Validate inputs
  if (updates.fiAnnualExpenses !== undefined && updates.fiAnnualExpenses !== null && updates.fiAnnualExpenses < 0) {
    return { success: false, error: 'Annual expenses must be non-negative' }
  }
  if (updates.fiSavingsRate !== undefined && updates.fiSavingsRate !== null && (updates.fiSavingsRate < 0 || updates.fiSavingsRate > 1)) {
    return { success: false, error: 'Savings rate must be between 0 and 1' }
  }
  if (updates.fiCurrentAge !== undefined && updates.fiCurrentAge !== null && updates.fiCurrentAge < 0) {
    return { success: false, error: 'Current age must be non-negative' }
  }
  if (updates.fiCurrentNetWorth !== undefined && updates.fiCurrentNetWorth !== null && updates.fiCurrentNetWorth < 0) {
    return { success: false, error: 'Current net worth must be non-negative' }
  }
  if (updates.fiExpectedReturn !== undefined && updates.fiExpectedReturn !== null && updates.fiExpectedReturn < 0) {
    return { success: false, error: 'Expected return must be non-negative' }
  }

  // Build database updates (snake_case)
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

  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId)
    .select('id, household_id, fi_annual_expenses, fi_savings_rate, fi_current_age, fi_current_net_worth, fi_expected_return')
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'FI_PROFILE_UPDATE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/financial-freedom')

  return {
    success: true,
    profile: {
      id: data.id,
      householdId: data.household_id,
      fiAnnualExpenses: data.fi_annual_expenses ? Number(data.fi_annual_expenses) : null,
      fiSavingsRate: data.fi_savings_rate ? Number(data.fi_savings_rate) : null,
      fiCurrentAge: data.fi_current_age,
      fiCurrentNetWorth: data.fi_current_net_worth ? Number(data.fi_current_net_worth) : null,
      fiExpectedReturn: data.fi_expected_return ? Number(data.fi_expected_return) : null,
    },
  }
}

/**
 * Get budget-based annual expenses estimate
 * Sums monthly limits from categories (fixed + variable) and annualizes
 */
export async function getBudgetBasedAnnualExpenses(householdId: string): Promise<number | null> {
  const supabase = await getSupabaseServerClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('monthly_limit')
    .eq('household_id', householdId)
    .eq('is_active', true)
    .not('monthly_limit', 'is', null)

  if (error) {
    console.error(JSON.stringify({ event: 'FI_BUDGET_EXPENSES_FAIL', error: error.message }))
    return null
  }

  if (!categories || categories.length === 0) {
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
