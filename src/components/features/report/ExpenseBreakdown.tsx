'use client'

import { DonutChart, Card, Title, Text } from '@tremor/react'
import { formatRp } from '@/lib/utils/currency'
import type { ExpenseBreakdownItem } from '@/types/report'
import { PieChart } from 'lucide-react'

interface ExpenseBreakdownProps {
  data: ExpenseBreakdownItem[]
  totalExpenses: number
}

function groupSmallCategories(items: ExpenseBreakdownItem[]): Array<{ name: string; value: number; color: string }> {
  if (items.length <= 6) {
    return items.map((item) => ({
      name: item.categoryName,
      value: item.totalAmount,
      color: item.categoryColor ?? '#6b7280',
    }))
  }

  const mainItems = items.filter((item) => item.percentage >= 1)
  const smallItems = items.filter((item) => item.percentage < 1)

  const chartData = mainItems.map((item) => ({
    name: item.categoryName,
    value: item.totalAmount,
    color: item.categoryColor ?? '#6b7280',
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
          <PieChart className="w-5 h-5 text-blue-600" />
          <Title>Expense Breakdown</Title>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <PieChart className="w-12 h-12 mb-3 opacity-40" />
          <Text>No expenses recorded this month</Text>
        </div>
      </Card>
    )
  }

  const chartData = groupSmallCategories(data)
  const colors = chartData.map((d) => d.color)

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-5 h-5 text-blue-600" />
        <Title>Expense Breakdown</Title>
      </div>
      <div
        className="flex flex-col items-center"
        aria-label="Expense breakdown by category"
        role="img"
      >
        <DonutChart
          data={chartData}
          category="value"
          index="name"
          colors={colors}
          valueFormatter={(value: number) => formatRp(value)}
          showTooltip={true}
          showLabel={true}
          className="w-full h-64"
        />
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
