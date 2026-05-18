'use server'

import { getSupabaseClient } from '@/lib/supabase/client'
import { revalidatePath } from 'next/cache'
import { calculateZakatMaal, type ZakatMaalInput, type ZakatMaalResult } from '@/lib/utils/zakat-maal'
import { calculateZakatFitrah, type ZakatFitrahInput, type ZakatFitrahResult } from '@/lib/utils/zakat-fitrah'
import type { GivingGoalType } from '@/types/giving'

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
  }
): Promise<{ success: boolean; error?: string }> {
  'use server'
  
  const supabase = getSupabaseClient()

  const dbUpdates: Record<string, unknown> = {}
  if (updates.nama !== undefined) dbUpdates.nama = updates.nama
  if (updates.namaLengkap !== undefined) dbUpdates.nama_lengkap = updates.namaLengkap
  if (updates.email !== undefined) dbUpdates.email = updates.email

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
