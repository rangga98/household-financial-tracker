import { getSupabaseClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export async function getProfiles(householdId: string): Promise<Profile[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_active', true)
    .order('name')

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map((p: Record<string, unknown>) => ({
    id: String(p.id),
    householdId: String(p.household_id),
    name: String(p.name),
    avatarUrl: p.avatar_url ? String(p.avatar_url) : undefined,
    isActive: Boolean(p.is_active),
    createdAt: new Date(String(p.created_at)),
    updatedAt: new Date(String(p.updated_at)),
  }))
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return {
    id: data.id,
    householdId: data.household_id,
    name: data.name,
    avatarUrl: data.avatar_url || undefined,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}
