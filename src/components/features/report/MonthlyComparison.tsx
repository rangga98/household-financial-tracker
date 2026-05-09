'use client'

import { Card, Text, Badge } from '@tremor/react'
import { formatRp } from '@/lib/utils/currency'
import { ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react'

interface MonthlyComparisonProps {
  currentMonthTotal: number
  previousMonthTotal: number
  currentMonthLabel: string
  previousMonthLabel: string
}

export function MonthlyComparison({
  currentMonthTotal,
  previousMonthTotal,
  currentMonthLabel,
  previousMonthLabel,
}: MonthlyComparisonProps) {
  const hasPreviousData = previousMonthTotal > 0
  const difference = currentMonthTotal - previousMonthTotal
  const percentChange = hasPreviousData
    ? Math.round((difference / previousMonthTotal) * 10000) / 100
    : 0
  const isIncrease = difference > 0
  const isSignificantIncrease = hasPreviousData && percentChange > 10

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-purple-600" />
        <Text className="font-semibold">Monthly Comparison</Text>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 sm:p-4 rounded-lg min-w-0">
          <Text className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1 truncate">{currentMonthLabel}</Text>
          <p className="text-sm sm:text-base lg:text-lg font-bold tabular-nums break-all">{formatRp(currentMonthTotal)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 sm:p-4 rounded-lg min-w-0">
          <Text className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1 truncate">{previousMonthLabel}</Text>
          {hasPreviousData ? (
            <p className="text-sm sm:text-base lg:text-lg font-bold tabular-nums break-all">{formatRp(previousMonthTotal)}</p>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Text className="text-xs sm:text-sm">No data</Text>
            </div>
          )}
        </div>
      </div>

      {hasPreviousData && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            {isIncrease ? (
              <ArrowUpRight className="w-5 h-5 text-red-500" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-emerald-500" />
            )}
            <Text className="text-sm">
              {isIncrease ? 'Increased by' : 'Decreased by'}
            </Text>
          </div>
          <div className="text-right">
            <p
              className={`text-lg font-bold tabular-nums ${
                isSignificantIncrease ? 'text-red-600' : isIncrease ? 'text-orange-600' : 'text-emerald-600'
              }`}
            >
              {isIncrease ? '+' : ''}
              {formatRp(Math.abs(difference))}
            </p>
            <Badge
              color={isSignificantIncrease ? 'red' : isIncrease ? 'orange' : 'emerald'}
              size="sm"
            >
              {isIncrease ? '+' : ''}
              {percentChange}%
            </Badge>
          </div>
        </div>
      )}

      {isSignificantIncrease && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <Text className="text-red-700 dark:text-red-300 text-sm font-medium">
            Expenses increased by more than 10% compared to last month
          </Text>
        </div>
      )}
    </Card>
  )
}
