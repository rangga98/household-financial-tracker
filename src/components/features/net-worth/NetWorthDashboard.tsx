'use client'

import { useState, useTransition } from 'react'
import { Plus, X } from 'lucide-react'
import { NetWorthSummaryCard } from './NetWorthSummaryCard'
import { NetWorthItemList } from './NetWorthItemList'
import { NetWorthItemForm } from './NetWorthItemForm'
import { NetWorthHistoryChart } from './NetWorthHistoryChart'
import { deleteNetWorthItem } from '@/app/actions/net-worth'
import { calculateNetWorthSummary } from '@/lib/utils/net-worth'
import type { NetWorthItem, NetWorthSnapshot, NetWorthSummary } from '@/types/net-worth'

interface NetWorthDashboardProps {
  initialItems: NetWorthItem[]
  initialSummary: NetWorthSummary
  initialSnapshots: NetWorthSnapshot[]
  householdId: string
}

type DialogState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; item: NetWorthItem }

export function NetWorthDashboard({
  initialItems,
  initialSummary,
  initialSnapshots,
  householdId,
}: NetWorthDashboardProps) {
  const [items, setItems] = useState<NetWorthItem[]>(initialItems)
  const [summary, setSummary] = useState<NetWorthSummary>(initialSummary)
  const [snapshots] = useState<NetWorthSnapshot[]>(initialSnapshots)
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' })
  const [isPending, startTransition] = useTransition()

  function closeDialog() {
    setDialog({ type: 'none' })
  }

  function handleItemCreated(item: NetWorthItem) {
    const updated = [item, ...items]
    setItems(updated)
    setSummary(calculateNetWorthSummary(updated))
    closeDialog()
  }

  function handleItemUpdated(item: NetWorthItem) {
    const updated = items.map((i) => (i.id === item.id ? item : i))
    setItems(updated)
    setSummary(calculateNetWorthSummary(updated))
    closeDialog()
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteNetWorthItem(id, householdId)
      if (result.success) {
        const updated = items.filter((i) => i.id !== id)
        setItems(updated)
        setSummary(calculateNetWorthSummary(updated))
      }
    })
  }

  const isDialogOpen = dialog.type !== 'none'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
          Net Worth
        </h1>
        <button
          onClick={() => setDialog({ type: 'create' })}
          aria-label="Add Item"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap shrink-0 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Item</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <NetWorthSummaryCard summary={summary} />

      <NetWorthItemList
        items={items}
        onEdit={(item) => setDialog({ type: 'edit', item })}
        onDelete={handleDelete}
      />

      <NetWorthHistoryChart snapshots={snapshots} />

      {isPending && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
          Saving…
        </div>
      )}

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {dialog.type === 'create' ? 'Add Net Worth Item' : 'Edit Net Worth Item'}
              </h2>
              <button
                onClick={closeDialog}
                aria-label="Close dialog"
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {dialog.type === 'create' && (
              <NetWorthItemForm
                mode="create"
                householdId={householdId}
                onSuccess={handleItemCreated}
                onCancel={closeDialog}
              />
            )}

            {dialog.type === 'edit' && (
              <NetWorthItemForm
                mode="edit"
                householdId={householdId}
                initialValues={dialog.item}
                onSuccess={handleItemUpdated}
                onCancel={closeDialog}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
