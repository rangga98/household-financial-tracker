'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { CategoryForm } from './CategoryForm'
import { deleteCategoryAction } from '@/app/categories/actions/delete'
import { updateCategoryAction } from '@/app/categories/actions/update'
import { useToast } from '@/components/features/cash-flow/Toast'
import type { CustomCategory, CategoryFormData } from '@/lib/supabase/categories'

interface CategoryCardProps {
  category: CustomCategory
  onUpdate: () => void
}

export function CategoryCard({ category, onUpdate }: CategoryCardProps) {
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleUpdate(data: CategoryFormData) {
    const formData = new FormData()
    formData.append('id', category.id)
    formData.append('name', data.name)
    formData.append('type', data.type)
    formData.append('icon', data.icon)

    const result = await updateCategoryAction(formData)

    if (result.success) {
      showToast(`Category "${result.category?.name}" updated`, 'success')
      setIsEditing(false)
      onUpdate()
    } else {
      showToast(result.error || 'Failed to update category', 'error')
      throw new Error(result.error || 'Failed to update category')
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const formData = new FormData()
      formData.append('id', category.id)

      const result = await deleteCategoryAction(formData)

      if (result.success) {
        showToast('Category deleted', 'success')
        onUpdate()
      } else {
        showToast(result.error || 'Failed to delete category', 'error')
      }
    } catch {
      showToast('Failed to delete category', 'error')
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <CategoryForm
          householdId={category.householdId}
          onSubmit={handleUpdate}
          category={category}
        />
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
            {category.name}
          </span>
          <span
            className={cn(
              'shrink-0 px-2 py-1 rounded-full text-xs font-medium',
              category.type === 'fixed'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
            )}
          >
            {category.type}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={isDeleting}
            className="p-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Edit category"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            className="p-2.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Delete category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Delete Category?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{category.name}"? This action can be undone later.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-lg font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors min-h-[44px]"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
