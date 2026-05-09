'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { Category } from '@/types'

export async function updateCategoryLimit(
  categoryId: string,
  monthlyLimit: number
): Promise<{ success: boolean; category?: Category; error?: string }> {
  const supabase = await getSupabaseServerClient()

  if (monthlyLimit <= 0) {
    return { success: false, error: 'Monthly limit must be a positive number' }
  }

  const { data, error } = await supabase
    .from('categories')
    .update({
      monthly_limit: monthlyLimit,
      updated_at: new Date().toISOString(),
    })
    .eq('id', categoryId)
    .select()
    .single()

  if (error) {
    console.error(
      JSON.stringify({
        event: 'CATEGORY_LIMIT_UPDATE_FAIL',
        categoryId,
        error: error.message,
      })
    )
    return { success: false, error: error.message }
  }

  revalidatePath('/budgeting')

  const category: Category = {
    id: String(data.id),
    householdId: String(data.household_id),
    name: String(data.name),
    type: String(data.type) as 'fixed' | 'variable',
    icon: data.icon ? String(data.icon) : undefined,
    color: data.color ? String(data.color) : undefined,
    isActive: Boolean(data.is_active),
    monthlyLimit: data.monthly_limit ? Number(data.monthly_limit) : undefined,
    createdAt: new Date(String(data.created_at)),
    updatedAt: new Date(String(data.updated_at)),
  }

  return { success: true, category }
}
