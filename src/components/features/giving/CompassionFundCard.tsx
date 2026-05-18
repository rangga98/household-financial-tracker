'use client'

import { useEffect } from 'react'
import { Card, Title, Text, Badge } from '@tremor/react'
import Link from 'next/link'
import { useGivingStore } from '@/hooks/useGiving'

interface Props {
  householdId?: string
}

export function CompassionFundCard({ householdId }: Props) {
  const { goals, summary, loadGoals, loadSummary } = useGivingStore()

  useEffect(() => {
    if (!householdId) return
    loadGoals(householdId)
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const end = new Date(now.getFullYear(), 11, 31)
    loadSummary(householdId, start, end)
  }, [householdId, loadGoals, loadSummary])

  const compassion = goals.find((g) => g.goalType === 'giving_compassion')
  const compassionSummary = summary?.categories.find((c) => c.category === 'Compassion Fund')

  return (
    <Link href="/giving/compassion" className="group block">
      <Card className="h-full transition-all cursor-pointer ring-1 ring-gray-200/60 dark:ring-gray-800 hover:ring-blue-500/60 hover:shadow-lg bg-white dark:bg-gray-900/60 group-hover:bg-gray-50 dark:group-hover:bg-gray-900/40">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Title>Compassion Fund</Title>
            <Text className="mt-2 text-gray-600 dark:text-gray-400">Balance & history</Text>
          </div>
          <Badge color="gray" className="ring-1 ring-black/5 dark:ring-white/10 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 group-hover:translate-x-0.5 transition-transform">View</Badge>
        </div>
        <div className="mt-4 text-2xl font-bold text-emerald-600">
          Rp {compassion?.currentAmount?.toLocaleString('id-ID') ?? '0'}
        </div>
        {compassionSummary && (
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            YTD earmarked Rp {compassionSummary.totalEarmarked.toLocaleString('id-ID')} • disbursed Rp {compassionSummary.totalDisbursed.toLocaleString('id-ID')}
          </Text>
        )}
      </Card>
    </Link>
  )
}
