'use server'

import { revalidatePath } from 'next/cache'
import { updateCategory } from '@/lib/supabase/categories'
import {
  validateCategoryName,
  validateCategoryType,
  validateIconName,
} from '@/lib/utils/category-validation'

export async function updateCategoryAction(
  formData: FormData
): Promise<{ success: boolean; category?: { id: string; name: string }; error?: string }> {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as 'fixed' | 'variable'
  const icon = formData.get('icon') as string

  if (!id) {
    return { success: false, error: 'Category ID is required' }
  }

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
    const category = await updateCategory(id, {
      name: name.trim(),
      type,
      icon: icon.trim(),
    })

    revalidatePath('/categories')

    console.log(
      JSON.stringify({
        event: 'CATEGORY_UPDATE_SUCCESS',
        categoryId: category.id,
        name: category.name,
      })
    )

    return { success: true, category: { id: category.id, name: category.name } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update category'
    console.error(
      JSON.stringify({
        event: 'CATEGORY_UPDATE_FAIL',
        categoryId: id,
        name,
        error: message,
      })
    )
    return { success: false, error: message }
  }
}
