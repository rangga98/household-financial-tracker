'use client'

import { useRouter } from 'next/navigation'
import { CategoryForm } from './CategoryForm'
import { createCategoryAction } from '@/app/categories/actions/create'
import { useToast } from '@/components/features/cash-flow/Toast'
import type { CategoryFormData } from '@/lib/supabase/categories'

interface CategoryFormWrapperProps {
  householdId: string
}

export function CategoryFormWrapper({ householdId }: CategoryFormWrapperProps) {
  const { showToast } = useToast()
  const router = useRouter()

  async function handleSubmit(data: CategoryFormData) {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('type', data.type)
    formData.append('icon', data.icon)
    formData.append('householdId', householdId)

    const result = await createCategoryAction(formData)

    if (result.success) {
      showToast(`Category "${result.category?.name}" created`, 'success')
      router.refresh()
    } else {
      showToast(result.error || 'Failed to create category', 'error')
      throw new Error(result.error || 'Failed to create category')
    }
  }

  return <CategoryForm householdId={householdId} onSubmit={handleSubmit} />
}
