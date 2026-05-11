'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getFIProfile, getBudgetBasedAnnualExpenses } from '@/app/actions/financial-freedom'
import { getProfiles } from '@/lib/supabase/queries/profiles'
import { FinancialFreedomDashboard } from '@/components/features/financial-freedom/FinancialFreedomDashboard'
import type { FIProfile } from '@/types/financial-freedom'

const DEMO_HOUSEHOLD_ID = '963a25fc-553a-48b2-9439-d093984015f2'

export default function FinancialFreedomPage() {
  const [profile, setProfile] = useState<FIProfile | null>(null)
  const [suggestedAnnualExpenses, setSuggestedAnnualExpenses] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const profiles = await getProfiles(DEMO_HOUSEHOLD_ID)
      const userId = profiles[0]?.id

      if (!userId) {
        setProfile(null)
        return
      }

      const [fiProfile, expenses] = await Promise.all([
        getFIProfile(userId),
        getBudgetBasedAnnualExpenses(DEMO_HOUSEHOLD_ID),
      ])

      setProfile(
        fiProfile || {
          id: userId,
          householdId: DEMO_HOUSEHOLD_ID,
          fiAnnualExpenses: null,
          fiSavingsRate: null,
          fiCurrentAge: null,
          fiCurrentNetWorth: null,
          fiExpectedReturn: null,
        }
      )
      setSuggestedAnnualExpenses(expenses)
    } catch (err) {
      console.error('Failed to load financial freedom data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleProfileUpdate = (updatedProfile: FIProfile) => {
    setProfile(updatedProfile)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Freedom
          </h1>
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Freedom
          </h1>
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Freedom
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            No profile found. Please create a profile first.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Financial Freedom
        </h1>
        <FinancialFreedomDashboard
          profile={profile}
          suggestedAnnualExpenses={suggestedAnnualExpenses}
          onProfileUpdate={handleProfileUpdate}
        />
      </div>
    </div>
  )
}
