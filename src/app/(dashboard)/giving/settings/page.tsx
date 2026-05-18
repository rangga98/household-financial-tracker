"use client"

import { GivingSettingsForm } from '@/components/features/giving/GivingSettingsForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useCashFlowStore } from '@/hooks/useCashFlow'

export default function GivingSettingsPage() {
  const cash = useCashFlowStore()
  const userId = cash.currentUserId || ''

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-4">
        <Link
          href="/giving"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          aria-label="Back to Giving"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Giving Settings
      </h1>
      {userId ? (
        <GivingSettingsForm userId={userId} />
      ) : (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          No active user selected. Please pick a user in the Cash Flow module first.
        </div>
      )}
    </div>
  )
}
