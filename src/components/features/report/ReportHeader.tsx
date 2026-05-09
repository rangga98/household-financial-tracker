'use client'

import { Text } from '@tremor/react'
import { Calendar } from 'lucide-react'

interface ReportHeaderProps {
  selectedMonth: string
  onMonthChange: (month: string) => void
  availableMonths: string[]
}

function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function ReportHeader({ selectedMonth, onMonthChange, availableMonths }: ReportHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-600" />
        <Text className="text-2xl font-bold">Financial Report</Text>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="month-select" className="text-sm text-gray-500 dark:text-gray-400">
          Period:
        </label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {availableMonths.map((ym) => (
            <option key={ym} value={ym}>
              {formatMonthLabel(ym)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
