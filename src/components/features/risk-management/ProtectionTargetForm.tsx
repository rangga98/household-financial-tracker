'use client'

import { useState, useTransition } from 'react'
import { setProtectionTarget } from '@/app/actions/risk-management'
import type { ProtectionTarget } from '@/types/risk-management'

interface ProtectionTargetFormProps {
  existingTarget: ProtectionTarget | null
  householdId?: string
  onSuccess: (target: ProtectionTarget) => void
  onCancel: () => void
}

const INPUT_CLASS =
  'block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
const ERROR_INPUT_CLASS =
  'block w-full rounded-lg border border-red-500 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors'

export function ProtectionTargetForm({
  existingTarget,
  householdId = '',
  onSuccess,
  onCancel,
}: ProtectionTargetFormProps) {
  const [isPending, startTransition] = useTransition()
  const [amount, setAmount] = useState(
    existingTarget?.targetAmount != null ? String(existingTarget.targetAmount) : ''
  )
  const [error, setError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setServerError(null)

    const parsed = Number(amount)
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Target amount must be greater than zero')
      return
    }

    startTransition(async () => {
      const result = await setProtectionTarget({
        householdId,
        targetAmount: parsed,
        existingGoalId: existingTarget?.id ?? null,
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
      <div>
        <label htmlFor="pt-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Target Amount (Rp)
        </label>
        <input
          id="pt-amount"
          type="number"
          placeholder="e.g. 2000000000"
          min="1"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
            if (error) setError(null)
          }}
          className={error ? ERROR_INPUT_CLASS : INPUT_CLASS}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <p className="text-xs text-gray-400">
        Set your desired total insurance coverage amount. The system will compare your active policies against this target.
      </p>
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
          {isPending ? 'Saving...' : existingTarget ? 'Update Target' : 'Set Target'}
        </button>
      </div>
    </form>
  )
}
