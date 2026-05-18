'use client'

import { useEffect, useState } from 'react'
import { Card, Title, Text } from '@tremor/react'
import { useGivingStore } from '@/hooks/useGiving'

interface Props {
  householdId?: string
}

export function CompassionFundHistory({ householdId }: Props) {
  const { goals, loadGoals, getGoalTransactions } = useGivingStore()
  const [items, setItems] = useState<{
    id: string
    amount: number
    type: 'income' | 'expense' | 'transfer'
    description: string
    transactionDate: Date
  }[]>([])

  useEffect(() => {
    const run = async () => {
      if (!householdId) return
      await loadGoals(householdId)
      const compassion = goals.find((g) => g.goalType === 'giving_compassion')
      if (!compassion) return
      const tx = await getGoalTransactions(householdId, compassion.id)
      setItems(tx.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        transactionDate: t.transactionDate,
      })))
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [householdId])

  return (
    <Card>
      <Title>Compassion Fund History</Title>
      <div className="mt-3 divide-y divide-gray-200 dark:divide-gray-800">
        {items.length === 0 && (
          <Text className="text-gray-500 dark:text-gray-400">No transactions yet</Text>
        )}
        {items.map((t) => (
          <div key={t.id} className="py-3 flex items-center justify-between">
            <div>
              <Text className="text-sm text-gray-600 dark:text-gray-400">{t.description || (t.type === 'transfer' ? 'Earmark' : 'Disbursement')}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-500">{t.transactionDate.toLocaleDateString('id-ID')}</Text>
            </div>
            <div className={`text-sm font-semibold tabular-nums ${t.type === 'expense' ? 'text-red-500' : 'text-emerald-600'}`}>
              {t.type === 'expense' ? '-' : '+'} Rp {Math.abs(t.amount).toLocaleString('id-ID')}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
