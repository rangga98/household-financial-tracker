'use client'

import { Card, ProgressBar } from '@tremor/react'
import type { CoverageStatus, ProtectionTarget } from '@/types/risk-management'

interface InsuranceSummaryCardProps {
  coverageStatus: CoverageStatus
  protectionTarget: ProtectionTarget | null
  onSetTarget: () => void
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const COLOR_MAP: Record<CoverageStatus['color'], string> = {
  green: 'emerald',
  yellow: 'amber',
  red: 'red',
  gray: 'gray',
}

export function InsuranceSummaryCard({
  coverageStatus,
  protectionTarget,
  onSetTarget,
}: InsuranceSummaryCardProps) {
  const { totalCoverage, gap, percentage, isAdequate, color } = coverageStatus
  const tremorColor = COLOR_MAP[color] as 'emerald' | 'amber' | 'red' | 'gray'

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Coverage</p>
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
            {formatIDR(totalCoverage)}
          </p>
        </div>
        <button
          onClick={onSetTarget}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
        >
          {protectionTarget ? 'Edit Target' : 'Set Target'}
        </button>
      </div>

      {protectionTarget ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {isAdequate ? 'Fully covered' : `Gap: ${formatIDR(gap)}`}
            </span>
            <span className="font-medium">{formatIDR(protectionTarget.targetAmount)}</span>
          </div>
          <ProgressBar
            value={percentage}
            color={tremorColor}
            className="h-2"
          />
          <p className="text-xs text-gray-400">
            {Math.round(percentage)}% of protection target
            {isAdequate && ' — ✓ Adequate'}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">
          No protection target set. Set one to see coverage adequacy.
        </p>
      )}
    </Card>
  )
}
