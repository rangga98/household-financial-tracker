import { formatRp } from '@/lib/utils/currency'

interface DailySpendingPowerProps {
  amount: number
  isOverbudget: boolean
  overbudgetAmount?: number
}

export function DailySpendingPower({
  amount,
  isOverbudget,
  overbudgetAmount,
}: DailySpendingPowerProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Daily Spending Power
      </p>
      <p
        className={`text-2xl font-bold tabular-nums ${
          isOverbudget
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-900 dark:text-white'
        }`}
      >
        {formatRp(Math.round(amount))}
      </p>
      {isOverbudget && overbudgetAmount !== undefined && overbudgetAmount > 0 && (
        <p className="text-sm text-red-500 dark:text-red-400">
          {formatRp(Math.round(overbudgetAmount))} over budget
        </p>
      )}
    </div>
  )
}
