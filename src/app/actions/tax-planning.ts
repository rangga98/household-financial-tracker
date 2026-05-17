'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type {
  TaxObligation,
  TaxFilingDeadline,
  CreateTaxObligationInput,
  UpdateTaxObligationInput,
  CreateFilingDeadlineInput,
  FlagDeductionInput,
  ActionResult,
} from '@/types/tax-planning'

const OBLIGATION_SELECT =
  'id, household_id, name, tax_type, target_amount, current_amount, target_date, description, created_at, updated_at'

const DEADLINE_SELECT =
  'id, household_id, tax_type, fiscal_year, filing_deadline, status, filed_at, notes, created_at, updated_at'

function mapRowToObligation(row: Record<string, unknown>): TaxObligation {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    name: row.name as string,
    taxType: row.tax_type as TaxObligation['taxType'],
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    targetDate: row.target_date as string,
    notes: (row.description as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapRowToDeadline(row: Record<string, unknown>): TaxFilingDeadline {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    taxType: row.tax_type as TaxFilingDeadline['taxType'],
    fiscalYear: Number(row.fiscal_year),
    filingDeadline: row.filing_deadline as string,
    status: row.status as TaxFilingDeadline['status'],
    filedAt: (row.filed_at as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

async function checkFiscalYearLocked(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  householdId: string,
  fiscalYear: number
): Promise<boolean> {
  const { data } = await supabase
    .from('tax_filing_deadlines')
    .select('id')
    .eq('household_id', householdId)
    .eq('fiscal_year', fiscalYear)
    .eq('status', 'filed')
    .limit(1)
    .maybeSingle()
  return data !== null
}

// ─── Tax Obligation Actions ─────────────────────────────────────────────────────

export async function createTaxObligation(
  payload: CreateTaxObligationInput
): Promise<ActionResult<TaxObligation>> {
  if (!payload.name.trim()) {
    return { success: false, error: 'Obligation name is required' }
  }
  if (payload.targetAmount <= 0) {
    return { success: false, error: 'Target amount must be greater than zero' }
  }

  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('financial_goals')
    .insert({
      household_id: payload.householdId,
      goal_type: 'tax_obligation',
      tax_type: payload.taxType,
      name: payload.name.trim(),
      target_amount: payload.targetAmount,
      current_amount: 0,
      target_date: payload.targetDate,
      description: payload.notes?.trim() || null,
    })
    .select(OBLIGATION_SELECT)
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'TAX_OBLIGATION_CREATE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/tax-planning')
  return { success: true, data: mapRowToObligation(data) }
}

export async function updateTaxObligation(
  id: string,
  payload: UpdateTaxObligationInput
): Promise<ActionResult<TaxObligation>> {
  if (!payload.name.trim()) {
    return { success: false, error: 'Obligation name is required' }
  }
  if (payload.targetAmount <= 0) {
    return { success: false, error: 'Target amount must be greater than zero' }
  }

  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('financial_goals')
    .update({
      name: payload.name.trim(),
      tax_type: payload.taxType,
      target_amount: payload.targetAmount,
      target_date: payload.targetDate,
      description: payload.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(OBLIGATION_SELECT)
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'TAX_OBLIGATION_UPDATE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/tax-planning')
  return { success: true, data: mapRowToObligation(data) }
}

export async function deleteTaxObligation(id: string): Promise<ActionResult> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('financial_goals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) {
    console.error(JSON.stringify({ event: 'TAX_OBLIGATION_DELETE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/tax-planning')
  return { success: true, data: undefined }
}

export async function renewTaxObligation(
  id: string,
  payload: { newTargetDate: string; newTargetAmount: number }
): Promise<ActionResult<TaxObligation>> {
  if (payload.newTargetAmount <= 0) {
    return { success: false, error: 'Target amount must be greater than zero' }
  }

  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('financial_goals')
    .update({
      target_date: payload.newTargetDate,
      target_amount: payload.newTargetAmount,
      current_amount: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(OBLIGATION_SELECT)
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'TAX_OBLIGATION_RENEW_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/tax-planning')
  return { success: true, data: mapRowToObligation(data) }
}

// ─── Filing Deadline Actions ────────────────────────────────────────────────────

export async function createFilingDeadline(
  payload: CreateFilingDeadlineInput
): Promise<ActionResult<TaxFilingDeadline>> {
  if (!Number.isInteger(payload.fiscalYear) || payload.fiscalYear <= 0) {
    return { success: false, error: 'Fiscal year must be a positive integer' }
  }

  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('tax_filing_deadlines')
    .insert({
      household_id: payload.householdId,
      tax_type: payload.taxType,
      fiscal_year: payload.fiscalYear,
      filing_deadline: payload.filingDeadline,
      status: 'pending',
      notes: payload.notes?.trim() || null,
    })
    .select(DEADLINE_SELECT)
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Duplicate filing deadline for this tax type and fiscal year' }
    }
    console.error(JSON.stringify({ event: 'FILING_DEADLINE_CREATE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/tax-planning')
  return { success: true, data: mapRowToDeadline(data) }
}

export async function markFilingDeadlineAsFiled(
  id: string
): Promise<ActionResult<TaxFilingDeadline>> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('tax_filing_deadlines')
    .update({
      status: 'filed',
      filed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(DEADLINE_SELECT)
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'FILING_DEADLINE_MARK_FILED_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/tax-planning')
  return { success: true, data: mapRowToDeadline(data) }
}

export async function unarchiveFilingDeadline(
  id: string
): Promise<ActionResult<TaxFilingDeadline>> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('tax_filing_deadlines')
    .update({
      status: 'pending',
      filed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(DEADLINE_SELECT)
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'FILING_DEADLINE_UNARCHIVE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/tax-planning')
  return { success: true, data: mapRowToDeadline(data) }
}

// ─── Deduction Actions ──────────────────────────────────────────────────────────

export async function flagTransactionAsDeductible(
  payload: FlagDeductionInput & { householdId?: string }
): Promise<ActionResult> {
  if (!Number.isInteger(payload.fiscalYear) || payload.fiscalYear <= 0) {
    return { success: false, error: 'Fiscal year must be a positive integer' }
  }

  const supabase = await getSupabaseServerClient()

  const locked = await checkFiscalYearLocked(supabase, payload.householdId ?? '', payload.fiscalYear)
  if (locked) {
    return {
      success: false,
      error: `Fiscal year ${payload.fiscalYear} is archived. Unarchive to make changes.`,
    }
  }

  const { error } = await supabase
    .from('transactions')
    .update({
      is_tax_deductible: true,
      fiscal_year: payload.fiscalYear,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.transactionId)

  if (error) {
    console.error(JSON.stringify({ event: 'FLAG_DEDUCTIBLE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/tax-planning')
  return { success: true, data: undefined }
}

export async function unflagTransactionAsDeductible(
  transactionId: string,
  householdId: string,
  fiscalYear: number
): Promise<ActionResult> {
  const supabase = await getSupabaseServerClient()

  const locked = await checkFiscalYearLocked(supabase, householdId, fiscalYear)
  if (locked) {
    return {
      success: false,
      error: `Fiscal year ${fiscalYear} is archived. Unarchive to make changes.`,
    }
  }

  const { error } = await supabase
    .from('transactions')
    .update({
      is_tax_deductible: false,
      fiscal_year: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transactionId)

  if (error) {
    console.error(JSON.stringify({ event: 'UNFLAG_DEDUCTIBLE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  revalidatePath('/tax-planning')
  return { success: true, data: undefined }
}
