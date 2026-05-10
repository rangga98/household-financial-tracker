'use server'

import { revalidatePath } from 'next/cache'
import { createCategory } from '@/lib/supabase/categories'
import {
  validateCategoryName,
  validateCategoryType,
  validateIconName,
} from '@/lib/utils/category-validation'
import type { CategoryFormData } from '@/lib/supabase/categories'

export async function createCategoryAction(
  formData: FormData
): Promise<{ success: boolean; category?: { id: string; name: string }; error?: string }> {
  const name = formData.get('name') as string
  const type = formData.get('type') as 'fixed' | 'variable'
  const icon = formData.get('icon') as string
  const householdId = formData.get('householdId') as string

  const nameValidation = validateCategoryName(name)
  if (!nameValidation.valid) {
    return { success: false, error: nameValidation.error }
  }

  const typeValidation = validateCategoryType(type)
  if (!typeValidation.valid) {
    return { success: false, error: typeValidation.error }
  }

  const iconValidation = validateIconName(icon)
  if (!iconValidation.valid) {
    return { success: false, error: iconValidation.error }
  }

  try {
    const category = await createCategory(
      { name: name.trim(), type, icon: icon.trim() },
      householdId
    )

    revalidatePath('/categories')

    console.log(
      JSON.stringify({
        event: 'CATEGORY_CREATE_SUCCESS',
        categoryId: category.id,
        householdId,
        name: category.name,
      })
    )

    return { success: true, category: { id: category.id, name: category.name } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create category'
    console.error(
      JSON.stringify({
        event: 'CATEGORY_CREATE_FAIL',
        householdId,
        name,
        error: message,
      })
    )
    return { success: false, error: message }
  }
}
