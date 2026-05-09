'use client'

import { formatRp } from '@/lib/utils/currency'
import type { BudgetMetrics } from '@/types'
import { DailySpendingPower } from './DailySpendingPower'
import { OverbudgetAlert } from './OverbudgetAlert'

interface BudgetCardProps {
  metrics: BudgetMetrics
}

const colorMap = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-rose-500',
  gray: 'bg-gray-300',
}

export function BudgetCard({ metrics }: BudgetCardProps) {
  const {
    categoryName,
    monthlyLimit,
    totalSpent,
    percentageUsed,
    dailySpendingPower,
    isOverbudget,
    progressColor,
  } = metrics

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {categoryName}
        </h3>
        {monthlyLimit && (
          <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
            {formatRp(totalSpent)} / {formatRp(monthlyLimit)}
          </span>
        )}
      </div>

      {monthlyLimit && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {Math.round(percentageUsed)}% used
            </span>
          </div>
          <div
            className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
            aria-label={`${categoryName} budget progress`}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${colorMap[progressColor]}`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
        </div>
      )}

      <DailySpendingPower
        amount={dailySpendingPower}
        isOverbudget={isOverbudget}
        overbudgetAmount={
          isOverbudget && monthlyLimit ? totalSpent - monthlyLimit : undefined
        }
      />

      {isOverbudget && monthlyLimit && (
        <OverbudgetAlert
          categoryName={categoryName}
          percentageUsed={percentageUsed}
        />
      )}
    </div>
  )
}
