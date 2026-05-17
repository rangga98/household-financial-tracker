import { getSupabaseClient } from '@/lib/supabase/client'
import { derivePremiumStatus, getDaysUntilDue, calculateCoverageGap } from '@/lib/utils/insurance'
import type {
  InsurancePolicy,
  InsurancePremiumRecord,
  ProtectionTarget,
  PolicyWithStatus,
  InsuranceDashboardData,
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

export async function getInsurancePolicies(householdId: string): Promise<InsurancePolicy[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('insurance_policies')
    .select(POLICY_SELECT)
    .eq('household_id', householdId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(JSON.stringify({ event: 'INSURANCE_POLICIES_FETCH_FAIL', error: error.message }))
    return []
  }

  return (data ?? []).map(mapRowToPolicy)
}

export async function getInsurancePolicyById(id: string): Promise<InsurancePolicy | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('insurance_policies')
    .select(POLICY_SELECT)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) return null
  return mapRowToPolicy(data)
}

export async function getTotalCoverage(householdId: string): Promise<number> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('insurance_policies')
    .select('coverage_amount')
    .eq('household_id', householdId)
    .eq('is_active', true)
    .is('deleted_at', null)

  if (error) {
    console.error(JSON.stringify({ event: 'TOTAL_COVERAGE_FETCH_FAIL', error: error.message }))
    return 0
  }

  return (data ?? []).reduce((sum: number, row: { coverage_amount: unknown }) => sum + Number(row.coverage_amount), 0)
}

export async function getLastPremiumPayment(
  policyId: string
): Promise<InsurancePremiumRecord | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('transactions')
    .select('id, policy_id, amount, transaction_date, description')
    .eq('policy_id', policyId)
    .eq('type', 'expense')
    .order('transaction_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id as string,
    policyId: data.policy_id as string,
    amount: Number(data.amount),
    transactionDate: data.transaction_date as string,
    notes: (data.description as string | null) ?? null,
  }
}

export async function getProtectionTarget(
  householdId: string
): Promise<ProtectionTarget | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('financial_goals')
    .select('id, household_id, target_amount')
    .eq('household_id', householdId)
    .eq('goal_type', 'protection_target')
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id as string,
    householdId: data.household_id as string,
    targetAmount: Number(data.target_amount),
  }
}

export async function getInsuranceDashboardData(
  householdId: string
): Promise<InsuranceDashboardData> {
  const today = new Date()

  const [policies, totalCoverage, protectionTarget] = await Promise.all([
    getInsurancePolicies(householdId),
    getTotalCoverage(householdId),
    getProtectionTarget(householdId),
  ])

  const lastPayments = await Promise.all(
    policies.map((p) => getLastPremiumPayment(p.id))
  )

  const policiesWithStatus: PolicyWithStatus[] = policies.map((policy, i) => {
    const lastPayment = lastPayments[i]
    const premiumStatus = derivePremiumStatus(
      policy.nextDueDate,
      lastPayment?.transactionDate ?? null,
      today
    )
    const daysUntilDue =
      premiumStatus === 'paid' || premiumStatus === 'one-time'
        ? null
        : getDaysUntilDue(policy.nextDueDate, today)

    return { ...policy, premiumStatus, daysUntilDue }
  })

  policiesWithStatus.sort((a, b) => {
    const order: Record<string, number> = { overdue: 0, upcoming: 1, paid: 2, 'one-time': 3 }
    const diff = (order[a.premiumStatus] ?? 4) - (order[b.premiumStatus] ?? 4)
    if (diff !== 0) return diff
    if (a.daysUntilDue !== null && b.daysUntilDue !== null) return a.daysUntilDue - b.daysUntilDue
    return 0
  })

  const coverageStatus = calculateCoverageGap(
    totalCoverage,
    protectionTarget?.targetAmount ?? null
  )

  return { policies: policiesWithStatus, coverageStatus, protectionTarget }
}
