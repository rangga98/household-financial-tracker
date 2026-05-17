'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getTaxDashboardData, getDeductibleTransactions } from '@/lib/supabase/queries/tax-planning'
import { getFilingDeadlines } from '@/lib/supabase/queries/tax-planning'
import { TaxPlanningDashboard } from '@/components/features/tax-planning/TaxPlanningDashboard'
import type { TaxDashboardData, TaxDeductionRecord } from '@/types/tax-planning'

const DEMO_HOUSEHOLD_ID = '963a25fc-553a-48b2-9439-d093984015f2'

export default function TaxPlanningPage() {
  const currentYear = new Date().getFullYear()
  const [dashboardData, setDashboardData] = useState<TaxDashboardData | null>(null)
  const [deductions, setDeductions] = useState<TaxDeductionRecord[]>([])
  const [fiscalYear, setFiscalYear] = useState(currentYear)
  const [isYearLocked, setIsYearLocked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const [dashboard, txDeductions, filingDeadlines] = await Promise.all([
        getTaxDashboardData(DEMO_HOUSEHOLD_ID),
        getDeductibleTransactions(DEMO_HOUSEHOLD_ID, fiscalYear),
        getFilingDeadlines(DEMO_HOUSEHOLD_ID),
      ])
      setDashboardData(dashboard)
      setDeductions(txDeductions)
      const locked = filingDeadlines.some(
        (d) => d.fiscalYear === fiscalYear && d.status === 'filed'
      )
      setIsYearLocked(locked)
    } catch (err) {
      console.error('Failed to load tax planning data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [fiscalYear])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <BackLink />
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              ))}
            </div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <BackLink />
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <BackLink />
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Tax Planning</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Obligations, filing deadlines & deductible expenses
          </p>
        </div>
        <TaxPlanningDashboard
          householdId={DEMO_HOUSEHOLD_ID}
          data={dashboardData}
          currentFiscalYear={fiscalYear}
          deductions={deductions}
          isYearLocked={isYearLocked}
          onRefresh={loadData}
          onFiscalYearChange={(year) => setFiscalYear(year)}
        />
      </div>
    </div>
  )
}

function BackLink() {
  return (
    <Link
      href="/"
      className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors w-fit"
    >
      <ArrowLeft className="w-4 h-4" />
      Dashboard
    </Link>
  )
}
