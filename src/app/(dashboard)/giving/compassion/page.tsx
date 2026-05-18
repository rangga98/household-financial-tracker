"use client"

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CompassionFundCard } from '@/components/features/giving/CompassionFundCard'
import { CompassionFundHistory } from '@/components/features/giving/CompassionFundHistory'
import { DisbursementForm } from '@/components/features/giving/DisbursementForm'
import { useCashFlowStore } from '@/hooks/useCashFlow'
import { useGivingStore } from '@/hooks/useGiving'
import { useEffect, useMemo } from 'react'

export default function CompassionPage() {
  const cash = useCashFlowStore()
  const { goals, loadGoals } = useGivingStore()

  const householdId = cash.householdId || ''
  const userId = cash.currentUserId || ''

  useEffect(() => {
    if (householdId) loadGoals(householdId)
  }, [householdId, loadGoals])

  const compassion = useMemo(() => goals.find((g) => g.goalType === 'giving_compassion') || null, [goals])

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <div className="mb-2">
        <Link
          href="/giving"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          aria-label="Back to Giving"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <CompassionFundCard />

      <DisbursementForm
        householdId={householdId}
        userId={userId}
        compassionGoalId={compassion?.id || ''}
        currentBalance={compassion?.currentAmount}
        categories={cash.categories}
      />

      <CompassionFundHistory householdId={householdId} />
    </div>
  )
}
