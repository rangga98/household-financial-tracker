'use client'

import { useState, useMemo } from 'react'
import { formatRp, parseRp } from '@/lib/utils/currency'
import type { Category } from '@/types'

interface BudgetLimitFormProps {
  categories: Category[]
  onSave: (categoryId: string, limit: number) => Promise<void>
  isLoading?: boolean
}

export function BudgetLimitForm({
  categories,
  onSave,
  isLoading = false,
}: BudgetLimitFormProps) {
  const variableCategories = useMemo(
    () => categories.filter((c) => c.type === 'variable' && c.isActive),
    [categories]
  )

  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedCategory = useMemo(
    () => variableCategories.find((c) => c.id === categoryId),
    [variableCategories, categoryId]
  )

  const handleCategoryChange = (id: string) => {
    setCategoryId(id)
    setError('')
    const cat = variableCategories.find((c) => c.id === id)
    setAmount(cat?.monthlyLimit ? String(cat.monthlyLimit) : '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!categoryId) {
      setError('Please select a category')
      return
    }

    const limit = parseRp(amount)
    if (!limit || limit <= 0) {
      setError('Monthly limit must be a positive number')
      return
    }

    setSubmitting(true)
    try {
      await onSave(categoryId, limit)
      setAmount('')
      setCategoryId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save limit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="budget-category"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Category
        </label>
        <select
          id="budget-category"
          value={categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <option value="">Select a variable category</option>
          {variableCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCategory && selectedCategory.monthlyLimit && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Current limit: {formatRp(selectedCategory.monthlyLimit)}
        </p>
      )}

      <div>
        <label
          htmlFor="budget-limit"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Monthly Limit
        </label>
        <input
          id="budget-limit"
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Rp 2.000.000"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-lg font-semibold tabular-nums"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isLoading || submitting}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {submitting || isLoading ? 'Saving...' : 'Save Limit'}
      </button>
    </form>
  )
}
