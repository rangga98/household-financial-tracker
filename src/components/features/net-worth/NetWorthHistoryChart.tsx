'use client'

import { AreaChart } from '@tremor/react'
import type { NetWorthSnapshot } from '@/types/net-worth'

interface NetWorthHistoryChartProps {
  snapshots: NetWorthSnapshot[]
}

export function NetWorthHistoryChart({ snapshots }: NetWorthHistoryChartProps) {
  const chartData = snapshots.map((s) => ({
    date: s.snapshotDate,
    'Net Worth': s.netWorth,
    'Total Assets': s.totalAssets,
    'Total Liabilities': s.totalLiabilities,
  }))

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Net Worth Over Time
      </h3>

      {snapshots.length === 1 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Update your net worth again tomorrow to see your progress over time.
        </p>
      )}

      <AreaChart
        data={chartData}
        index="date"
        categories={['Net Worth', 'Total Assets', 'Total Liabilities']}
        colors={['blue', 'emerald', 'red']}
        valueFormatter={(value: number) =>
          new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            notation: 'compact',
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
          }).format(value)
        }
        noDataText="No history yet. Add your first asset or liability to get started."
        className="h-48"
        showLegend
        showGridLines
      />
    </div>
  )
}
