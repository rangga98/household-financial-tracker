'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getSinkingFunds } from '@/lib/supabase/queries/sinking-funds'
import { SinkingFundsDashboard } from '@/components/features/sinking-funds/SinkingFundsDashboard'
import type { SinkingFund } from '@/types/sinking-funds'

const DEMO_HOUSEHOLD_ID = '963a25fc-553a-48b2-9439-d093984015f2'

export default function SinkingFundsPage() {
  const [funds, setFunds] = useState<SinkingFund[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await getSinkingFunds(DEMO_HOUSEHOLD_ID)
      setFunds(data)
    } catch (err) {
      console.error('Failed to load sinking funds:', err)
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
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
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
          <p className="text-red-500">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <BackLink />
        <SinkingFundsDashboard initialFunds={funds} householdId={DEMO_HOUSEHOLD_ID} />
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
