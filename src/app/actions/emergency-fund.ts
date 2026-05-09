'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { EmergencyFundSetupInput } from '@/types/emergency-fund'
import { calculateEmergencyFundTarget } from '@/lib/utils/emergency-fund'

export async function setupEmergencyFund(
  userId: string,
  householdId: string,
  input: EmergencyFundSetupInput
) {
  const supabase = await getSupabaseServerClient()

  const target = calculateEmergencyFundTarget(
    input.maritalStatus,
    input.dependents,
    input.monthlyLivingExpenseEstimate
  )

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      marital_status: input.maritalStatus,
      dependents: input.dependents,
      monthly_living_expense_estimate: input.monthlyLivingExpenseEstimate,
      emergency_fund_target: target,
      emergency_fund_target_overridden: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (profileError) {
    console.error(JSON.stringify({ event: 'EMERGENCY_FUND_SETUP_FAIL', error: profileError.message }))
    throw new Error(profileError.message)
  }

  const { data: goal, error: goalError } = await supabase
    .from('financial_goals')
    .insert({
      household_id: householdId,
      goal_type: 'emergency',
      name: 'Emergency Fund',
      target_amount: target,
      current_amount: 0,
      is_locked: true,
    })
    .select()
    .single()

  if (goalError) {
    console.error(JSON.stringify({ event: 'EMERGENCY_GOAL_CREATE_FAIL', error: goalError.message }))
    throw new Error(goalError.message)
  }

  revalidatePath('/')

  return {
    profile: {
      id: profile.id,
      householdId: profile.household_id,
      maritalStatus: profile.marital_status,
      dependents: profile.dependents,
      monthlyLivingExpenseEstimate: Number(profile.monthly_living_expense_estimate),
      emergencyFundTarget: Number(profile.emergency_fund_target),
      emergencyFundTargetOverridden: profile.emergency_fund_target_overridden,
    },
    goal: {
      id: goal.id,
      householdId: goal.household_id,
      goalType: goal.goal_type,
      name: goal.name,
      targetAmount: Number(goal.target_amount),
      currentAmount: Number(goal.current_amount),
      isLocked: goal.is_locked,
    },
  }
}

export async function updateEmergencyFundTarget(
  userId: string,
  overrideAmount: number
) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .update({
      emergency_fund_target_override: overrideAmount,
      emergency_fund_target_overridden: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'EMERGENCY_TARGET_OVERRIDE_FAIL', error: error.message }))
    throw new Error(error.message)
  }

  revalidatePath('/')

  return {
    id: data.id,
    householdId: data.household_id,
    maritalStatus: data.marital_status,
    dependents: data.dependents,
    monthlyLivingExpenseEstimate: Number(data.monthly_living_expense_estimate),
    emergencyFundTarget: Number(data.emergency_fund_target),
    emergencyFundTargetOverride: Number(data.emergency_fund_target_override),
    emergencyFundTargetOverridden: data.emergency_fund_target_overridden,
  }
}

export async function recalculateEmergencyFundTarget(userId: string) {
  const supabase = await getSupabaseServerClient()

  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (fetchError || !profile) {
    console.error(JSON.stringify({ event: 'EMERGENCY_FETCH_FAIL', error: fetchError?.message }))
    throw new Error(fetchError?.message || 'Profile not found')
  }

  if (!profile.marital_status || profile.dependents === null || !profile.monthly_living_expense_estimate) {
    throw new Error('Missing profile data for recalculation')
  }

  const newTarget = calculateEmergencyFundTarget(
    profile.marital_status,
    profile.dependents,
    Number(profile.monthly_living_expense_estimate)
  )

  const { data, error } = await supabase
    .from('profiles')
    .update({
      emergency_fund_target: newTarget,
      emergency_fund_target_overridden: false,
      emergency_fund_target_override: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'EMERGENCY_RECALCULATE_FAIL', error: error.message }))
    throw new Error(error.message)
  }

  revalidatePath('/')

  return {
    id: data.id,
    householdId: data.household_id,
    emergencyFundTarget: Number(data.emergency_fund_target),
    emergencyFundTargetOverridden: data.emergency_fund_target_overridden,
  }
}

export async function addToEmergencyFund(goalId: string, amount: number) {
  const supabase = await getSupabaseServerClient()

  const { data: goal, error: fetchError } = await supabase
    .from('financial_goals')
    .select('current_amount')
    .eq('id', goalId)
    .single()

  if (fetchError) {
    console.error(JSON.stringify({ event: 'EMERGENCY_GOAL_FETCH_FAIL', error: fetchError.message }))
    throw new Error(fetchError.message)
  }

  const newAmount = Number(goal.current_amount) + amount

  const { data, error } = await supabase
    .from('financial_goals')
    .update({
      current_amount: newAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', goalId)
    .select()
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'EMERGENCY_ADD_FAIL', error: error.message }))
    throw new Error(error.message)
  }

  revalidatePath('/')

  return {
    id: data.id,
    currentAmount: Number(data.current_amount),
  }
}

export async function withdrawFromEmergencyFund(goalId: string, amount: number) {
  const supabase = await getSupabaseServerClient()

  const { data: goal, error: fetchError } = await supabase
    .from('financial_goals')
    .select('current_amount')
    .eq('id', goalId)
    .single()

  if (fetchError) {
    console.error(JSON.stringify({ event: 'EMERGENCY_GOAL_FETCH_FAIL', error: fetchError.message }))
    throw new Error(fetchError.message)
  }

  const newAmount = Math.max(0, Number(goal.current_amount) - amount)

  const { data, error } = await supabase
    .from('financial_goals')
    .update({
      current_amount: newAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', goalId)
    .select()
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'EMERGENCY_WITHDRAW_FAIL', error: error.message }))
    throw new Error(error.message)
  }

  revalidatePath('/')

  return {
    id: data.id,
    currentAmount: Number(data.current_amount),
  }
}
