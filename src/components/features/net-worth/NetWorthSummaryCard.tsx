'use client'

import type { NetWorthSummary } from '@/types/net-worth'

interface NetWorthSummaryCardProps {
  summary: NetWorthSummary
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

interface MetricCardProps {
  label: string
  value: string
  className?: string
}

function MetricCard({ label, value, className = '' }: MetricCardProps) {
  return (
    <div className={`rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
  )
}

export function NetWorthSummaryCard({ summary }: NetWorthSummaryCardProps) {
  const netWorthColor = summary.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  const netWorthBorder = summary.isPositive
    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30'
    : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30'

  return (
    <div className="space-y-3">
      {/* Net Worth — hero metric */}
      <div className={`rounded-xl border ${netWorthBorder} p-4`}>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
          Net Worth
        </p>
        <p
          data-testid="net-worth-value"
          className={`text-2xl font-bold tabular-nums ${netWorthColor}`}
        >
          {formatAmount(summary.netWorth)}
        </p>
        {!summary.isPositive && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">
            Liabilities exceed assets
          </p>
        )}
      </div>

      {/* Secondary metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Current Assets" value={formatAmount(summary.totalCurrentAssets)} />
        <MetricCard label="Non-Current Assets" value={formatAmount(summary.totalNonCurrentAssets)} />
        <MetricCard label="Total Assets" value={formatAmount(summary.totalAssets)} />
        <MetricCard label="Total Liabilities" value={formatAmount(summary.totalLiabilities)} />
      </div>
    </div>
  )
}
