'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Transaction, TransactionInput } from '@/types'

export async function createTransaction(
  data: TransactionInput & { householdId: string; userId: string }
): Promise<Transaction> {
  const supabase = await getSupabaseServerClient()

  const isScheduled = data.transactionDate
    ? new Date(data.transactionDate) > new Date()
    : false

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      household_id: data.householdId,
      user_id: data.userId,
      category_id: data.categoryId,
      type: data.type,
      amount: data.amount,
      description: data.description || null,
      transaction_date: data.transactionDate || new Date().toISOString().split('T')[0],
      is_scheduled: isScheduled,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')

  return {
    id: transaction.id,
    householdId: transaction.household_id,
    userId: transaction.user_id,
    categoryId: transaction.category_id,
    type: transaction.type,
    amount: Number(transaction.amount),
    description: transaction.description,
    transactionDate: new Date(transaction.transaction_date),
    isScheduled: transaction.is_scheduled,
    createdAt: new Date(transaction.created_at),
    updatedAt: new Date(transaction.updated_at),
  }
}
