'use client'

import { useState, useTransition } from 'react'
import { createSinkingFund, updateSinkingFund } from '@/app/actions/sinking-funds'
import type { SinkingFund } from '@/types/sinking-funds'

interface SinkingFundFormValues {
  id?: string
  name: string
  targetAmount: number
  targetDate: string | null
  description: string | null
}

interface SinkingFundFormProps {
  mode: 'create' | 'edit'
  householdId: string
  initialValues?: Partial<SinkingFundFormValues>
  onSuccess: (fund: SinkingFund) => void
  onCancel: () => void
}

export function SinkingFundForm({
  mode,
  householdId,
  initialValues,
  onSuccess,
  onCancel,
}: SinkingFundFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    name: initialValues?.name ?? '',
    targetAmount: initialValues?.targetAmount ?? '',
    targetDate: initialValues?.targetDate ?? '',
    description: initialValues?.description ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!formData.name.trim()) {
      next.name = 'Fund name is required'
    }
    const amount = Number(formData.targetAmount)
    if (!formData.targetAmount || isNaN(amount) || amount <= 0) {
      next.targetAmount = 'Target amount must be greater than zero'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    if (!validate()) return

    startTransition(async () => {
      const payload = {
        name: formData.name.trim(),
        targetAmount: Number(formData.targetAmount),
        targetDate: formData.targetDate?.trim() || null,
        description: formData.description?.trim() || null,
      }

      let result
      if (mode === 'edit' && initialValues?.id) {
        result = await updateSinkingFund(initialValues.id, payload)
      } else {
        result = await createSinkingFund({ ...payload, householdId })
      }

      if (result.success) {
        onSuccess(result.data)
      } else {
        setServerError(result.error)
      }
    })
  }

  const submitLabel = mode === 'edit' ? 'Save Changes' : 'Create Fund'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="sf-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fund Name
        </label>
        <input
          id="sf-name"
          name="name"
          type="text"
          placeholder="e.g. New Car, Emergency Trip"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="sf-target-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Target Amount (Rp)
        </label>
        <input
          id="sf-target-amount"
          name="targetAmount"
          type="number"
          placeholder="e.g. 150000000"
          value={String(formData.targetAmount)}
          onChange={(e) => handleChange('targetAmount', e.target.value)}
          className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            errors.targetAmount ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.targetAmount && <p className="mt-1 text-xs text-red-600">{errors.targetAmount}</p>}
      </div>

      <div>
        <label htmlFor="sf-target-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Target Date (optional)
        </label>
        <input
          id="sf-target-date"
          name="targetDate"
          type="date"
          value={formData.targetDate ?? ''}
          onChange={(e) => handleChange('targetDate', e.target.value)}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      <div>
        <label htmlFor="sf-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description (optional)
        </label>
        <textarea
          id="sf-description"
          name="description"
          placeholder="Notes about this fund..."
          value={formData.description ?? ''}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
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
          {isPending ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
