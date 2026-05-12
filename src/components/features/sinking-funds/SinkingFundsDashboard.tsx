'use client'

import { useState, useTransition } from 'react'
import { Calculator, Plus, X } from 'lucide-react'
import { FundList } from './FundList'
import { SinkingFundForm } from './SinkingFundForm'
import { ContributionForm } from './ContributionForm'
import { EducationCalculator } from './EducationCalculator'
import { deleteSinkingFund } from '@/app/actions/sinking-funds'
import type { SinkingFund, SinkingFundContribution } from '@/types/sinking-funds'

type DialogState =
  | { type: 'none' }
  | { type: 'create'; prefillAmount?: number }
  | { type: 'edit'; fund: SinkingFund }
  | { type: 'contribute'; fund: SinkingFund }
  | { type: 'calculator' }

interface SinkingFundsDashboardProps {
  initialFunds: SinkingFund[]
  householdId: string
}

export function SinkingFundsDashboard({ initialFunds, householdId }: SinkingFundsDashboardProps) {
  const [funds, setFunds] = useState<SinkingFund[]>(initialFunds)
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' })
  const [isPending, startTransition] = useTransition()

  function closeDialog() {
    setDialog({ type: 'none' })
  }

  function handleFundCreated(fund: SinkingFund) {
    setFunds((prev) => [fund, ...prev])
    closeDialog()
  }

  function handleFundUpdated(fund: SinkingFund) {
    setFunds((prev) => prev.map((f) => (f.id === fund.id ? fund : f)))
    closeDialog()
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteSinkingFund(id)
      if (result.success) {
        setFunds((prev) => prev.filter((f) => f.id !== id))
      }
    })
  }

  function handleContributionAdded(contribution: SinkingFundContribution) {
    setFunds((prev) =>
      prev.map((f) =>
        f.id === contribution.goalId
          ? { ...f, currentAmount: f.currentAmount + contribution.amount }
          : f
      )
    )
    closeDialog()
  }

  function handleCreateFromCalculator(prefillAmount: number) {
    setDialog({ type: 'create', prefillAmount })
  }

  const isDialogOpen = dialog.type !== 'none'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 whitespace-nowrap">Sinking Funds</h1>
        <div className="flex gap-2 flex-nowrap shrink-0">
          <button
            onClick={() => setDialog({ type: 'calculator' })}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Education Calculator</span>
            <span className="sm:hidden">Calculator</span>
          </button>
          <button
            onClick={() => setDialog({ type: 'create' })}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Fund</span>
            <span className="sm:hidden">New Fund</span>
          </button>
        </div>
      </div>

      <FundList
        funds={funds}
        onEdit={(fund) => setDialog({ type: 'edit', fund })}
        onDelete={handleDelete}
        onAddContribution={(fund) => setDialog({ type: 'contribute', fund })}
      />

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            {dialog.type === 'create' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Fund</h2>
                <SinkingFundForm
                  mode="create"
                  householdId={householdId}
                  initialValues={
                    dialog.prefillAmount
                      ? { targetAmount: dialog.prefillAmount }
                      : undefined
                  }
                  onSuccess={handleFundCreated}
                  onCancel={closeDialog}
                />
              </>
            )}

            {dialog.type === 'edit' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Fund</h2>
                <SinkingFundForm
                  mode="edit"
                  householdId={householdId}
                  initialValues={dialog.fund}
                  onSuccess={handleFundUpdated}
                  onCancel={closeDialog}
                />
              </>
            )}

            {dialog.type === 'contribute' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Contribution</h2>
                <ContributionForm
                  goalId={dialog.fund.id}
                  goalName={dialog.fund.name}
                  householdId={householdId}
                  onSuccess={handleContributionAdded}
                  onCancel={closeDialog}
                />
              </>
            )}

            {dialog.type === 'calculator' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Education Cost Calculator</h2>
                <EducationCalculator onCreateFund={handleCreateFromCalculator} />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={closeDialog}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
