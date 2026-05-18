'use client'

import { useState } from 'react'
import { Card, Title, Text } from '@tremor/react'
import { useToast } from '@/components/features/cash-flow/Toast'
import type { Category } from '@/types'
import { recordDisbursementAction } from '@/app/actions/giving'

interface Props {
  householdId: string
  userId: string
  compassionGoalId: string
  currentBalance?: number
  categories?: Category[]
}

export function DisbursementForm({ householdId, userId, compassionGoalId, currentBalance, categories = [] }: Props) {
  const { showToast } = useToast()
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isUuidLike = (v: string) => v && v.length >= 32
  const hasValidIds = isUuidLike(householdId) && isUuidLike(userId) && isUuidLike(compassionGoalId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setError('')

    if (!hasValidIds) {
      setIsLoading(false)
      return setError('Missing required IDs. Please make sure a user and household are selected and Compassion Fund exists.')
    }

    const amt = parseFloat(amount)
    if (!categoryId) {
      setIsLoading(false)
      return setError('Please provide a category ID for this disbursement')
    }
    if (isNaN(amt) || amt <= 0) {
      setIsLoading(false)
      return setError('Amount must be a positive number')
    }

    // Insufficient balance warning (FR-056)
    if (currentBalance !== undefined && amt > currentBalance) {
      const ok = window.confirm('Balance is insufficient. Do you want to proceed anyway?')
      if (!ok) {
        setIsLoading(false)
        return
      }
    }

    const result = await recordDisbursementAction(
      householdId,
      userId,
      compassionGoalId,
      categoryId,
      amt,
      description || 'Compassion disbursement',
      new Date()
    )

    if (!result.success) {
      const msg = result.error || 'Failed to record disbursement'
      setError(msg)
      showToast(msg, 'error')
    } else {
      setMessage('Disbursement recorded')
      showToast('Disbursement recorded', 'success')
      setAmount('')
      setDescription('')
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <Title>Record Disbursement</Title>
      <form onSubmit={handleSubmit} className="mt-3 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Amount (Rp)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            placeholder="e.g., 500000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base tabular-nums"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base"
          >
            <option value="">Select expense category</option>
            {categories.filter(c => c.isActive).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose a category for this disbursement</Text>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Description</label>
          <input
            type="text"
            placeholder="e.g., Monthly allowance — Mom"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !hasValidIds}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Saving...' : 'Record Disbursement'}
        </button>

        {error && <Text className="text-red-600 text-center">{error}</Text>}
        {message && <Text className="text-green-600 text-center">{message}</Text>}
      </form>
    </Card>
  )
}
