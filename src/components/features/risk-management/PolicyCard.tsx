'use client'

import { useState } from 'react'
import { Card } from '@tremor/react'
import type { PolicyWithStatus, InsurancePolicy } from '@/types/risk-management'

interface PolicyCardProps {
  policy: PolicyWithStatus
  onEdit: (policy: InsurancePolicy) => void
  onDeactivate: (id: string) => void
  onMarkPaid: (policy: InsurancePolicy) => void
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const STATUS_BADGE: Record<
  PolicyWithStatus['premiumStatus'],
  { label: string; className: string }
> = {
  upcoming: {
    label: 'Upcoming',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  },
  paid: {
    label: 'Paid',
    className: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  },
  'one-time': {
    label: 'One-time',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
}

const FREQUENCY_LABEL: Record<InsurancePolicy['paymentFrequency'], string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  'semi-annual': 'Semi-annual',
  annual: 'Annual',
  'one-time': 'One-time',
}

const TYPE_LABEL: Record<InsurancePolicy['insuranceType'], string> = {
  life: 'Life',
  health: 'Health',
  property: 'Property',
  vehicle: 'Vehicle',
  other: 'Other',
}

export function PolicyCard({ policy, onEdit, onDeactivate, onMarkPaid }: PolicyCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const badge = STATUS_BADGE[policy.premiumStatus]

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {policy.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {policy.insurer} · {TYPE_LABEL[policy.insuranceType]}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0 ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-gray-400">Coverage</p>
          <p className="font-medium tabular-nums text-gray-900 dark:text-gray-100">
            {formatIDR(policy.coverageAmount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Premium ({FREQUENCY_LABEL[policy.paymentFrequency]})</p>
          <p className="font-medium tabular-nums text-gray-900 dark:text-gray-100">
            {formatIDR(policy.premiumAmount)}
          </p>
        </div>
      </div>

      {policy.daysUntilDue !== null && (
        <p className="text-xs text-gray-400">
          {policy.daysUntilDue < 0
            ? `${Math.abs(policy.daysUntilDue)} days overdue`
            : policy.daysUntilDue === 0
            ? 'Due today'
            : `Due in ${policy.daysUntilDue} days`}
        </p>
      )}

      {showConfirm ? (
        <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-950/20 p-3 space-y-2">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">Deactivate this policy?</p>
          <p className="text-xs text-red-500">The policy will be archived. All payment records are preserved.</p>
          <div className="flex gap-2">
            <button
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              onClick={() => {
                setShowConfirm(false)
                onDeactivate(policy.id)
              }}
            >
              Confirm Deactivate
            </button>
            <button
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {policy.premiumStatus !== 'paid' && policy.premiumStatus !== 'one-time' && (
            <button
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => onMarkPaid(policy)}
            >
              Mark as Paid
            </button>
          )}
          <button
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => onEdit(policy)}
          >
            Edit
          </button>
          <button
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            onClick={() => setShowConfirm(true)}
          >
            Deactivate
          </button>
        </div>
      )}
    </Card>
  )
}
