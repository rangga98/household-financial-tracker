'use client'

import { SinkingFundCard } from './SinkingFundCard'
import type { SinkingFund } from '@/types/sinking-funds'

interface FundListProps {
  funds: SinkingFund[]
  onEdit: (fund: SinkingFund) => void
  onDelete: (id: string) => void
  onAddContribution: (fund: SinkingFund) => void
}

export function FundList({ funds, onEdit, onDelete, onAddContribution }: FundListProps) {
  if (funds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-400 text-sm mb-2">No sinking funds yet</p>
        <p className="text-gray-500 font-medium">Create your first fund to start saving towards a goal</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {funds.map((fund) => (
        <SinkingFundCard
          key={fund.id}
          fund={fund}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddContribution={onAddContribution}
        />
      ))}
    </div>
  )
}
