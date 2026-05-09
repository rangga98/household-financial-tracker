'use client'

import { Card, Text } from '@tremor/react'
import { formatRp } from '@/lib/utils/currency'
import type { SavingsHealthStatus } from '@/types/report'
import { TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import type { ElementType } from 'react'

interface SavingsRateProps {
  savingsRate: number | null
  totalIncome: number
  totalExpenses: number
}

interface HealthConfig {
  status: SavingsHealthStatus
  label: string
  hex: string
  lightBg: string
  darkBg: string
  lightBorder: string
  darkBorder: string
  icon: ElementType
}

function getHealthConfig(savingsRate: number | null): HealthConfig {
  if (savingsRate === null || savingsRate < 10) {
    return {
      status: 'needs_attention',
      label: 'Needs Attention',
      hex: '#ef4444',
      lightBg: 'bg-red-50',
      darkBg: 'dark:bg-red-950/30',
      lightBorder: 'border-red-400',
      darkBorder: 'dark:border-red-700',
      icon: AlertTriangle,
    }
  }
  if (savingsRate >= 10 && savingsRate <= 20) {
    return {
      status: 'caution',
      label: 'Caution',
      hex: '#f59e0b',
      lightBg: 'bg-amber-50',
      darkBg: 'dark:bg-amber-950/30',
      lightBorder: 'border-amber-400',
      darkBorder: 'dark:border-amber-700',
      icon: Info,
    }
  }
  return {
    status: 'healthy',
    label: 'Healthy',
    hex: '#10b981',
    lightBg: 'bg-emerald-50',
    darkBg: 'dark:bg-emerald-950/30',
    lightBorder: 'border-emerald-400',
    darkBorder: 'dark:border-emerald-700',
    icon: CheckCircle,
  }
}

function GaugeRing({
  value,
  color,
  size = 120,
  stroke = 10,
}: {
  value: number
  color: string
  size?: number
  stroke?: number
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-gray-200 dark:text-gray-700"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

export function SavingsRate({ savingsRate, totalIncome, totalExpenses }: SavingsRateProps) {
  const health = getHealthConfig(savingsRate)
  const displayRate = savingsRate !== null ? savingsRate.toFixed(2) : null
  const rateForGauge = displayRate ? Math.min(Math.max(Number(displayRate), 0), 100) : 0
  const HealthIcon = health.icon

  return (
    <Card className="p-6 relative overflow-hidden">
      {/* Accent border */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${health.lightBorder} ${health.darkBorder}`} />

      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-5 h-5" style={{ color: health.hex }} />
        <Text className="font-semibold">Savings Rate</Text>
      </div>

      {/* Main gauge + number */}
      <div className="flex items-center gap-5 mb-5">
        <div className="relative shrink-0">
          <GaugeRing value={rateForGauge} color={health.hex} size={110} stroke={9} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tabular-nums" style={{ color: health.hex }}>
              {displayRate !== null ? `${displayRate}%` : 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${health.lightBg} ${health.darkBg}`}
            style={{ color: health.hex }}
          >
            <HealthIcon className="w-4 h-4" />
            {health.label}
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {health.status === 'healthy'
              ? 'Your financial foundation is very healthy. Keep it up!'
              : health.status === 'caution'
                ? 'You are saving, but there is room for improvement.'
                : 'Your expenses exceed or nearly match your income. Consider reviewing your budget.'}
          </p>
        </div>
      </div>

      {/* Income / Expense breakdown */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="rounded-lg p-3 bg-emerald-50 dark:bg-emerald-950/20">
          <Text className="text-gray-500 dark:text-gray-400 text-xs">Total Income</Text>
          <p className="text-base font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
            {formatRp(totalIncome)}
          </p>
        </div>
        <div className="rounded-lg p-3 bg-red-50 dark:bg-red-950/20">
          <Text className="text-gray-500 dark:text-gray-400 text-xs">Total Expenses</Text>
          <p className="text-base font-bold tabular-nums text-red-700 dark:text-red-300">
            {formatRp(totalExpenses)}
          </p>
        </div>
      </div>
    </Card>
  )
}
