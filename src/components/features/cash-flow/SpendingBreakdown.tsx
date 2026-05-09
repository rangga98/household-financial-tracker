'use client'

import { DonutChart } from '@tremor/react'
import { formatCompactRp } from '@/lib/utils/currency'
import type { Transaction } from '@/types'

interface SpendingBreakdownProps {
  transactions: Transaction[]
}

export function SpendingBreakdown({ transactions }: SpendingBreakdownProps) {
  const expenses = transactions.filter((t) => t.type === 'expense')
  
  const byCategory = expenses.reduce((acc, t) => {
    const name = t.category?.name || 'Unknown'
    const type = t.category?.type || 'variable'
    const key = `${name} (${type === 'fixed' ? 'Fixed' : 'Variable'})`
    acc[key] = (acc[key] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  const data = Object.entries(byCategory).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value)

  if (data.length === 0) {
    return null
  }

  const fixedTotal = expenses
    .filter((t) => t.category?.type === 'fixed')
    .reduce((sum, t) => sum + t.amount, 0)

  const variableTotal = expenses
    .filter((t) => t.category?.type === 'variable')
    .reduce((sum, t) => sum + t.amount, 0)

  const summaryData = [
    { name: 'Fixed (Mandatory)', value: fixedTotal },
    { name: 'Variable (Optional)', value: variableTotal },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
          Spending by Type
        </h3>
        <DonutChart
          data={summaryData}
          category="value"
          index="name"
          valueFormatter={formatCompactRp}
          colors={['orange', 'blue']}
          className="h-40"
        />
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-xs text-orange-600 dark:text-orange-400">Fixed</p>
            <p className="font-semibold text-orange-700 dark:text-orange-300">
              {formatCompactRp(fixedTotal)}
            </p>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400">Variable</p>
            <p className="font-semibold text-blue-700 dark:text-blue-300">
              {formatCompactRp(variableTotal)}
            </p>
          </div>
        </div>
      </div>

      {data.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
            Spending by Category
          </h3>
          <div className="space-y-2">
            {data.slice(0, 5).map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: `hsl(${i * 60}, 70%, 50%)` }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatCompactRp(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
