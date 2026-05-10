'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CategoryList } from './CategoryList'
import type { CustomCategory } from '@/lib/supabase/categories'

interface CategoryListWrapperProps {
  initialCategories: CustomCategory[]
}

export function CategoryListWrapper({ initialCategories }: CategoryListWrapperProps) {
  const [categories, setCategories] = useState<CustomCategory[]>(initialCategories)
  const router = useRouter()

  function handleUpdate() {
    router.refresh()
  }

  return <CategoryList categories={categories} onUpdate={handleUpdate} />
}
