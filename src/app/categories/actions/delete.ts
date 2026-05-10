'use server'

import { revalidatePath } from 'next/cache'
import { softDeleteCategory } from '@/lib/supabase/categories'

export async function deleteCategoryAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const id = formData.get('id') as string

  if (!id) {
    return { success: false, error: 'Category ID is required' }
  }

  try {
    await softDeleteCategory(id)

    revalidatePath('/categories')

    console.log(
      JSON.stringify({
        event: 'CATEGORY_DELETE_SUCCESS',
        categoryId: id,
      })
    )

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete category'
    console.error(
      JSON.stringify({
        event: 'CATEGORY_DELETE_FAIL',
        categoryId: id,
        error: message,
      })
    )
    return { success: false, error: message }
  }
}
