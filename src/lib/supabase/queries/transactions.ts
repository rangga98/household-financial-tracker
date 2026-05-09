import { getSupabaseClient } from '@/lib/supabase/client'
import type { Transaction, TransactionFilters } from '@/types'

export async function getTransactions(
  householdId: string,
  filters?: TransactionFilters
): Promise<Transaction[]> {
  const supabase = getSupabaseClient()

  let query = supabase
    .from('transactions')
    .select(`
      *,
      category:categories(name, type, icon, color),
      user:profiles(name)
    `)
    .eq('household_id', householdId)
    .order('transaction_date', { ascending: false })

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }

  if (filters?.startDate) {
    query = query.gte('transaction_date', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('transaction_date', filters.endDate)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map((t: Record<string, unknown>) => ({
    id: String(t.id),
    householdId: String(t.household_id),
    userId: String(t.user_id),
    categoryId: String(t.category_id),
    type: String(t.type) as 'income' | 'expense',
    amount: Number(t.amount),
    description: t.description ? String(t.description) : undefined,
    transactionDate: new Date(String(t.transaction_date)),
    isScheduled: Boolean(t.is_scheduled),
    createdAt: new Date(String(t.created_at)),
    updatedAt: new Date(String(t.updated_at)),
    category: t.category as Transaction['category'],
    user: t.user as Transaction['user'],
  }))
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      category:categories(name, type, icon, color),
      user:profiles(name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return {
    id: data.id,
    householdId: data.household_id,
    userId: data.user_id,
    categoryId: data.category_id,
    type: data.type,
    amount: Number(data.amount),
    description: data.description,
    transactionDate: new Date(data.transaction_date),
    isScheduled: data.is_scheduled,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    category: data.category,
    user: data.user,
  }
}
