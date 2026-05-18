'use server'

import { getSupabaseClient } from '@/lib/supabase/client'
import { revalidatePath } from 'next/cache'
import { calculateZakatMaal, type ZakatMaalInput, type ZakatMaalResult } from '@/lib/utils/zakat-maal'
import { calculateZakatFitrah, type ZakatFitrahInput, type ZakatFitrahResult } from '@/lib/utils/zakat-fitrah'
import type { GivingGoalType } from '@/types/giving'
import { ensureGivingGoalsExist, getGivingGoal, getGivingTransactions } from '@/lib/supabase/queries/giving'

export async function calculateZakatMaalAction(input: ZakatMaalInput): Promise<ZakatMaalResult> {
  'use server'
  return calculateZakatMaal(input)
}

export async function calculateZakatFitrahAction(input: ZakatFitrahInput): Promise<ZakatFitrahResult> {
  'use server'
  return calculateZakatFitrah(input)
}

export async function updateGivingSettingsAction(
  userId: string,
  updates: {
    nama?: string
    namaLengkap?: string
    email?: string
    zakatAutoRate?: number
    compassionFixedAmount?: number
    donationAutoRate?: number
  }
): Promise<{ success: boolean; error?: string }> {
  'use server'
  
  const supabase = getSupabaseClient()

  const dbUpdates: Record<string, unknown> = {}
  if (updates.nama !== undefined) dbUpdates.nama = updates.nama
  if (updates.namaLengkap !== undefined) dbUpdates.nama_lengkap = updates.namaLengkap
  if (updates.email !== undefined) dbUpdates.email = updates.email
  // Allocation fields with validation (FR-010)
  if (updates.zakatAutoRate !== undefined) {
    if (updates.zakatAutoRate < 0 || updates.zakatAutoRate > 100) return { success: false, error: 'zakatAutoRate must be between 0 and 100' }
    dbUpdates.zakat_auto_rate = updates.zakatAutoRate
  }
  if (updates.donationAutoRate !== undefined) {
    if (updates.donationAutoRate < 0 || updates.donationAutoRate > 100) return { success: false, error: 'donationAutoRate must be between 0 and 100' }
    dbUpdates.donation_auto_rate = updates.donationAutoRate
  }
  if (updates.compassionFixedAmount !== undefined) {
    if (updates.compassionFixedAmount < 0) return { success: false, error: 'compassionFixedAmount must be >= 0' }
    dbUpdates.compassion_fixed_amount = updates.compassionFixedAmount
  }

  dbUpdates.updated_at = new Date().toISOString()

  const { error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/giving')
  return { success: true }
}

export async function createGivingGoalAction(
  householdId: string,
  goalType: GivingGoalType,
  name: string
): Promise<{ success: boolean; error?: string; goalId?: string }> {
  'use server'
  
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('financial_goals')
    .insert({
      household_id: householdId,
      goal_type: goalType,
      name,
      target_amount: 0,
      current_amount: 0,
      is_locked: false,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/giving')
  return { success: true, goalId: data.id }
}

export async function recordGivingTransactionAction(
  householdId: string,
  userId: string,
  goalId: string,
  categoryId: string,
  type: 'transfer' | 'expense',
  amount: number,
  description: string,
  transactionDate: Date
): Promise<{ success: boolean; error?: string; transactionId?: string }> {
  'use server'
  
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      household_id: householdId,
      user_id: userId,
      category_id: categoryId,
      type,
      amount,
      description,
      transaction_date: transactionDate.toISOString().split('T')[0],
      goal_id: goalId,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  const { error: updateError } = await supabase.rpc('update_goal_balance', {
    p_goal_id: goalId,
    p_amount: type === 'transfer' ? amount : -amount,
  })

  if (updateError) {
    console.error(JSON.stringify({ event: 'GOAL_BALANCE_UPDATE_FAIL', error: updateError.message }))
  }

  revalidatePath('/giving')
  return { success: true, transactionId: data.id }
}

// Create an income transaction and auto-allocate based on profile settings (FR-004)
export async function recordIncomeWithAutoAllocationAction(
  householdId: string,
  userId: string,
  incomeCategoryId: string,
  amount: number,
  description: string,
  transactionDate: Date
): Promise<{ success: boolean; error?: string; incomeId?: string; earmarks?: { goal: string; amount: number }[] }> {
  'use server'

  const supabase = getSupabaseClient()

  // 1) Read settings from profiles
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('zakat_auto_rate, donation_auto_rate, compassion_fixed_amount')
    .eq('id', userId)
    .single()

  if (profileErr) return { success: false, error: profileErr.message }

  // 2) Create the income transaction
  const { data: income, error: incomeErr } = await supabase
    .from('transactions')
    .insert({
      household_id: householdId,
      user_id: userId,
      category_id: incomeCategoryId,
      type: 'income',
      amount,
      description,
      transaction_date: transactionDate.toISOString().split('T')[0],
    })
    .select()
    .single()

  if (incomeErr) return { success: false, error: incomeErr.message }

  // 3) Ensure giving goals exist
  const goals = await ensureGivingGoalsExist(householdId)

  const earmarks: { goal: string; amount: number }[] = []

  // 4) Percentage earmarks: zakat + donation
  const pctEarmark = async (rate: number | null, goalType: GivingGoalType) => {
    if (!rate || rate <= 0) return
    const goal = goals.find((g) => g.goalType === goalType) || (await getGivingGoal(householdId, goalType))
    if (!goal) return
    const earmarkAmount = Math.round((amount * (rate / 100)) * 100) / 100
    if (earmarkAmount <= 0) return
    const { error } = await supabase
      .from('transactions')
      .insert({
        household_id: householdId,
        user_id: userId,
        category_id: incomeCategoryId,
        type: 'transfer',
        amount: earmarkAmount,
        description: `[Auto] ${goal.name}`,
        transaction_date: transactionDate.toISOString().split('T')[0],
        goal_id: goal.id,
      })
    if (!error) earmarks.push({ goal: goal.name, amount: earmarkAmount })
  }

  await pctEarmark(profile.zakat_auto_rate ?? 0, 'giving_zakat')
  await pctEarmark(profile.donation_auto_rate ?? 0, 'giving_donation')

  // 5) Compassion fixed amount once per month
  const compassion = goals.find((g) => g.goalType === 'giving_compassion')
  if (compassion && (profile.compassion_fixed_amount ?? 0) > 0) {
    const startOfMonth = new Date(transactionDate)
    startOfMonth.setDate(1)
    const endOfMonth = new Date(startOfMonth)
    endOfMonth.setMonth(endOfMonth.getMonth() + 1)
    endOfMonth.setDate(0)

    const history = await getGivingTransactions(householdId, compassion.id, startOfMonth, endOfMonth)
    const alreadyEarmarked = history.some((t) => t.type === 'transfer')
    if (!alreadyEarmarked) {
      const { error } = await supabase
        .from('transactions')
        .insert({
          household_id: householdId,
          user_id: userId,
          category_id: incomeCategoryId,
          type: 'transfer',
          amount: Number(profile.compassion_fixed_amount),
          description: `[Auto] Compassion Fund`,
          transaction_date: transactionDate.toISOString().split('T')[0],
          goal_id: compassion.id,
        })
      if (!error) earmarks.push({ goal: compassion.name, amount: Number(profile.compassion_fixed_amount) })
    }
  }

  revalidatePath('/giving')
  return { success: true, incomeId: income.id, earmarks }
}

// Record a Compassion Fund disbursement (US3)
export async function recordDisbursementAction(
  householdId: string,
  userId: string,
  compassionGoalId: string,
  categoryId: string,
  amount: number,
  description: string,
  transactionDate: Date
): Promise<{ success: boolean; error?: string; transactionId?: string }> {
  'use server'

  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      household_id: householdId,
      user_id: userId,
      category_id: categoryId,
      type: 'expense',
      amount,
      description,
      transaction_date: transactionDate.toISOString().split('T')[0],
      goal_id: compassionGoalId,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/giving')
  return { success: true, transactionId: data.id }
}
