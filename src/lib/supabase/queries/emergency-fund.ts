import { getSupabaseClient } from '@/lib/supabase/client'
import type { UserProfile, FinancialGoal } from '@/types/emergency-fund'

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return null
  }

  return {
    id: data.id,
    householdId: data.household_id,
    maritalStatus: data.marital_status,
    dependents: data.dependents,
    monthlyLivingExpenseEstimate: data.monthly_living_expense_estimate
      ? Number(data.monthly_living_expense_estimate)
      : null,
    emergencyFundTarget: data.emergency_fund_target
      ? Number(data.emergency_fund_target)
      : null,
    emergencyFundTargetOverride: data.emergency_fund_target_override
      ? Number(data.emergency_fund_target_override)
      : null,
    emergencyFundTargetOverridden: data.emergency_fund_target_overridden || false,
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    maritalStatus: 'single' | 'married'
    dependents: number
    monthlyLivingExpenseEstimate: number
    emergencyFundTarget: number
    emergencyFundTargetOverride: number
    emergencyFundTargetOverridden: boolean
  }>
): Promise<UserProfile | null> {
  const supabase = getSupabaseClient()

  const dbUpdates: Record<string, unknown> = {}
  if (updates.maritalStatus !== undefined) dbUpdates.marital_status = updates.maritalStatus
  if (updates.dependents !== undefined) dbUpdates.dependents = updates.dependents
  if (updates.monthlyLivingExpenseEstimate !== undefined)
    dbUpdates.monthly_living_expense_estimate = updates.monthlyLivingExpenseEstimate
  if (updates.emergencyFundTarget !== undefined)
    dbUpdates.emergency_fund_target = updates.emergencyFundTarget
  if (updates.emergencyFundTargetOverride !== undefined)
    dbUpdates.emergency_fund_target_override = updates.emergencyFundTargetOverride
  if (updates.emergencyFundTargetOverridden !== undefined)
    dbUpdates.emergency_fund_target_overridden = updates.emergencyFundTargetOverridden

  dbUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    id: data.id,
    householdId: data.household_id,
    maritalStatus: data.marital_status,
    dependents: data.dependents,
    monthlyLivingExpenseEstimate: data.monthly_living_expense_estimate
      ? Number(data.monthly_living_expense_estimate)
      : null,
    emergencyFundTarget: data.emergency_fund_target
      ? Number(data.emergency_fund_target)
      : null,
    emergencyFundTargetOverride: data.emergency_fund_target_override
      ? Number(data.emergency_fund_target_override)
      : null,
    emergencyFundTargetOverridden: data.emergency_fund_target_overridden || false,
  }
}

export async function getEmergencyGoal(householdId: string): Promise<FinancialGoal | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('financial_goals')
    .select('*')
    .eq('household_id', householdId)
    .eq('goal_type', 'emergency')
    .is('deleted_at', null)
    .single()

  if (error) {
    return null
  }

  return {
    id: data.id,
    householdId: data.household_id,
    goalType: data.goal_type,
    name: data.name,
    targetAmount: Number(data.target_amount),
    currentAmount: Number(data.current_amount),
    isLocked: data.is_locked,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

export async function createEmergencyGoal(
  householdId: string,
  targetAmount: number
): Promise<FinancialGoal> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('financial_goals')
    .insert({
      household_id: householdId,
      goal_type: 'emergency',
      name: 'Emergency Fund',
      target_amount: targetAmount,
      current_amount: 0,
      is_locked: true,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    id: data.id,
    householdId: data.household_id,
    goalType: data.goal_type,
    name: data.name,
    targetAmount: Number(data.target_amount),
    currentAmount: Number(data.current_amount),
    isLocked: data.is_locked,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

export async function updateEmergencyGoal(
  goalId: string,
  updates: Partial<{
    targetAmount: number
    currentAmount: number
  }>
): Promise<FinancialGoal> {
  const supabase = getSupabaseClient()

  const dbUpdates: Record<string, unknown> = {}
  if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount
  if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount
  dbUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('financial_goals')
    .update(dbUpdates)
    .eq('id', goalId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    id: data.id,
    householdId: data.household_id,
    goalType: data.goal_type,
    name: data.name,
    targetAmount: Number(data.target_amount),
    currentAmount: Number(data.current_amount),
    isLocked: data.is_locked,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

export async function getTotalFunds(householdId: string): Promise<number> {
  const supabase = getSupabaseClient()

  const { data: income } = await supabase
    .from('transactions')
    .select('amount')
    .eq('household_id', householdId)
    .eq('type', 'income')

  const { data: expenses } = await supabase
    .from('transactions')
    .select('amount')
    .eq('household_id', householdId)
    .eq('type', 'expense')

  const totalIn = (income || []).reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0)
  const totalOut = (expenses || []).reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0)

  return totalIn - totalOut
}
