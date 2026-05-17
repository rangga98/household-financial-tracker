'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { NetWorthItem, NetWorthItemType } from '@/types/net-worth'

interface NetWorthItemListProps {
  items: NetWorthItem[]
  onEdit: (item: NetWorthItem) => void
  onDelete: (id: string) => void
}

const GROUP_CONFIG: { type: NetWorthItemType; label: string }[] = [
  { type: 'CURRENT_ASSET', label: 'Current Assets' },
  { type: 'NON_CURRENT_ASSET', label: 'Non-Current Assets' },
  { type: 'LIABILITY', label: 'Liabilities' },
]

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function NetWorthItemList({ items, onEdit, onDelete }: NetWorthItemListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add your first asset or liability to start tracking your net worth.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {GROUP_CONFIG.map(({ type, label }) => {
        const groupItems = items.filter((i) => i.type === type)
        if (groupItems.length === 0) return null

        const subtotal = groupItems.reduce((sum, i) => sum + i.amount, 0)

        return (
          <section key={type} aria-label={label}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {label}
              </h3>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 tabular-nums">
                {formatAmount(subtotal)}
              </span>
            </div>

            <ul className="space-y-2">
              {groupItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm tabular-nums text-gray-700 dark:text-gray-300">
                      {formatAmount(item.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      aria-label={`Edit ${item.name}`}
                      className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      aria-label={`Delete ${item.name}`}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
