'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getInsuranceDashboardData } from '@/lib/supabase/queries/risk-management'
import { getHealthBudgetMetrics } from '@/lib/supabase/queries/risk-management-health'
import { RiskManagementDashboard } from '@/components/features/risk-management/RiskManagementDashboard'
import type { InsuranceDashboardData } from '@/types/risk-management'
import type { BudgetMetrics } from '@/types'

const DEMO_HOUSEHOLD_ID = '963a25fc-553a-48b2-9439-d093984015f2'

export default function RiskManagementPage() {
  const [dashboardData, setDashboardData] = useState<InsuranceDashboardData | null>(null)
  const [healthMetrics, setHealthMetrics] = useState<BudgetMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const [insurance, health] = await Promise.all([
        getInsuranceDashboardData(DEMO_HOUSEHOLD_ID),
        getHealthBudgetMetrics(DEMO_HOUSEHOLD_ID),
      ])
      setDashboardData(insurance)
      setHealthMetrics(health)
    } catch (err) {
      console.error('Failed to load risk management data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <BackLink />
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-56" />
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Protection Layer</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Insurance & health budget tracking
          </p>
        </div>
        <RiskManagementDashboard
          householdId={DEMO_HOUSEHOLD_ID}
          insuranceData={dashboardData}
          healthMetrics={healthMetrics}
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
