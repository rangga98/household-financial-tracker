'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEmergencyFundStore } from '@/hooks/useEmergencyFund'
import { getProfiles } from '@/lib/supabase/queries/profiles'
import { setupEmergencyFund, addToEmergencyFund, withdrawFromEmergencyFund } from '@/app/actions/emergency-fund'
import { EmergencyFundCard } from '@/components/features/emergency-fund'
import { useToast } from '@/components/features/cash-flow/Toast'

const DEMO_HOUSEHOLD_ID = '963a25fc-553a-48b2-9439-d093984015f2'

export default function EmergencyFundPage() {
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  const {
    profile: emergencyProfile,
    emergencyGoal,
    totalFunds,
    availableBalance,
    progress,
    loadEmergencyFund,
  } = useEmergencyFundStore()

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const allProfiles = await getProfiles(DEMO_HOUSEHOLD_ID)
      if (allProfiles.length > 0) {
        const userId = allProfiles[0].id
        await loadEmergencyFund(userId, DEMO_HOUSEHOLD_ID)
      }
    } catch (error) {
      console.error('Failed to load emergency fund data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [loadEmergencyFund])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleEmergencyFundSetup = async (input: {
    maritalStatus: 'single' | 'married'
    dependents: number
    monthlyLivingExpenseEstimate: number
  }) => {
    const allProfiles = await getProfiles(DEMO_HOUSEHOLD_ID)
    if (allProfiles.length === 0) {
      showToast('No user found', 'error')
      return
    }
    const userId = allProfiles[0].id
    try {
      await setupEmergencyFund(userId, DEMO_HOUSEHOLD_ID, input)
      await loadEmergencyFund(userId, DEMO_HOUSEHOLD_ID)
      showToast('Emergency fund target set!', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to setup emergency fund', 'error')
    }
  }

  const handleEmergencyFundAdd = async (amount: number) => {
    if (!emergencyGoal?.id) return
    try {
      await addToEmergencyFund(emergencyGoal.id, amount)
      const allProfiles = await getProfiles(DEMO_HOUSEHOLD_ID)
      if (allProfiles.length > 0) {
        await loadEmergencyFund(allProfiles[0].id, DEMO_HOUSEHOLD_ID)
      }
      showToast('Added to emergency fund!', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to add to emergency fund', 'error')
    }
  }

  const handleEmergencyFundWithdraw = async (amount: number) => {
    if (!emergencyGoal?.id) return
    try {
      await withdrawFromEmergencyFund(emergencyGoal.id, amount)
      const allProfiles = await getProfiles(DEMO_HOUSEHOLD_ID)
      if (allProfiles.length > 0) {
        await loadEmergencyFund(allProfiles[0].id, DEMO_HOUSEHOLD_ID)
      }
      showToast('Withdrawn from emergency fund', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to withdraw', 'error')
    }
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
          Emergency Fund
        </h1>
        <EmergencyFundCard
          profile={emergencyProfile}
          emergencyGoal={emergencyGoal}
          totalFunds={totalFunds}
          availableBalance={availableBalance}
          progress={progress}
          isLoading={isLoading}
          onSetup={handleEmergencyFundSetup}
          onAdd={handleEmergencyFundAdd}
          onWithdraw={handleEmergencyFundWithdraw}
        />
      </div>
    </div>
  )
}
