'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatRp, parseRp } from '@/lib/utils/currency'
import type { Category, TransactionInput } from '@/types'

interface TransactionFormProps {
  categories: Category[]
  onSubmit: (data: TransactionInput) => Promise<void>
  currentUserId: string
}

export function TransactionForm({
  categories,
  onSubmit,
  currentUserId,
}: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const activeCategories = categories.filter((c) => c.isActive)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!amount || parseRp(amount) <= 0) {
      setError('Amount is required')
      return
    }
    if (!categoryId) {
      setError('Category is required')
      return
    }
    if (!date) {
      setError('Date is required')
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        type,
        amount: parseRp(amount),
        categoryId,
        description: description || undefined,
        transactionDate: date,
      })

      setAmount('')
      setCategoryId('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType('income')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors',
            type === 'income'
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          )}
        >
          <Plus className="w-5 h-5" />
          Income
        </button>
        <button
          type="button"
          onClick={() => setType('expense')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors',
            type === 'expense'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          )}
        >
          <Minus className="w-5 h-5" />
          Expense
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Amount
        </label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Rp 0"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-lg font-semibold"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <option value="">Select category</option>
          {activeCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.type === 'fixed' ? 'Fixed' : 'Variable'})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description (optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}
      </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Saving...' : 'Save Transaction'}
      </button>
    </form>
  )
}
