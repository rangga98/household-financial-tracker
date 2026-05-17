'use client'

import { useState, useTransition } from 'react'
import { Plus, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { FilingDeadlineForm } from './FilingDeadlineForm'
import { markFilingDeadlineAsFiled, unarchiveFilingDeadline } from '@/app/actions/tax-planning'
import type { TaxFilingDeadlineWithCountdown } from '@/types/tax-planning'

interface FilingDeadlineListProps {
  deadlines: TaxFilingDeadlineWithCountdown[]
  householdId: string
  onRefresh: () => void
}

const TAX_FILING_LABELS: Record<string, string> = {
  income_tax: 'Income Tax (SPT)',
  custom: 'Custom',
}

export function FilingDeadlineList({ deadlines, householdId, onRefresh }: FilingDeadlineListProps) {
  const [showForm, setShowForm] = useState(false)
  const [, startTransition] = useTransition()

  function handleMarkFiled(id: string) {
    startTransition(async () => {
      await markFilingDeadlineAsFiled(id)
      onRefresh()
    })
  }

  function handleUnarchive(id: string) {
    startTransition(async () => {
      await unarchiveFilingDeadline(id)
      onRefresh()
    })
  }

  const urgentDeadlines = deadlines.filter((d) => d.isUrgent)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Filing Deadlines
        </h2>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Deadline
        </button>
      </div>

      {urgentDeadlines.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <span className="font-medium">Urgent: deadline approaching</span>
            {' — '}
            {urgentDeadlines.length} filing deadline{urgentDeadlines.length > 1 ? 's' : ''} due soon.
          </p>
        </div>
      )}

      {deadlines.length === 0 && !showForm ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No filing deadlines yet.</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Add a deadline to track your annual tax filings.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deadlines.map((d) => (
            <div
              key={d.id}
              className={`rounded-xl border bg-white dark:bg-gray-900 p-4 ${
                d.isUrgent
                  ? 'border-amber-300 dark:border-amber-700'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {TAX_FILING_LABELS[d.taxType] ?? d.taxType}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      FY {d.fiscalYear}
                    </span>
                    {d.status === 'filed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Filed
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          d.daysUntilDeadline < 0
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            : d.isUrgent
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {d.daysUntilDeadline < 0
                          ? `${Math.abs(d.daysUntilDeadline)} days overdue`
                          : d.daysUntilDeadline === 0
                          ? 'Due today'
                          : `${d.daysUntilDeadline} days left`}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Deadline: {d.filingDeadline}
                    {d.filedAt && ` · Filed: ${d.filedAt.split('T')[0]}`}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  {d.status === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => handleMarkFiled(d.id)}
                      className="inline-flex items-center min-h-[44px] px-3 py-2 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                    >
                      Mark as Filed
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUnarchive(d.id)}
                      className="inline-flex items-center min-h-[44px] px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Unarchive
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              New Filing Deadline
            </h3>
            <FilingDeadlineForm
              householdId={householdId}
              onSuccess={() => {
                setShowForm(false)
                onRefresh()
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
