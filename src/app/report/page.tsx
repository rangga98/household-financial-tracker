import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getReportData } from '@/app/actions/report'
import {
  ExpenseBreakdown,
  SavingsRate,
  MonthlyComparison,
} from '@/components/features/report'
import { MonthSelector } from '@/components/features/report/MonthSelector'

interface ReportPageProps {
  searchParams: Promise<{ month?: string }>
}

// TODO: Replace with actual household ID from Supabase auth
const DEMO_HOUSEHOLD_ID = '963a25fc-553a-48b2-9439-d093984015f2'

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

function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const params = await searchParams
  const selectedMonth = params.month ?? getCurrentYearMonth()
  const availableMonths = getLast12Months()

  const reportData = await getReportData(DEMO_HOUSEHOLD_ID, selectedMonth)

  const currentMonthLabel = formatMonthLabel(selectedMonth)
  const previousMonthLabel = reportData.comparison
    ? formatMonthLabel(reportData.selectedMonth)
    : ''

  return (
    <main className="container mx-auto px-4 py-6 max-w-6xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
      <MonthSelector
        selectedMonth={selectedMonth}
        availableMonths={availableMonths}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 lg:col-span-1">
          <SavingsRate
            savingsRate={reportData.monthlyTotals.savingsRate}
            totalIncome={reportData.monthlyTotals.totalIncome}
            totalExpenses={reportData.monthlyTotals.totalExpenses}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <ExpenseBreakdown
            data={reportData.expenseBreakdown}
            totalExpenses={reportData.monthlyTotals.totalExpenses}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <MonthlyComparison
            currentMonthTotal={reportData.monthlyTotals.totalExpenses}
            previousMonthTotal={reportData.comparison?.previousMonth.totalExpenses ?? 0}
            currentMonthLabel={currentMonthLabel}
            previousMonthLabel={previousMonthLabel}
          />
        </div>
      </div>
    </main>
  )
}
