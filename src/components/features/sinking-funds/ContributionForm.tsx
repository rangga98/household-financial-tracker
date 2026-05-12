'use client'

import { useState, useTransition } from 'react'
import { recordContribution } from '@/app/actions/sinking-funds'
import type { SinkingFundContribution } from '@/types/sinking-funds'

interface ContributionFormProps {
  goalId: string
  goalName: string
  householdId: string
  onSuccess: (contribution: SinkingFundContribution) => void
  onCancel: () => void
}

export function ContributionForm({ goalId, goalName, householdId, onSuccess, onCancel }: ContributionFormProps) {
  const [isPending, startTransition] = useTransition()
  const today = new Date().toISOString().split('T')[0]
  const [formData, setFormData] = useState({
    amount: '',
    transactionDate: today,
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  function validate(): boolean {
    const next: Record<string, string> = {}
    const amount = Number(formData.amount)
    if (!formData.amount) {
      next.amount = 'Amount is required'
    } else if (isNaN(amount) || amount <= 0) {
      next.amount = 'Amount must be greater than zero'
    }
    if (!formData.transactionDate) {
      next.transactionDate = 'Date is required'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    if (!validate()) return

    startTransition(async () => {
      const result = await recordContribution({
        goalId,
        amount: Number(formData.amount),
        transactionDate: formData.transactionDate,
        notes: formData.notes.trim() || null,
        householdId,
      })

      if (result.success) {
        onSuccess(result.data)
      } else {
        setServerError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Adding contribution to <span className="font-medium text-gray-700 dark:text-gray-300">{goalName}</span>
      </p>

      <div>
        <label htmlFor="cf-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Amount (Rp)
        </label>
        <input
          id="cf-amount"
          name="amount"
          type="number"
          placeholder="e.g. 5000000"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            errors.amount ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
      </div>

      <div>
        <label htmlFor="cf-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date
        </label>
        <input
          id="cf-date"
          name="transactionDate"
          type="date"
          value={formData.transactionDate}
          onChange={(e) => handleChange('transactionDate', e.target.value)}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
        {errors.transactionDate && (
          <p className="mt-1 text-xs text-red-600">{errors.transactionDate}</p>
        )}
      </div>

      <div>
        <label htmlFor="cf-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes (optional)
        </label>
        <textarea
          id="cf-notes"
          name="notes"
          placeholder="e.g. Monthly savings"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={2}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-y"
        />
      </div>

      {serverError && (
        <p className="text-sm text-red-600">{serverError}</p>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Add Contribution'}
        </button>
      </div>
    </form>
  )
}
