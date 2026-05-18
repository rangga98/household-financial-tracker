import { getSupabaseClient } from '@/lib/supabase/client'
import type { GivingSettings, GivingGoal, GivingTransaction, GivingSummary, GivingGoalType } from '@/types/giving'

export async function getGivingSettings(userId: string): Promise<GivingSettings | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, household_id, nama, nama_lengkap, email')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    householdId: data.household_id,
    userId: data.id,
    nama: data.nama,
    namaLengkap: data.nama_lengkap,
    email: data.email,
  }
}

export async function updateGivingSettings(
  userId: string,
  updates: Partial<{
    nama: string
    namaLengkap: string
    email: string
  }>
): Promise<GivingSettings | null> {
  const supabase = getSupabaseClient()

  const dbUpdates: Record<string, unknown> = {}
  if (updates.nama !== undefined) dbUpdates.nama = updates.nama
  if (updates.namaLengkap !== undefined) dbUpdates.nama_lengkap = updates.namaLengkap
  if (updates.email !== undefined) dbUpdates.email = updates.email

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
    userId: data.id,
    nama: data.nama,
    namaLengkap: data.nama_lengkap,
    email: data.email,
  }
}

export async function getGivingGoals(householdId: string): Promise<GivingGoal[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('financial_goals')
    .select('*')
    .eq('household_id', householdId)
    .in('goal_type', ['giving_zakat', 'giving_compassion', 'giving_donation'])
    .is('deleted_at', null)

  if (error) {
    return []
  }

  return (data || []).map((goal: { id: unknown; household_id: unknown; goal_type: unknown; name: unknown; target_amount: unknown; current_amount: unknown; is_locked: unknown; created_at: unknown; updated_at: unknown }) => ({
    id: goal.id as string,
    householdId: goal.household_id as string,
    goalType: goal.goal_type as GivingGoalType,
    name: goal.name as string,
    targetAmount: Number(goal.target_amount),
    currentAmount: Number(goal.current_amount),
    isLocked: goal.is_locked as boolean,
    createdAt: new Date(goal.created_at as string),
    updatedAt: new Date(goal.updated_at as string),
  }))
}

export async function getGivingGoal(
  householdId: string,
  goalType: GivingGoalType
): Promise<GivingGoal | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('financial_goals')
    .select('*')
    .eq('household_id', householdId)
    .eq('goal_type', goalType)
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

export async function createGivingGoal(
  householdId: string,
  goalType: GivingGoalType,
  name: string
): Promise<GivingGoal> {
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

export async function getGivingTransactions(
  householdId: string,
  goalId: string,
  startDate?: Date,
  endDate?: Date
): Promise<GivingTransaction[]> {
  const supabase = getSupabaseClient()

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('household_id', householdId)
    .eq('goal_id', goalId)
    .order('transaction_date', { ascending: false })

  if (startDate) {
    query = query.gte('transaction_date', startDate.toISOString().split('T')[0])
  }
  if (endDate) {
    query = query.lte('transaction_date', endDate.toISOString().split('T')[0])
  }

  const { data, error } = await query

  if (error) {
    return []
  }

  return (data || []).map((t: { id: unknown; household_id: unknown; user_id: unknown; category_id: unknown; type: unknown; amount: unknown; description: unknown; transaction_date: unknown; goal_id: unknown; created_at: unknown }) => ({
    id: t.id as string,
    householdId: t.household_id as string,
    userId: t.user_id as string,
    categoryId: t.category_id as string,
    type: t.type as 'income' | 'expense' | 'transfer',
    amount: Number(t.amount),
    description: (t.description as string) || '',
    transactionDate: new Date(t.transaction_date as string),
    goalId: t.goal_id as string,
    createdAt: new Date(t.created_at as string),
  }))
}

export async function getGivingSummary(
  householdId: string,
  startDate: Date,
  endDate: Date
): Promise<GivingSummary> {
  const supabase = getSupabaseClient()

  const goalTypes: GivingGoalType[] = ['giving_zakat', 'giving_compassion', 'giving_donation']
  const categories: GivingSummary['categories'] = []

  for (const goalType of goalTypes) {
    const goal = await getGivingGoal(householdId, goalType)
    if (!goal) continue

    const transactions = await getGivingTransactions(householdId, goal.id, startDate, endDate)

    const totalEarmarked = transactions
      .filter((t) => t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalDisbursed = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    categories.push({
      category: goalType === 'giving_zakat' ? 'Zakat' : goalType === 'giving_compassion' ? 'Compassion Fund' : 'Donation',
      totalEarmarked,
      totalDisbursed,
      currentBalance: goal.currentAmount,
    })
  }

  const totals = categories.reduce(
    (acc, cat) => ({
      totalEarmarked: acc.totalEarmarked + cat.totalEarmarked,
      totalDisbursed: acc.totalDisbursed + cat.totalDisbursed,
      netBalance: acc.netBalance + cat.currentBalance,
    }),
    { totalEarmarked: 0, totalDisbursed: 0, netBalance: 0 }
  )

  return {
    period: { startDate, endDate },
    categories,
    totals,
  }
}

export async function ensureGivingGoalsExist(householdId: string): Promise<GivingGoal[]> {
  const existingGoals = await getGivingGoals(householdId)
  
  if (existingGoals.length >= 3) {
    return existingGoals
  }

  const goalsToCreate: { goalType: GivingGoalType; name: string }[] = [
    { goalType: 'giving_zakat', name: 'Zakat' },
    { goalType: 'giving_compassion', name: 'Compassion Fund' },
    { goalType: 'giving_donation', name: 'Donation' },
  ]

  const createdGoals: GivingGoal[] = []

  for (const { goalType, name } of goalsToCreate) {
    const exists = existingGoals.find((g) => g.goalType === goalType)
    if (exists) {
      createdGoals.push(exists)
    } else {
      const newGoal = await createGivingGoal(householdId, goalType, name)
      createdGoals.push(newGoal)
    }
  }

  return createdGoals
}
