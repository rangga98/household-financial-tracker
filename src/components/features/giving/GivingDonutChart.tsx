'use client'

import { Card, Title, DonutChart, Text } from '@tremor/react'

interface Props {
  data: { name: string; value: number }[]
}

export function GivingDonutChart({ data }: Props) {
  return (
    <Card>
      <Title>Giving Breakdown</Title>
      <Text className="text-gray-600 dark:text-gray-400 mb-3">Year-to-date by category</Text>
      <DonutChart
        data={data}
        category="value"
        index="name"
        valueFormatter={(n: number) => `Rp ${n.toLocaleString('id-ID')}`}
        colors={["emerald", "blue", "violet"]}
      />
    </Card>
  )
}
