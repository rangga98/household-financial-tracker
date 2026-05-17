'use client'

import { useState, useTransition } from 'react'
import { createFilingDeadline } from '@/app/actions/tax-planning'
import type { TaxFilingType } from '@/types/tax-planning'

interface FilingDeadlineFormProps {
  householdId: string
  onSuccess: () => void
  onCancel: () => void
}

const INPUT_CLASS =
  'block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
const ERROR_INPUT_CLASS =
  'block w-full rounded-lg border border-red-500 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors'
const LABEL_CLASS = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

export function FilingDeadlineForm({ householdId, onSuccess, onCancel }: FilingDeadlineFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    taxType: 'income_tax' as TaxFilingType,
    fiscalYear: '',
    filingDeadline: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  function validate(): boolean {
    const next: Record<string, string> = {}
    const year = Number(formData.fiscalYear)
    if (!formData.fiscalYear || !Number.isInteger(year) || year <= 0) {
      next.fiscalYear = 'Fiscal year is required and must be a positive integer'
    }
    if (!formData.filingDeadline) next.filingDeadline = 'Filing deadline date is required'
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
      const result = await createFilingDeadline({
        householdId,
        taxType: formData.taxType,
        fiscalYear: Number(formData.fiscalYear),
        filingDeadline: formData.filingDeadline,
        notes: formData.notes.trim() || null,
      })

      if (result.success) {
        onSuccess()
      } else {
        setServerError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="dl-tax-type" className={LABEL_CLASS}>Tax Type</label>
        <select
          id="dl-tax-type"
          value={formData.taxType}
          onChange={(e) => handleChange('taxType', e.target.value)}
          className={INPUT_CLASS}
        >
          <option value="income_tax">Income Tax (SPT Tahunan)</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dl-fiscal-year" className={LABEL_CLASS}>Fiscal Year</label>
          <input
            id="dl-fiscal-year"
            type="number"
            placeholder="e.g. 2026"
            value={formData.fiscalYear}
            onChange={(e) => handleChange('fiscalYear', e.target.value)}
            className={errors.fiscalYear ? ERROR_INPUT_CLASS : INPUT_CLASS}
          />
          {errors.fiscalYear && (
            <p className="mt-1 text-xs text-red-600">{errors.fiscalYear}</p>
          )}
        </div>
        <div>
          <label htmlFor="dl-deadline" className={LABEL_CLASS}>Filing Deadline</label>
          <input
            id="dl-deadline"
            type="date"
            value={formData.filingDeadline}
            onChange={(e) => handleChange('filingDeadline', e.target.value)}
            className={errors.filingDeadline ? ERROR_INPUT_CLASS : INPUT_CLASS}
          />
          {errors.filingDeadline && (
            <p className="mt-1 text-xs text-red-600">{errors.filingDeadline}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="dl-notes" className={LABEL_CLASS}>Notes (optional)</label>
        <textarea
          id="dl-notes"
          placeholder="Any additional notes..."
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={2}
          className={INPUT_CLASS + ' resize-y'}
        />
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

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
          {isPending ? 'Saving...' : 'Create Deadline'}
        </button>
      </div>
    </form>
  )
}
