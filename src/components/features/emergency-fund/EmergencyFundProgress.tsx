'use client'

import { formatCurrency, formatPercentage } from '@/lib/utils/emergency-fund'

interface EmergencyFundProgressProps {
  currentAmount: number
  targetAmount: number
  progress: number
}

export function EmergencyFundProgress({
  currentAmount,
  targetAmount,
  progress,
}: EmergencyFundProgressProps) {
  const isExceeded = progress >= 100
  const progressValue = Math.min(progress, 100)
  const barColor = isExceeded ? 'bg-emerald-500' : 'bg-blue-500'

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Emergency Fund Progress
        </span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {formatPercentage(progress)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${progressValue}%` }}
        />
      </div>

      <div className="flex justify-between text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Current</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(currentAmount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 dark:text-gray-400">Target</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(targetAmount)}
          </p>
        </div>
      </div>

      {isExceeded && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-center">
          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            🎉 Congratulations! You've reached your emergency fund target!
          </p>
        </div>
      )}
    </div>
  )
}
