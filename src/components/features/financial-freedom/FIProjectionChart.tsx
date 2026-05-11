'use client'

import { Card, Title, Text } from '@tremor/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { formatCompactRp, formatRp } from '@/lib/utils/currency'
import type { FIYearProjection } from '@/types/financial-freedom'

interface FIProjectionChartProps {
  trajectory: FIYearProjection[]
  fiNumber: number
}

export function FIProjectionChart({ trajectory, fiNumber }: FIProjectionChartProps) {
  if (trajectory.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <Title>Net Worth Trajectory</Title>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <TrendingUp className="w-12 h-12 mb-3 opacity-40" />
          <Text>No projection data available</Text>
          <Text className="text-sm mt-1">Complete your profile to see your trajectory</Text>
        </div>
      </Card>
    )
  }

  // Format data for chart
  const chartData = trajectory.map((point) => ({
    year: point.year,
    age: point.age,
    netWorth: point.netWorth,
    formattedNetWorth: formatCompactRp(point.netWorth),
  }))

  const lastPoint = trajectory[trajectory.length - 1]
  const firstPoint = trajectory[0]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <Title>Net Worth Trajectory</Title>
        </div>
        <div className="text-right">
          <Text className="text-xs text-gray-500 dark:text-gray-400">FI Target</Text>
          <p className="text-sm font-semibold text-emerald-600">{formatCompactRp(fiNumber)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatCompactRp(value)}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              formatter={(value) => [formatRp(Number(value) || 0), 'Net Worth']}
              labelFormatter={(label) => `Year: ${label}`}
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            {/* FI Target Reference Line */}
            <ReferenceLine
              y={fiNumber}
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeOpacity={0.7}
            />
            <Line
              type="monotone"
              dataKey="netWorth"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3, fill: '#3b82f6' }}
              activeDot={{ r: 5, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-4">
        <div>
          <Text className="text-xs text-gray-500 dark:text-gray-400">Start Year</Text>
          <p className="text-sm font-semibold">{firstPoint.year}</p>
          <p className="text-xs text-gray-500">Age {firstPoint.age}</p>
        </div>
        <div>
          <Text className="text-xs text-gray-500 dark:text-gray-400">Target Year</Text>
          <p className="text-sm font-semibold">{lastPoint.year}</p>
          <p className="text-xs text-gray-500">Age {lastPoint.age}</p>
        </div>
        <div>
          <Text className="text-xs text-gray-500 dark:text-gray-400">Final Net Worth</Text>
          <p className="text-sm font-semibold">{formatRp(lastPoint.netWorth)}</p>
        </div>
      </div>
    </Card>
  )
}
