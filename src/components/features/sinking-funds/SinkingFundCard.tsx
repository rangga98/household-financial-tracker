'use client'

import { useState } from 'react'
import { Card, ProgressBar } from '@tremor/react'
import { computeProgress, isFundOverdue } from '@/lib/utils/sinking-funds'
import type { SinkingFund } from '@/types/sinking-funds'

interface SinkingFundCardProps {
  fund: SinkingFund
  onEdit: (fund: SinkingFund) => void
  onDelete: (id: string) => void
  onAddContribution: (fund: SinkingFund) => void
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(dateStr)
  )
}

export function SinkingFundCard({ fund, onEdit, onDelete, onAddContribution }: SinkingFundCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const isComplete = fund.currentAmount >= fund.targetAmount
  const progress = computeProgress(fund.currentAmount, fund.targetAmount)
  const overdue = isFundOverdue(fund.targetDate, isComplete)
  const isOverFunded = progress > 100
  const amountRemaining = fund.targetAmount - fund.currentAmount

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{fund.name}</h3>
          {fund.description && (
            <p className="text-sm text-gray-500 truncate">{fund.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {overdue && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              Overdue
            </span>
          )}
          {isOverFunded && !overdue && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              {Math.round(progress)}% — Over-funded
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{formatIDR(fund.currentAmount)}</span>
          <span className="font-medium">{formatIDR(fund.targetAmount)}</span>
        </div>
        <ProgressBar
          value={Math.min(progress, 100)}
          color={overdue ? 'red' : isComplete ? 'green' : 'blue'}
          className="h-2"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{Math.round(progress)}%</span>
          {amountRemaining > 0 && (
            <span>{formatIDR(amountRemaining)} remaining</span>
          )}
        </div>
      </div>

      {fund.targetDate && (
        <p className="text-xs text-gray-400">
          Target: {formatDate(fund.targetDate)}
        </p>
      )}

      {showConfirm ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-2">
          <p className="text-sm font-medium text-red-700">Delete this fund?</p>
          <p className="text-xs text-red-500">The fund will be archived. All contributions are preserved.</p>
          <div className="flex gap-2">
            <button
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              onClick={() => {
                setShowConfirm(false)
                onDelete(fund.id)
              }}
            >
              Confirm Delete
            </button>
            <button
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <button
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => onAddContribution(fund)}
          >
            Add Contribution
          </button>
          <button
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => onEdit(fund)}
          >
            Edit
          </button>
          <button
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            onClick={() => setShowConfirm(true)}
          >
            Delete
          </button>
        </div>
      )}
    </Card>
  )
}
