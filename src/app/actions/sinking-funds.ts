'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { SinkingFund, SinkingFundContribution, ActionResult } from '@/types/sinking-funds'

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

export async function createSinkingFund(payload: {
  name: string
  targetAmount: number
  targetDate: string | null
  description: string | null
  householdId: string
}): Promise<ActionResult<SinkingFund>> {
  if (!payload.name.trim()) {
    return { success: false, error: 'Fund name is required' }
  }
  if (payload.targetAmount <= 0) {
    return { success: false, error: 'Target amount must be greater than zero' }
  }

  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('financial_goals')
    .insert({
      household_id: payload.householdId,
      goal_type: 'sinking',
      name: payload.name.trim(),
      target_amount: payload.targetAmount,
      current_amount: 0,
      target_date: payload.targetDate ?? null,
      description: payload.description?.trim() ?? null,
    })
    .select('id, household_id, name, target_amount, current_amount, target_date, description, created_at, updated_at')
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'SINKING_FUND_CREATE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/sinking-funds')
  return { success: true, data: mapRowToSinkingFund(data) }
}

export async function updateSinkingFund(
  id: string,
  payload: {
    name: string
    targetAmount: number
    targetDate: string | null
    description: string | null
  }
): Promise<ActionResult<SinkingFund>> {
  if (!payload.name.trim()) {
    return { success: false, error: 'Fund name is required' }
  }
  if (payload.targetAmount <= 0) {
    return { success: false, error: 'Target amount must be greater than zero' }
  }

  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('financial_goals')
    .update({
      name: payload.name.trim(),
      target_amount: payload.targetAmount,
      target_date: payload.targetDate ?? null,
      description: payload.description?.trim() ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('goal_type', 'sinking')
    .is('deleted_at', null)
    .select('id, household_id, name, target_amount, current_amount, target_date, description, created_at, updated_at')
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'SINKING_FUND_UPDATE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/sinking-funds')
  return { success: true, data: mapRowToSinkingFund(data) }
}

export async function deleteSinkingFund(id: string): Promise<ActionResult> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('financial_goals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('goal_type', 'sinking')

  if (error) {
    console.error(JSON.stringify({ event: 'SINKING_FUND_DELETE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/sinking-funds')
  return { success: true, data: undefined }
}

export async function recordContribution(payload: {
  goalId: string
  amount: number
  transactionDate: string
  notes: string | null
  householdId: string
}): Promise<ActionResult<SinkingFundContribution>> {
  if (payload.amount <= 0) {
    return { success: false, error: 'Contribution amount must be greater than zero' }
  }
  if (!payload.goalId) {
    return { success: false, error: 'Goal ID is required' }
  }
  if (!payload.transactionDate) {
    return { success: false, error: 'Transaction date is required' }
  }

  const supabase = await getSupabaseServerClient()

  // Fetch the first active user in the household
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('household_id', payload.householdId)
    .eq('is_active', true)
    .limit(1)

  if (profileError || !profiles || profiles.length === 0) {
    return { success: false, error: 'No active user found for this household' }
  }
  const userId = profiles[0].id

  // Find or create a "Sinking Fund" category for this household
  const { data: categories } = await supabase
    .from('categories')
    .select('id')
    .eq('household_id', payload.householdId)
    .eq('name', 'Sinking Fund')
    .limit(1)

  let categoryId: string
  if (categories && categories.length > 0) {
    categoryId = categories[0].id
  } else {
    // Create a default Sinking Fund category
    const { data: newCat, error: catError } = await supabase
      .from('categories')
      .insert({
        household_id: payload.householdId,
        name: 'Sinking Fund',
        type: 'fixed',
        icon: 'piggy-bank',
        color: '#3b82f6',
        is_active: true,
      })
      .select('id')
      .single()

    if (catError || !newCat) {
      return { success: false, error: 'Could not create Sinking Fund category: ' + (catError?.message || 'unknown') }
    }
    categoryId = newCat.id
  }

  const { data: txData, error: txError } = await supabase
    .from('transactions')
    .insert({
      household_id: payload.householdId,
      user_id: userId,
      category_id: categoryId,
      goal_id: payload.goalId,
      amount: payload.amount,
      type: 'expense',
      transaction_date: payload.transactionDate,
      description: payload.notes?.trim() || 'Sinking fund contribution',
      is_scheduled: false,
    })
    .select('id, goal_id, amount, transaction_date, description')
    .single()

  if (txError) {
    console.error(JSON.stringify({ event: 'CONTRIBUTION_CREATE_FAIL', error: txError.message }))
    return { success: false, error: txError.message }
  }

  const { data: goal, error: fetchError } = await supabase
    .from('financial_goals')
    .select('current_amount')
    .eq('id', payload.goalId)
    .single()

  if (fetchError) {
    console.error(JSON.stringify({ event: 'GOAL_FETCH_FAIL', error: fetchError.message }))
  } else {
    const newAmount = Number(goal.current_amount) + payload.amount
    const { error: updateError } = await supabase
      .from('financial_goals')
      .update({ current_amount: newAmount, updated_at: new Date().toISOString() })
      .eq('id', payload.goalId)

    if (updateError) {
      console.error(JSON.stringify({ event: 'GOAL_AMOUNT_UPDATE_FAIL', error: updateError.message }))
    }
  }

  revalidatePath('/sinking-funds')

  return {
    success: true,
    data: {
      id: txData.id as string,
      goalId: txData.goal_id as string,
      amount: Number(txData.amount),
      transactionDate: txData.transaction_date as string,
      notes: (txData.description as string | null) ?? null,
    },
  }
}
