"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Title, Text } from '@tremor/react'
import { Settings, X } from 'lucide-react'

const STORAGE_KEY = 'giving_empty_state_dismissed'

export function GivingEmptyState() {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      setDismissed(v === '1')
    } catch {}
  }, [])

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {}
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <Card className="border-dashed border-2 border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-blue-600" />
          <Title>Set up Giving allocations</Title>
        </div>
        <button
          aria-label="Dismiss"
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-gray-200/60 dark:hover:bg-gray-800/60"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <Text className="mt-2 text-gray-600 dark:text-gray-400">
        Configure Zakat/Donation percentages and Compassion Fund amount to enable automatic earmarks when you record income.
      </Text>
      <Link
        href="/giving/settings"
        className="inline-flex items-center justify-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
      >
        Open Giving Settings
      </Link>
    </Card>
  )
}
