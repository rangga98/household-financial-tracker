'use server'

import { getSupabaseServerClient } from './server'

export type CustomCategory = {
  id: string
  householdId: string
  name: string
  type: 'fixed' | 'variable'
  icon: string
  color?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type CategoryFormData = {
  name: string
  type: 'fixed' | 'variable'
  icon: string
  color?: string
}

export type CategoryFilter = {
  type?: 'fixed' | 'variable' | 'all'
  search?: string
}

export async function getCategories(
  householdId: string,
  filter?: CategoryFilter
): Promise<CustomCategory[]> {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from('categories')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_active', true)

  if (filter?.type && filter.type !== 'all') {
    query = query.eq('type', filter.type)
  }

  if (filter?.search) {
    query = query.ilike('name', `%${filter.search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: true })

  if (error) {
    console.error(
      JSON.stringify({
        event: 'CATEGORIES_GET_FAIL',
        householdId,
        error: error.message,
      })
    )
    throw new Error(error.message)
  }

  return (data || []).map((c) => ({
    id: String(c.id),
    householdId: String(c.household_id),
    name: String(c.name),
    type: String(c.type) as 'fixed' | 'variable',
    icon: String(c.icon),
    color: c.color ? String(c.color) : undefined,
    isActive: Boolean(c.is_active),
    createdAt: String(c.created_at),
    updatedAt: String(c.updated_at),
    deletedAt: c.deleted_at ? String(c.deleted_at) : null,
  }))
}

export async function createCategory(
  category: CategoryFormData,
  householdId: string
): Promise<CustomCategory> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      household_id: householdId,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error(
      JSON.stringify({
        event: 'CATEGORY_CREATE_FAIL',
        householdId,
        error: error.message,
      })
    )
    throw new Error(error.message)
  }

  return {
    id: String(data.id),
    householdId: String(data.household_id),
    name: String(data.name),
    type: String(data.type) as 'fixed' | 'variable',
    icon: String(data.icon),
    color: data.color ? String(data.color) : undefined,
    isActive: Boolean(data.is_active),
    createdAt: String(data.created_at),
    updatedAt: String(data.updated_at),
    deletedAt: data.deleted_at ? String(data.deleted_at) : null,
  }
}

export async function updateCategory(
  id: string,
  updates: Partial<CategoryFormData>
): Promise<CustomCategory> {
  const supabase = await getSupabaseServerClient()

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.type !== undefined) updateData.type = updates.type
  if (updates.icon !== undefined) updateData.icon = updates.icon
  if (updates.color !== undefined) updateData.color = updates.color

  const { data, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(
      JSON.stringify({
        event: 'CATEGORY_UPDATE_FAIL',
        categoryId: id,
        error: error.message,
      })
    )
    throw new Error(error.message)
  }

  return {
    id: String(data.id),
    householdId: String(data.household_id),
    name: String(data.name),
    type: String(data.type) as 'fixed' | 'variable',
    icon: String(data.icon),
    color: data.color ? String(data.color) : undefined,
    isActive: Boolean(data.is_active),
    createdAt: String(data.created_at),
    updatedAt: String(data.updated_at),
    deletedAt: data.deleted_at ? String(data.deleted_at) : null,
  }
}

export async function softDeleteCategory(id: string): Promise<void> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('categories')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error(
      JSON.stringify({
        event: 'CATEGORY_SOFT_DELETE_FAIL',
        categoryId: id,
        error: error.message,
      })
    )
    throw new Error(error.message)
  }
}
