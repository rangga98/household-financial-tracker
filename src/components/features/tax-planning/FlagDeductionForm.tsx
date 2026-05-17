'use client'

import { useState, useTransition } from 'react'
import { flagTransactionAsDeductible } from '@/app/actions/tax-planning'

interface FlagDeductionFormProps {
  transactionId: string
  householdId: string
  defaultFiscalYear: number
  onSuccess: () => void
  onCancel: () => void
}

const INPUT_CLASS =
  'block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
const ERROR_INPUT_CLASS =
  'block w-full rounded-lg border border-red-500 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors'
const LABEL_CLASS = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

export function FlagDeductionForm({
  transactionId,
  householdId,
  defaultFiscalYear,
  onSuccess,
  onCancel,
}: FlagDeductionFormProps) {
  const [isPending, startTransition] = useTransition()
  const [fiscalYear, setFiscalYear] = useState(
    defaultFiscalYear > 0 ? String(defaultFiscalYear) : ''
  )
  const [yearError, setYearError] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)

  function validate(): boolean {
    const year = Number(fiscalYear)
    if (!fiscalYear || !Number.isInteger(year) || year <= 0) {
      setYearError('Fiscal year is required and must be a positive integer')
      return false
    }
    setYearError('')
    return true
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    if (!validate()) return

    startTransition(async () => {
      const result = await flagTransactionAsDeductible({
        transactionId,
        householdId,
        fiscalYear: Number(fiscalYear),
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
        <label htmlFor="flag-year" className={LABEL_CLASS}>Fiscal Year</label>
        <input
          id="flag-year"
          type="number"
          placeholder="e.g. 2026"
          value={fiscalYear}
          onChange={(e) => {
            setFiscalYear(e.target.value)
            if (yearError) setYearError('')
          }}
          className={yearError ? ERROR_INPUT_CLASS : INPUT_CLASS}
        />
        {yearError && <p className="mt-1 text-xs text-red-600">{yearError}</p>}
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
          {isPending ? 'Saving...' : 'Flag as Deductible'}
        </button>
      </div>
    </form>
  )
}
