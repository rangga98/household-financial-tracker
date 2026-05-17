'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { calculateNextPremiumDueDate } from '@/lib/utils/insurance'
import type {
  InsurancePolicy,
  InsurancePremiumRecord,
  ProtectionTarget,
  ActionResult,
} from '@/types/risk-management'

function mapRowToPolicy(row: Record<string, unknown>): InsurancePolicy {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    name: row.name as string,
    insuranceType: row.insurance_type as InsurancePolicy['insuranceType'],
    insurer: row.insurer as string,
    coverageAmount: Number(row.coverage_amount),
    premiumAmount: Number(row.premium_amount),
    paymentFrequency: row.payment_frequency as InsurancePolicy['paymentFrequency'],
    startDate: row.start_date as string,
    nextDueDate: (row.next_due_date as string | null) ?? null,
    isActive: row.is_active as boolean,
    notes: (row.notes as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

const POLICY_SELECT =
  'id, household_id, name, insurance_type, insurer, coverage_amount, premium_amount, payment_frequency, start_date, next_due_date, is_active, notes, created_at, updated_at'

export async function createInsurancePolicy(payload: {
  householdId: string
  name: string
  insuranceType: InsurancePolicy['insuranceType']
  insurer: string
  coverageAmount: number
  premiumAmount: number
  paymentFrequency: InsurancePolicy['paymentFrequency']
  startDate: string
  nextDueDate: string | null
  notes: string | null
}): Promise<ActionResult<InsurancePolicy>> {
  if (!payload.name.trim()) {
    return { success: false, error: 'Policy name is required' }
  }
  if (!payload.insurer.trim()) {
    return { success: false, error: 'Insurer name is required' }
  }
  if (payload.premiumAmount <= 0) {
    return { success: false, error: 'Premium amount must be greater than zero' }
  }
  if (payload.paymentFrequency !== 'one-time' && !payload.nextDueDate) {
    return { success: false, error: 'Next due date is required for recurring premiums' }
  }

  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('insurance_policies')
    .insert({
      household_id: payload.householdId,
      name: payload.name.trim(),
      insurance_type: payload.insuranceType,
      insurer: payload.insurer.trim(),
      coverage_amount: payload.coverageAmount,
      premium_amount: payload.premiumAmount,
      payment_frequency: payload.paymentFrequency,
      start_date: payload.startDate,
      next_due_date: payload.paymentFrequency === 'one-time' ? null : payload.nextDueDate,
      is_active: true,
      notes: payload.notes?.trim() || null,
    })
    .select(POLICY_SELECT)
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'INSURANCE_POLICY_CREATE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/risk-management')
  return { success: true, data: mapRowToPolicy(data) }
}

export async function updateInsurancePolicy(
  id: string,
  payload: {
    name: string
    insuranceType: InsurancePolicy['insuranceType']
    insurer: string
    coverageAmount: number
    premiumAmount: number
    paymentFrequency: InsurancePolicy['paymentFrequency']
    startDate: string
    nextDueDate: string | null
    notes: string | null
  }
): Promise<ActionResult<InsurancePolicy>> {
  if (!payload.name.trim()) {
    return { success: false, error: 'Policy name is required' }
  }
  if (!payload.insurer.trim()) {
    return { success: false, error: 'Insurer name is required' }
  }
  if (payload.premiumAmount <= 0) {
    return { success: false, error: 'Premium amount must be greater than zero' }
  }
  if (payload.paymentFrequency !== 'one-time' && !payload.nextDueDate) {
    return { success: false, error: 'Next due date is required for recurring premiums' }
  }

  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('insurance_policies')
    .update({
      name: payload.name.trim(),
      insurance_type: payload.insuranceType,
      insurer: payload.insurer.trim(),
      coverage_amount: payload.coverageAmount,
      premium_amount: payload.premiumAmount,
      payment_frequency: payload.paymentFrequency,
      start_date: payload.startDate,
      next_due_date: payload.paymentFrequency === 'one-time' ? null : payload.nextDueDate,
      notes: payload.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .is('deleted_at', null)
    .select(POLICY_SELECT)
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'INSURANCE_POLICY_UPDATE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/risk-management')
  return { success: true, data: mapRowToPolicy(data) }
}

export async function deactivateInsurancePolicy(id: string): Promise<ActionResult> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('insurance_policies')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) {
    console.error(JSON.stringify({ event: 'INSURANCE_POLICY_DEACTIVATE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/risk-management')
  return { success: true, data: undefined }
}

export async function setProtectionTarget(payload: {
  householdId: string
  targetAmount: number
  existingGoalId: string | null
}): Promise<ActionResult<ProtectionTarget>> {
  if (payload.targetAmount <= 0) {
    return { success: false, error: 'Target amount must be greater than zero' }
  }

  const supabase = await getSupabaseServerClient()

  if (payload.existingGoalId) {
    const { data, error } = await supabase
      .from('financial_goals')
      .update({
        target_amount: payload.targetAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.existingGoalId)
      .eq('goal_type', 'protection_target')
      .select('id, household_id, target_amount')
      .single()

    if (error) {
      console.error(JSON.stringify({ event: 'PROTECTION_TARGET_UPDATE_FAIL', error: error.message }))
      return { success: false, error: error.message }
    }

    revalidatePath('/risk-management')
    return {
      success: true,
      data: {
        id: data.id as string,
        householdId: data.household_id as string,
        targetAmount: Number(data.target_amount),
      },
    }
  }

  const { data, error } = await supabase
    .from('financial_goals')
    .insert({
      household_id: payload.householdId,
      goal_type: 'protection_target',
      name: 'Family Protection Target',
      target_amount: payload.targetAmount,
      current_amount: 0,
    })
    .select('id, household_id, target_amount')
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'PROTECTION_TARGET_CREATE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/risk-management')
  return {
    success: true,
    data: {
      id: data.id as string,
      householdId: data.household_id as string,
      targetAmount: Number(data.target_amount),
    },
  }
}

export async function markPremiumPaid(payload: {
  policyId: string
  householdId: string
  paymentDate: string
  amount: number
}): Promise<ActionResult<InsurancePremiumRecord>> {
  if (payload.amount <= 0) {
    return { success: false, error: 'Payment amount must be greater than zero' }
  }

  const supabase = await getSupabaseServerClient()

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('household_id', payload.householdId)
    .eq('is_active', true)
    .limit(1)

  if (profileError || !profiles || profiles.length === 0) {
    return { success: false, error: 'No active user found for this household' }
  }
  const userId = profiles[0].id as string

  const { data: categories } = await supabase
    .from('categories')
    .select('id')
    .eq('household_id', payload.householdId)
    .eq('name', 'Insurance')
    .limit(1)

  let categoryId: string
  if (categories && categories.length > 0) {
    categoryId = categories[0].id as string
  } else {
    const { data: newCat, error: catError } = await supabase
      .from('categories')
      .insert({
        household_id: payload.householdId,
        name: 'Insurance',
        type: 'fixed',
        icon: 'shield',
        color: '#6366f1',
        is_active: true,
      })
      .select('id')
      .single()

    if (catError || !newCat) {
      return { success: false, error: 'Could not create Insurance category: ' + (catError?.message || 'unknown') }
    }
    categoryId = newCat.id as string
  }

  const { data: txData, error: txError } = await supabase
    .from('transactions')
    .insert({
      household_id: payload.householdId,
      user_id: userId,
      category_id: categoryId,
      policy_id: payload.policyId,
      amount: payload.amount,
      type: 'expense',
      transaction_date: payload.paymentDate,
      description: 'Insurance premium payment',
      is_scheduled: false,
    })
    .select('id, policy_id, amount, transaction_date, description')
    .single()

  if (txError) {
    console.error(JSON.stringify({ event: 'PREMIUM_PAYMENT_CREATE_FAIL', error: txError.message }))
    return { success: false, error: txError.message }
  }

  const { data: policy, error: policyError } = await supabase
    .from('insurance_policies')
    .select('next_due_date, payment_frequency')
    .eq('id', payload.policyId)
    .single()

  if (!policyError && policy?.next_due_date) {
    const nextDue = calculateNextPremiumDueDate(
      policy.next_due_date as string,
      policy.payment_frequency as InsurancePolicy['paymentFrequency']
    )
    await supabase
      .from('insurance_policies')
      .update({ next_due_date: nextDue, updated_at: new Date().toISOString() })
      .eq('id', payload.policyId)
  }

  revalidatePath('/risk-management')

  return {
    success: true,
    data: {
      id: txData.id as string,
      policyId: txData.policy_id as string,
      amount: Number(txData.amount),
      transactionDate: txData.transaction_date as string,
      notes: (txData.description as string | null) ?? null,
    },
  }
}

export async function seedHealthcareCategories(
  householdId: string
): Promise<ActionResult> {
  const supabase = await getSupabaseServerClient()

  const healthcareCategories = [
    { name: 'Dokter / Doctor', icon: 'stethoscope', color: '#0ea5e9' },
    { name: 'Farmasi / Pharmacy', icon: 'pill', color: '#10b981' },
    { name: 'Gigi / Dental', icon: 'smile', color: '#f59e0b' },
    { name: 'Mata / Vision', icon: 'eye', color: '#8b5cf6' },
    { name: 'Lab & Diagnostik', icon: 'flask-conical', color: '#ef4444' },
  ]

  for (const cat of healthcareCategories) {
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('household_id', householdId)
      .eq('name', cat.name)
      .limit(1)

    if (!existing || existing.length === 0) {
      await supabase.from('categories').insert({
        household_id: householdId,
        name: cat.name,
        type: 'variable',
        icon: cat.icon,
        color: cat.color,
        is_active: true,
      })
    }
  }

  revalidatePath('/risk-management')
  return { success: true, data: undefined }
}
