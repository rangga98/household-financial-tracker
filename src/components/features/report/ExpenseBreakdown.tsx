'use client'

import { Card, Title, Text } from '@tremor/react'
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatRp } from '@/lib/utils/currency'
import type { ExpenseBreakdownItem } from '@/types/report'
import { PieChart as PieChartIcon } from 'lucide-react'

interface ExpenseBreakdownProps {
  data: ExpenseBreakdownItem[]
  totalExpenses: number
}

const FALLBACK_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1',
]

function groupSmallCategories(items: ExpenseBreakdownItem[]): Array<{ name: string; value: number; color: string }> {
  if (items.length <= 6) {
    return items.map((item, i) => ({
      name: item.categoryName,
      value: item.totalAmount,
      color: item.categoryColor ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }))
  }

  const mainItems = items.filter((item) => item.percentage >= 1)
  const smallItems = items.filter((item) => item.percentage < 1)

  const chartData = mainItems.map((item, i) => ({
    name: item.categoryName,
    value: item.totalAmount,
    color: item.categoryColor ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }))

  if (smallItems.length > 0) {
    const otherTotal = smallItems.reduce((sum, item) => sum + item.totalAmount, 0)
    chartData.push({
      name: 'Other',
      value: otherTotal,
      color: '#9ca3af',
    })
  }

  return chartData
}

export function ExpenseBreakdown({ data, totalExpenses }: ExpenseBreakdownProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon className="w-5 h-5 text-blue-600" />
          <Title>Expense Breakdown</Title>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <PieChartIcon className="w-12 h-12 mb-3 opacity-40" />
          <Text>No expenses recorded this month</Text>
        </div>
      </Card>
    )
  }

  const chartData = groupSmallCategories(data)

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="w-5 h-5 text-blue-600" />
        <Title>Expense Breakdown</Title>
      </div>
      <div
        className="flex flex-col items-center"
        aria-label="Expense breakdown by category"
        role="img"
      >
        <ResponsiveContainer width="100%" height={200}>
          <RePieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatRp(Number(value) || 0)}
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
          </RePieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item) => (
          <div key={item.categoryId} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: item.categoryColor ?? '#6b7280' }}
              />
              <Text>{item.categoryName}</Text>
            </div>
            <div className="text-right">
              <Text className="font-medium tabular-nums">{formatRp(item.totalAmount)}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">{item.percentage}%</Text>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
        <Text className="text-gray-500 dark:text-gray-400">Total Expenses</Text>
        <Text className="font-bold tabular-nums">{formatRp(totalExpenses)}</Text>
      </div>
    </Card>
  )
}
