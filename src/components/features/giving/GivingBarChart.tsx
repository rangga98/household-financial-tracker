'use client'

import { Card, Title, BarChart, Text } from '@tremor/react'

interface Props {
  data: { month: string; zakat: number; donation: number; compassion: number }[]
}

export function GivingBarChart({ data }: Props) {
  return (
    <Card>
      <Title>Monthly Giving</Title>
      <Text className="text-gray-600 dark:text-gray-400 mb-3">Totals per month</Text>
      <BarChart
        data={data}
        index="month"
        categories={["zakat", "donation", "compassion"]}
        colors={["emerald", "blue", "violet"]}
        valueFormatter={(n: number) => `Rp ${n.toLocaleString('id-ID')}`}
        yAxisWidth={60}
      />
    </Card>
  )
}
