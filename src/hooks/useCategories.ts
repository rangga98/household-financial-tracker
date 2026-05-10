'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { CustomCategory, CategoryFilter } from '@/lib/supabase/categories'

export function useCategories(householdId: string, filter?: CategoryFilter) {
  const [categories, setCategories] = useState<CustomCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

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

      const { data, error: supabaseError } = await query.order('created_at', { ascending: true })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      const mapped: CustomCategory[] = (data || []).map((c: Record<string, unknown>) => ({
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

      setCategories(mapped)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load categories'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [householdId, filter?.type, filter?.search])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    isLoading,
    error,
    refresh: fetchCategories,
  }
}
