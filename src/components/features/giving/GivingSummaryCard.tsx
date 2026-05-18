'use client'

import { Card, Title, Text } from '@tremor/react'

interface Props {
  label: string
  amount: number
  sublabel?: string
  tone?: 'emerald' | 'blue' | 'violet'
}

export function GivingSummaryCard({ label, amount, sublabel, tone = 'blue' }: Props) {
  const toneClass = tone === 'emerald' ? 'text-emerald-600' : tone === 'violet' ? 'text-violet-600' : 'text-blue-600'
  return (
    <Card>
      <Title>{label}</Title>
      {sublabel && <Text className="text-gray-600 dark:text-gray-400">{sublabel}</Text>}
      <div className={`mt-3 text-2xl font-bold tabular-nums ${toneClass}`}>Rp {amount.toLocaleString('id-ID')}</div>
    </Card>
  )
}
