'use client'

import { useState, useEffect, useCallback } from 'react'
import { BudgetLimitForm } from '@/components/features/budgeting/BudgetLimitForm'
import { BudgetCard } from '@/components/features/budgeting/BudgetCard'
import { updateCategoryLimit } from '@/app/actions/budgeting'
import { getBudgetMetrics } from '@/lib/supabase/queries/budgeting'
import { getCategories } from '@/lib/supabase/queries/categories'
import { useCashFlowStore } from '@/hooks/useCashFlow'
import type { Category, BudgetMetrics } from '@/types'

// TODO: Replace with actual household ID from Supabase
const DEMO_HOUSEHOLD_ID = '963a25fc-553a-48b2-9439-d093984015f2'

export default function BudgetingPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [metrics, setMetrics] = useState<BudgetMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const { setHouseholdId } = useCashFlowStore()

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setHouseholdId(DEMO_HOUSEHOLD_ID)

      const cats = await getCategories(DEMO_HOUSEHOLD_ID)
      setCategories(cats)

      const budgetMetrics = await getBudgetMetrics(DEMO_HOUSEHOLD_ID)
      setMetrics(budgetMetrics)
    } catch (err) {
      console.error('Failed to load budget data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [setHouseholdId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveLimit = async (categoryId: string, limit: number) => {
    const result = await updateCategoryLimit(categoryId, limit)
    if (!result.success) {
      throw new Error(result.error || 'Failed to save limit')
    }
    // Refresh metrics after save
    const budgetMetrics = await getBudgetMetrics(DEMO_HOUSEHOLD_ID)
    setMetrics(budgetMetrics)
  }

  const budgetCategories = metrics.filter((m) => m.monthlyLimit !== null)

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <p className="text-red-500">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
        Simple Budgeting
      </h1>

      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Set Monthly Limit
        </h2>
        <BudgetLimitForm
          categories={categories}
          onSave={handleSaveLimit}
          isLoading={isLoading}
        />
      </section>

      {budgetCategories.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Budget Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetCategories.map((m) => (
              <BudgetCard key={m.categoryId} metrics={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
