import { getSupabaseClient } from '@/lib/supabase/client'
import type { SinkingFund, SinkingFundContribution } from '@/types/sinking-funds'

function mapRowToSinkingFund(data: Record<string, unknown>): SinkingFund {
  return {
    id: data.id as string,
    householdId: data.household_id as string,
    name: data.name as string,
    targetAmount: Number(data.target_amount),
    currentAmount: Number(data.current_amount),
    targetDate: (data.target_date as string | null) ?? null,
    description: (data.description as string | null) ?? null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

export async function getSinkingFunds(householdId: string): Promise<SinkingFund[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('financial_goals')
    .select('id, household_id, name, target_amount, current_amount, target_date, description, created_at, updated_at')
    .eq('household_id', householdId)
    .eq('goal_type', 'sinking')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(JSON.stringify({ event: 'SINKING_FUNDS_FETCH_FAIL', error: error.message }))
    return []
  }

  return (data ?? []).map(mapRowToSinkingFund)
}

export async function getSinkingFundById(id: string): Promise<SinkingFund | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('financial_goals')
    .select('id, household_id, name, target_amount, current_amount, target_date, description, created_at, updated_at')
    .eq('id', id)
    .eq('goal_type', 'sinking')
    .is('deleted_at', null)
    .single()

  if (error) {
    return null
  }

  return mapRowToSinkingFund(data)
}

export async function getContributionsByGoal(goalId: string): Promise<SinkingFundContribution[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('transactions')
    .select('id, goal_id, amount, transaction_date, description')
    .eq('goal_id', goalId)
    .order('transaction_date', { ascending: false })

  if (error) {
    console.error(JSON.stringify({ event: 'SINKING_CONTRIBUTIONS_FETCH_FAIL', error: error.message }))
    return []
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    goalId: row.goal_id as string,
    amount: Number(row.amount),
    transactionDate: row.transaction_date as string,
    notes: (row.description as string | null) ?? null,
  }))
}
