'use client'

import { PolicyCard } from './PolicyCard'
import type { PolicyWithStatus, InsurancePolicy } from '@/types/risk-management'

interface PolicyListProps {
  policies: PolicyWithStatus[]
  onEdit: (policy: InsurancePolicy) => void
  onDeactivate: (id: string) => void
  onMarkPaid: (policy: InsurancePolicy) => void
  onAddPolicy: () => void
}

export function PolicyList({ policies, onEdit, onDeactivate, onMarkPaid, onAddPolicy }: PolicyListProps) {
  if (policies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No insurance policies yet.</p>
        <button
          onClick={onAddPolicy}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Add Policy
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {policies.map((policy) => (
        <PolicyCard
          key={policy.id}
          policy={policy}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
          onMarkPaid={onMarkPaid}
        />
      ))}
    </div>
  )
}
