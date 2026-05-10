'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import {
  validateCategoryName,
  validateCategoryType,
  validateIconName,
} from '@/lib/utils/category-validation'
import { IconPicker } from './IconPicker'
import type { CustomCategory, CategoryFormData } from '@/lib/supabase/categories'

interface CategoryFormProps {
  householdId: string
  onSubmit: (data: CategoryFormData) => Promise<void>
  category?: CustomCategory
}

export function CategoryForm({ householdId, onSubmit, category }: CategoryFormProps) {
  const isEdit = !!category

  const [name, setName] = useState(category?.name || '')
  const [type, setType] = useState<'fixed' | 'variable'>(category?.type || 'variable')
  const [icon, setIcon] = useState(category?.icon || 'shopping-cart')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    const nameValidation = validateCategoryName(name)
    if (!nameValidation.valid) {
      newErrors.name = nameValidation.error!
    }

    const typeValidation = validateCategoryType(type)
    if (!typeValidation.valid) {
      newErrors.type = typeValidation.error!
    }

    const iconValidation = validateIconName(icon)
    if (!iconValidation.valid) {
      newErrors.icon = iconValidation.error!
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (!validate()) {
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        type,
        icon: icon.trim(),
      })

      if (!isEdit) {
        setName('')
        setType('variable')
        setIcon('shopping-cart')
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save category')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="category-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Category Name
        </label>
        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (errors.name) {
              setErrors((prev) => ({ ...prev, name: '' }))
            }
          }}
          placeholder="e.g., Groceries"
          disabled={isLoading}
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 text-base',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.name
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-200 dark:border-gray-700'
          )}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="category-type"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Type
        </label>
        <select
          id="category-type"
          value={type}
          onChange={(e) => {
            setType(e.target.value as 'fixed' | 'variable')
            if (errors.type) {
              setErrors((prev) => ({ ...prev, type: '' }))
            }
          }}
          disabled={isLoading}
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 text-base',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.type
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-200 dark:border-gray-700'
          )}
        >
          <option value="variable">Variable</option>
          <option value="fixed">Fixed</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-500">{errors.type}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Icon
        </label>
        <IconPicker selected={icon} onSelect={setIcon} />
        {errors.icon && (
          <p className="mt-1 text-sm text-red-500">{errors.icon}</p>
        )}
      </div>

      {submitError && (
        <p className="text-sm text-red-500">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          'w-full py-3 rounded-lg font-medium text-white transition-colors min-h-[44px]',
          'bg-blue-600 hover:bg-blue-700',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isLoading ? 'Saving...' : isEdit ? 'Update Category' : 'Save Category'}
      </button>
    </form>
  )
}
