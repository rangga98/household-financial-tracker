'use client'

import { useState, useCallback, useMemo } from 'react'

function getCurrentYearMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function getLast12Months(): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    months.push(`${year}-${month}`)
  }
  return months
}

export function useReport(initialMonth?: string) {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth ?? getCurrentYearMonth())
  const availableMonths = useMemo(() => getLast12Months(), [])

  const handleMonthChange = useCallback((month: string) => {
    setSelectedMonth(month)
  }, [])

  return {
    selectedMonth,
    availableMonths,
    handleMonthChange,
  }
}
