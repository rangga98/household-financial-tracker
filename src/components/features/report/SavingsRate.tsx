'use client'

import { Card, Callout, Badge, Metric, Text } from '@tremor/react'
import { formatRp } from '@/lib/utils/currency'
import type { SavingsHealthStatus } from '@/types/report'
import { TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import type { ElementType } from 'react'

interface SavingsRateProps {
  savingsRate: number | null
  totalIncome: number
  totalExpenses: number
}

function getHealthStatus(savingsRate: number | null): {
  status: SavingsHealthStatus
  label: string
  color: 'emerald' | 'yellow' | 'red'
  icon: ElementType
} {
  if (savingsRate === null || savingsRate < 10) {
    return {
      status: 'needs_attention',
      label: 'Needs Attention',
      color: 'red',
      icon: AlertTriangle,
    }
  }
  if (savingsRate >= 10 && savingsRate <= 20) {
    return {
      status: 'caution',
      label: 'Caution',
      color: 'yellow',
      icon: Info,
    }
  }
  return {
    status: 'healthy',
    label: 'Healthy',
    color: 'emerald',
    icon: CheckCircle,
  }
}

export function SavingsRate({ savingsRate, totalIncome, totalExpenses }: SavingsRateProps) {
  const health = getHealthStatus(savingsRate)
  const displayRate = savingsRate !== null ? `${savingsRate.toFixed(2)}%` : 'N/A'

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-emerald-600" />
        <Text className="font-semibold">Savings Rate</Text>
      </div>

      <div className="flex items-baseline gap-3 mb-4">
        <Metric className="tabular-nums">{displayRate}</Metric>
        <Badge color={health.color} size="sm">
          {health.label}
        </Badge>
      </div>

      <Callout
        title={health.label}
        icon={health.icon}
        color={health.color}
        className="mt-2"
      >
        {health.status === 'healthy'
          ? 'Your financial foundation is very healthy. Keep it up!'
          : health.status === 'caution'
            ? 'You are saving, but there is room for improvement.'
            : 'Your expenses exceed or nearly match your income. Consider reviewing your budget.'}
      </Callout>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">Total Income</Text>
          <p className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatRp(totalIncome)}
          </p>
        </div>
        <div>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">Total Expenses</Text>
          <p className="text-lg font-semibold tabular-nums text-red-600 dark:text-red-400">
            {formatRp(totalExpenses)}
          </p>
        </div>
      </div>
    </Card>
  )
}
