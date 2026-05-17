'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { TaxObligationCard } from './TaxObligationCard'
import { TaxObligationForm } from './TaxObligationForm'
import { deleteTaxObligation, renewTaxObligation } from '@/app/actions/tax-planning'
import type { TaxObligationWithSchedule, TaxObligation } from '@/types/tax-planning'

interface TaxObligationListProps {
  obligations: TaxObligationWithSchedule[]
  householdId: string
  onRefresh: () => void
}

export function TaxObligationList({ obligations, householdId, onRefresh }: TaxObligationListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingObligation, setEditingObligation] = useState<TaxObligation | null>(null)
  const [, startTransition] = useTransition()

  function handleEdit(obligation: TaxObligation) {
    setEditingObligation(obligation)
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTaxObligation(id)
      onRefresh()
    })
  }

  function handleRenew(id: string) {
    const today = new Date()
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
    startTransition(async () => {
      await renewTaxObligation(id, {
        newTargetDate: nextYear.toISOString().split('T')[0],
        newTargetAmount: obligations.find((o) => o.obligation.id === id)?.obligation.targetAmount ?? 0,
      })
      onRefresh()
    })
  }

  const sorted = [...obligations].sort((a, b) =>
    a.obligation.targetDate.localeCompare(b.obligation.targetDate)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Tax Obligations
        </h2>
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          aria-label="Add obligation"
        >
          <Plus className="w-4 h-4" />
          Add Obligation
        </button>
      </div>

      {sorted.length === 0 && !showCreateForm ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No tax obligations yet.</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Add your first tax obligation to start tracking installments.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Plus className="w-4 h-4" />
            Add Obligation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((item) => (
            <TaxObligationCard
              key={item.obligation.id}
              data={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRenew={handleRenew}
            />
          ))}
        </div>
      )}

      {(showCreateForm || editingObligation) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {editingObligation ? 'Edit Obligation' : 'New Tax Obligation'}
            </h3>
            <TaxObligationForm
              mode={editingObligation ? 'edit' : 'create'}
              householdId={householdId}
              obligationId={editingObligation?.id}
              initialValues={
                editingObligation
                  ? {
                      name: editingObligation.name,
                      taxType: editingObligation.taxType,
                      targetAmount: editingObligation.targetAmount,
                      targetDate: editingObligation.targetDate,
                      notes: editingObligation.notes,
                    }
                  : undefined
              }
              onSuccess={() => {
                setShowCreateForm(false)
                setEditingObligation(null)
                onRefresh()
              }}
              onCancel={() => {
                setShowCreateForm(false)
                setEditingObligation(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
