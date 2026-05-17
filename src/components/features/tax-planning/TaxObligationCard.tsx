'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Edit2, Trash2, RefreshCw } from 'lucide-react'
import { InstallmentScheduleTable } from './InstallmentScheduleTable'
import type { TaxObligationWithSchedule, TaxObligation } from '@/types/tax-planning'

interface TaxObligationCardProps {
  data: TaxObligationWithSchedule
  onEdit: (obligation: TaxObligation) => void
  onDelete: (id: string) => void
  onRenew: (id: string) => void
}

const TAX_TYPE_LABELS: Record<string, string> = {
  vehicle_registration: 'Vehicle (STNK)',
  property_tax: 'Property Tax (PBB)',
  custom: 'Custom',
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function TaxObligationCard({ data, onEdit, onDelete, onRenew }: TaxObligationCardProps) {
  const [showSchedule, setShowSchedule] = useState(false)
  const { obligation, remainingAmount, monthlyInstallment, installmentSchedule, isOverdue } = data

  return (
    <div
      className={`rounded-xl border bg-white dark:bg-gray-900 shadow-sm transition-shadow hover:shadow-md ${
        isOverdue
          ? 'border-red-300 dark:border-red-700'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {obligation.name}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {TAX_TYPE_LABELS[obligation.taxType] ?? obligation.taxType}
              </span>
              {isOverdue && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                  Overdue
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Due: {obligation.targetDate} · Total: {formatIDR(obligation.targetAmount)}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Remaining: {formatIDR(remainingAmount)} · Monthly: {formatIDR(monthlyInstallment)}
            </p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {isOverdue && (
              <button
                type="button"
                onClick={() => onRenew(obligation.id)}
                className="inline-flex items-center gap-1 min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                aria-label="Renew obligation"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Renew</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(obligation)}
              className="inline-flex items-center gap-1 min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Edit obligation"
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(obligation.id)}
              className="inline-flex items-center gap-1 min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Delete obligation"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowSchedule((v) => !v)}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline min-h-[44px]"
            aria-label={showSchedule ? 'Hide schedule' : 'View schedule'}
          >
            {showSchedule ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showSchedule ? 'Hide installment schedule' : 'View schedule'}
          </button>
        </div>
      </div>

      {showSchedule && (
        <div className="px-4 pb-4">
          <InstallmentScheduleTable
            installments={installmentSchedule}
            monthlyInstallment={monthlyInstallment}
          />
        </div>
      )}
    </div>
  )
}
