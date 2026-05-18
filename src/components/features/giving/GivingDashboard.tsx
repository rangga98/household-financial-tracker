"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, Title, Text } from '@tremor/react'
import { useGivingStore } from '@/hooks/useGiving'
import { useCashFlowStore } from '@/hooks/useCashFlow'
import { GivingSummaryCard } from './GivingSummaryCard'
import { GivingDonutChart } from './GivingDonutChart'
import { GivingBarChart } from './GivingBarChart'

interface Props {
  householdId?: string
}

function getPeriod(option: string) {
  const now = new Date()
  if (option === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { start, end, label: 'This Month' }
  }
  // default YTD
  const start = new Date(now.getFullYear(), 0, 1)
  const end = new Date(now.getFullYear(), 11, 31)
  return { start, end, label: 'Year to Date' }
}

export function GivingDashboard({ householdId }: Props) {
  const cash = useCashFlowStore()
  const effectiveHouseholdId = householdId || cash.householdId || undefined
  const { summary, loadSummary } = useGivingStore()
  const [range, setRange] = useState<'ytd' | 'this_month'>('ytd')

  useEffect(() => {
    if (!effectiveHouseholdId) return
    const { start, end } = getPeriod(range)
    loadSummary(effectiveHouseholdId, start, end)
  }, [effectiveHouseholdId, range, loadSummary])

  const totals = summary?.totals || { totalEarmarked: 0, totalDisbursed: 0, netBalance: 0 }
  const donutData = useMemo(
    () =>
      (summary?.categories || []).map((c) => ({
        name: c.category,
        value: c.totalEarmarked + c.totalDisbursed,
      })),
    [summary]
  )

  const monthlyData = useMemo(() => {
    // Placeholder monthly data when summary is present but no per-month API yet
    // Can be replaced by a real monthly aggregation later
    const base = [
      { month: 'Jan', zakat: 0, donation: 0, compassion: 0 },
      { month: 'Feb', zakat: 0, donation: 0, compassion: 0 },
      { month: 'Mar', zakat: 0, donation: 0, compassion: 0 },
      { month: 'Apr', zakat: 0, donation: 0, compassion: 0 },
      { month: 'May', zakat: 0, donation: 0, compassion: 0 },
      { month: 'Jun', zakat: 0, donation: 0, compassion: 0 },
      { month: 'Jul', zakat: 0, donation: 0, compassion: 0 },
      { month: 'Aug', zakat: 0, donation: 0, compassion: 0 },
      { month: 'Sep', zakat: 0, donation: 0, compassion: 0 },
      { month: 'Oct', zakat: 0, donation: 0, compassion: 0 },
      { month: 'Nov', zakat: 0, donation: 0, compassion: 0 },
      { month: 'Dec', zakat: 0, donation: 0, compassion: 0 },
    ]
    return base
  }, [])

  const isEmpty = (summary?.categories || []).length === 0 || (totals.totalEarmarked === 0 && totals.totalDisbursed === 0)

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <Title>Giving Dashboard</Title>
            <Text className="text-gray-600 dark:text-gray-400">Overview of your giving activity</Text>
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Period</label>
            <select
              value={range}
              onChange={(e) => setRange((e.target.value as 'ytd' | 'this_month') || 'ytd')}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="ytd">Year to Date</option>
              <option value="this_month">This Month</option>
            </select>
          </div>
        </div>
      </Card>

      {isEmpty ? (
        <Card className="border-dashed border-2 border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40">
          <Title>No giving data for selected period</Title>
          <Text className="text-gray-600 dark:text-gray-400 mt-1">Record transactions or adjust your date filter.</Text>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GivingSummaryCard label="Total Earmarked" amount={totals.totalEarmarked} tone="emerald" />
            <GivingSummaryCard label="Total Disbursed" amount={totals.totalDisbursed} tone="violet" />
            <GivingSummaryCard label="Net Balance" amount={totals.netBalance} tone="blue" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GivingDonutChart
              data={(summary?.categories || []).map((c) => ({ name: c.category, value: c.totalEarmarked + c.totalDisbursed }))}
            />
            <GivingBarChart data={monthlyData} />
          </div>
        </>
      )}
    </div>
  )
}
