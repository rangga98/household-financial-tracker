import { getSupabaseClient } from '@/lib/supabase/client'
import type { Balance } from '@/types'

export async function getBalance(householdId: string, asOfDate?: string): Promise<Balance> {
  const supabase = getSupabaseClient()

  let query = supabase
    .from('transactions')
    .select('type, amount, transaction_date')
    .eq('household_id', householdId)

  if (asOfDate) {
    query = query.lte('transaction_date', asOfDate)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  const transactions = data || []
  
  const totalIn = transactions
    .filter((t: { type: string }) => t.type === 'income')
    .reduce((sum: number, t: { amount: unknown }) => sum + Number(t.amount), 0)

  const totalOut = transactions
    .filter((t: { type: string }) => t.type === 'expense')
    .reduce((sum: number, t: { amount: unknown }) => sum + Number(t.amount), 0)

  return {
    balance: totalIn - totalOut,
    totalIn,
    totalOut,
  }
}
