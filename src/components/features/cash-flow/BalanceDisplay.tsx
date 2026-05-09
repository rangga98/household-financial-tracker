'use client'

import { useState } from 'react'
import { Card } from '@tremor/react'
import { formatCompactRp } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react'
import type { Balance } from '@/types'

interface BalanceDisplayProps {
  balance: Balance | null
  isLoading?: boolean
  onDateChange?: (date: string) => void
  selectedDate?: string
}

export function BalanceDisplay({ balance, isLoading, onDateChange, selectedDate }: BalanceDisplayProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    )
  }

  const isNegative = (balance?.balance ?? 0) < 0
  const isHistorical = selectedDate && selectedDate !== today

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          'p-4',
          isNegative && 'border-red-300 dark:border-red-800'
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-medium">
              {isHistorical ? 'Balance as of' : 'Current Balance'}
            </span>
          </div>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
          >
            <Calendar className="w-4 h-4" />
            {selectedDate ? new Date(selectedDate).toLocaleDateString('id-ID') : 'Today'}
          </button>
        </div>

        {showDatePicker && (
          <input
            type="date"
            value={selectedDate || today}
            max={today}
            onChange={(e) => {
              onDateChange?.(e.target.value)
              setShowDatePicker(false)
            }}
            className="w-full mt-2 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        )}

        <div className={cn(
          'text-3xl font-bold tabular-nums mt-2',
          isNegative ? 'text-red-600' : 'text-emerald-600'
        )}>
          {isNegative ? '-' : ''}{balance ? formatCompactRp(Math.abs(balance.balance)) : 'Rp 0'}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Income</span>
          </div>
          <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">
            {balance ? formatCompactRp(balance.totalIn) : 'Rp 0'}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm font-medium">Expense</span>
          </div>
          <p className="text-lg font-semibold text-red-700 dark:text-red-300 tabular-nums">
            {balance ? formatCompactRp(balance.totalOut) : 'Rp 0'}
          </p>
        </div>
      </div>
    </div>
  )
}
