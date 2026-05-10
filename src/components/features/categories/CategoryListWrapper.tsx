'use client'

import { useState } from 'react'
import { CategoryList } from './CategoryList'
import type { CustomCategory } from '@/lib/supabase/categories'

interface CategoryListWrapperProps {
  initialCategories: CustomCategory[]
}

export function CategoryListWrapper({ initialCategories }: CategoryListWrapperProps) {
  const [categories, setCategories] = useState<CustomCategory[]>(initialCategories)

  function handleUpdate() {
    // In a real app, this would refetch from the server
    // For now, we rely on the server action revalidating the page
    // which triggers a fresh render on next navigation
    window.location.reload()
  }

  return <CategoryList categories={categories} onUpdate={handleUpdate} />
}
