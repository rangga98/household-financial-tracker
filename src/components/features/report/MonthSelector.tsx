'use client'

import { useRouter } from 'next/navigation'
import { ReportHeader } from './ReportHeader'

interface MonthSelectorProps {
  selectedMonth: string
  availableMonths: string[]
}

export function MonthSelector({ selectedMonth, availableMonths }: MonthSelectorProps) {
  const router = useRouter()

  const handleMonthChange = (month: string) => {
    router.push(`/report?month=${month}`)
  }

  return (
    <ReportHeader
      selectedMonth={selectedMonth}
      onMonthChange={handleMonthChange}
      availableMonths={availableMonths}
    />
  )
}
