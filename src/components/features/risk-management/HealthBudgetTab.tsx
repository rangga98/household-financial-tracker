'use client'

import { useState, useTransition } from 'react'
import { Card, ProgressBar } from '@tremor/react'
import type { BudgetMetrics } from '@/types'

interface HealthBudgetTabProps {
  householdId: string
  metrics: BudgetMetrics[]
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function currentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const COLOR_MAP: Record<BudgetMetrics['progressColor'], 'green' | 'amber' | 'red' | 'gray'> = {
  green: 'green',
  yellow: 'amber',
  red: 'red',
  gray: 'gray',
}

export function HealthBudgetTab({ householdId, metrics: initialMetrics }: HealthBudgetTabProps) {
  const [yearMonth, setYearMonth] = useState(currentYearMonth())
  const [metrics, setMetrics] = useState(initialMetrics)
  const [, startTransition] = useTransition()

  function handleMonthChange(value: string) {
    setYearMonth(value)
    startTransition(async () => {
      const { getHealthBudgetMetrics } = await import(
        '@/lib/supabase/queries/risk-management-health'
      )
      const fresh = await getHealthBudgetMetrics(householdId, value)
      setMetrics(fresh)
    })
  }

  if (metrics.length === 0) {
    return (
      <div className="space-y-4">
        <MonthFilter value={yearMonth} onChange={handleMonthChange} />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No healthcare categories found.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Add categories like "Dokter / Doctor" or "Farmasi / Pharmacy" to track health spending.
          </p>
        </div>
      </div>
    )
  }

  const totalSpent = metrics.reduce((s, m) => s + m.totalSpent, 0)
  const totalBudget = metrics.reduce((s, m) => s + (m.monthlyLimit ?? 0), 0)

  return (
    <div className="space-y-4">
      <MonthFilter value={yearMonth} onChange={handleMonthChange} />

      <Card className="p-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Total Health Spending</span>
          <span className="font-semibold tabular-nums text-gray-900 dark:text-gray-100">
            {formatIDR(totalSpent)}
            {totalBudget > 0 && (
              <span className="text-gray-400 font-normal"> / {formatIDR(totalBudget)}</span>
            )}
          </span>
        </div>
      </Card>

      <div className="space-y-3">
        {metrics.map((metric) => (
          <Card key={metric.categoryId} className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {metric.categoryName}
              </h3>
              {metric.isOverbudget && (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400 flex-shrink-0">
                  Over budget
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{formatIDR(metric.totalSpent)}</span>
                {metric.monthlyLimit != null ? (
                  <span>{formatIDR(metric.monthlyLimit)}</span>
                ) : (
                  <span className="italic">No limit set</span>
                )}
              </div>
              <ProgressBar
                value={Math.min(metric.percentageUsed, 100)}
                color={COLOR_MAP[metric.progressColor]}
                className="h-1.5"
              />
              <p className="text-xs text-gray-400">
                {Math.round(metric.percentageUsed)}% used
                {metric.remainingBudget < 0 && (
                  <span className="text-red-500">
                    {' '}· {formatIDR(Math.abs(metric.remainingBudget))} over
                  </span>
                )}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function MonthFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="hb-month" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Month
      </label>
      <input
        id="hb-month"
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      />
    </div>
  )
}
