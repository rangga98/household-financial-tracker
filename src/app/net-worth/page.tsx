'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getNetWorthItems, getNetWorthSnapshots, getNetWorthSummary } from '@/lib/supabase/queries/net-worth'
import { NetWorthDashboard } from '@/components/features/net-worth/NetWorthDashboard'
import type { NetWorthItem, NetWorthSnapshot, NetWorthSummary } from '@/types/net-worth'

const DEMO_HOUSEHOLD_ID = '963a25fc-553a-48b2-9439-d093984015f2'

const EMPTY_SUMMARY: NetWorthSummary = {
  totalCurrentAssets: 0,
  totalNonCurrentAssets: 0,
  totalAssets: 0,
  totalLiabilities: 0,
  netWorth: 0,
  isPositive: true,
}

export default function NetWorthPage() {
  const [items, setItems] = useState<NetWorthItem[]>([])
  const [summary, setSummary] = useState<NetWorthSummary>(EMPTY_SUMMARY)
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const [loadedItems, loadedSummary, loadedSnapshots] = await Promise.all([
        getNetWorthItems(DEMO_HOUSEHOLD_ID),
        getNetWorthSummary(DEMO_HOUSEHOLD_ID),
        getNetWorthSnapshots(DEMO_HOUSEHOLD_ID),
      ])
      setItems(loadedItems)
      setSummary(loadedSummary)
      setSnapshots(loadedSnapshots)
    } catch (err) {
      console.error('Failed to load net worth data:', err)
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
            <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[44px]"
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
        <NetWorthDashboard
          initialItems={items}
          initialSummary={summary}
          initialSnapshots={snapshots}
          householdId={DEMO_HOUSEHOLD_ID}
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
