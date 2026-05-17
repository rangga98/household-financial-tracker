'use client'

import { useState, useTransition } from 'react'
import { markPremiumPaid } from '@/app/actions/risk-management'
import type { InsurancePolicy } from '@/types/risk-management'

interface MarkPaidFormProps {
  policy: InsurancePolicy
  householdId: string
  onSuccess: () => void
  onCancel: () => void
}

const INPUT_CLASS =
  'block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
const ERROR_INPUT_CLASS =
  'block w-full rounded-lg border border-red-500 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors'
const LABEL_CLASS = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function MarkPaidForm({ policy, householdId, onSuccess, onCancel }: MarkPaidFormProps) {
  const [isPending, startTransition] = useTransition()
  const [paymentDate, setPaymentDate] = useState(todayISO())
  const [amount, setAmount] = useState(String(policy.premiumAmount))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!paymentDate) next.paymentDate = 'Payment date is required'
    const parsed = Number(amount)
    if (!amount || isNaN(parsed) || parsed <= 0) {
      next.amount = 'Amount must be greater than zero'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    if (!validate()) return

    startTransition(async () => {
      const result = await markPremiumPaid({
        policyId: policy.id,
        householdId,
        paymentDate,
        amount: Number(amount),
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
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Recording payment for <strong>{policy.name}</strong>
      </p>

      <div>
        <label htmlFor="mp-date" className={LABEL_CLASS}>Payment Date</label>
        <input
          id="mp-date"
          type="date"
          value={paymentDate}
          onChange={(e) => {
            setPaymentDate(e.target.value)
            if (errors.paymentDate) setErrors((prev) => ({ ...prev, paymentDate: '' }))
          }}
          className={errors.paymentDate ? ERROR_INPUT_CLASS : INPUT_CLASS}
        />
        {errors.paymentDate && <p className="mt-1 text-xs text-red-600">{errors.paymentDate}</p>}
      </div>

      <div>
        <label htmlFor="mp-amount" className={LABEL_CLASS}>Amount (Rp)</label>
        <input
          id="mp-amount"
          type="number"
          min="1"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
            if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }))
          }}
          className={errors.amount ? ERROR_INPUT_CLASS : INPUT_CLASS}
        />
        {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
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
          {isPending ? 'Saving...' : 'Confirm Payment'}
        </button>
      </div>
    </form>
  )
}
