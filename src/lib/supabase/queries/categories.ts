import { getSupabaseClient } from '@/lib/supabase/client'
import type { Category } from '@/types'

export async function getCategories(
  householdId: string,
  options?: {
    type?: 'fixed' | 'variable'
    includeInactive?: boolean
  }
): Promise<Category[]> {
  const supabase = getSupabaseClient()

  let query = supabase
    .from('categories')
    .select('*')
    .eq('household_id', householdId)

  if (!options?.includeInactive) {
    query = query.eq('is_active', true)
  }

  if (options?.type) {
    query = query.eq('type', options.type)
  }

  query = query.order('type').order('name')

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map((c: Record<string, unknown>) => ({
    id: String(c.id),
    householdId: String(c.household_id),
    name: String(c.name),
    type: String(c.type) as 'fixed' | 'variable',
    icon: c.icon ? String(c.icon) : undefined,
    color: c.color ? String(c.color) : undefined,
    isActive: Boolean(c.is_active),
    createdAt: new Date(String(c.created_at)),
    updatedAt: new Date(String(c.updated_at)),
  }))
}
