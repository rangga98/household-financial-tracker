'use client'

import { useState, useTransition } from 'react'
import { createNetWorthItem, updateNetWorthItem } from '@/app/actions/net-worth'
import type { NetWorthItem } from '@/types/net-worth'

interface NetWorthItemFormProps {
  mode: 'create' | 'edit'
  householdId: string
  initialValues?: NetWorthItem
  onSuccess: (item: NetWorthItem) => void
  onCancel: () => void
}

const TYPE_OPTIONS = [
  { value: 'CURRENT_ASSET', label: 'Current Asset' },
  { value: 'NON_CURRENT_ASSET', label: 'Non-Current Asset' },
  { value: 'LIABILITY', label: 'Liability' },
] as const

export function NetWorthItemForm({
  mode,
  householdId,
  initialValues,
  onSuccess,
  onCancel,
}: NetWorthItemFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [amount, setAmount] = useState(initialValues ? String(initialValues.amount) : '')
  const [type, setType] = useState<NetWorthItem['type']>(initialValues?.type ?? 'CURRENT_ASSET')
  const [nameError, setNameError] = useState('')
  const [amountError, setAmountError] = useState('')
  const [serverError, setServerError] = useState('')
  const [isPending, startTransition] = useTransition()

  function validate(): boolean {
    let valid = true

    if (!name.trim()) {
      setNameError('Item name is required')
      valid = false
    } else {
      setNameError('')
    }

    const parsed = Number(amount)
    if (isNaN(parsed) || parsed <= 0) {
      setAmountError('Amount must be greater than zero')
      valid = false
    } else {
      setAmountError('')
    }

    return valid
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')

    if (!validate()) return

    const parsedAmount = Number(amount)

    startTransition(async () => {
      if (mode === 'create') {
        const result = await createNetWorthItem({
          name: name.trim(),
          amount: parsedAmount,
          type,
          householdId,
        })
        if (!result.success) {
          setServerError(result.error)
          return
        }
        onSuccess(result.data)
      } else {
        if (!initialValues) return
        const result = await updateNetWorthItem(initialValues.id, {
          name: name.trim(),
          amount: parsedAmount,
          type,
          householdId,
        })
        if (!result.success) {
          setServerError(result.error)
          return
        }
        onSuccess(result.data)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="nw-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Item Name
        </label>
        <input
          id="nw-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Emergency Savings, House, Home Mortgage"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          aria-label="Item Name"
        />
        {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
      </div>

      <div>
        <label
          htmlFor="nw-amount"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Amount (Rp)
        </label>
        <input
          id="nw-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 50000000"
          min="1"
          step="1"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] tabular-nums"
          aria-label="Amount"
        />
        {amountError && <p className="mt-1 text-xs text-red-500">{amountError}</p>}
      </div>

      <div>
        <label
          htmlFor="nw-type"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Type
        </label>
        <select
          id="nw-type"
          value={type}
          onChange={(e) => setType(e.target.value as NetWorthItem['type'])}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          aria-label="Type"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {serverError && (
        <p className="text-xs text-red-500">{serverError}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors min-h-[44px]"
        >
          {isPending ? 'Saving…' : mode === 'create' ? 'Add Item' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 transition-colors min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
