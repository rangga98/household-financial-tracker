'use client'

import { useTransition } from 'react'
import { X } from 'lucide-react'
import { unflagTransactionAsDeductible } from '@/app/actions/tax-planning'
import type { TaxDeductionRecord } from '@/types/tax-planning'

interface DeductionListProps {
  deductions: TaxDeductionRecord[]
  fiscalYear: number
  isLocked: boolean
  householdId: string
  onRefresh: () => void
  onFiscalYearChange: (year: number) => void
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function buildCategoryTotals(
  deductions: TaxDeductionRecord[]
): Array<{ categoryName: string; total: number }> {
  const map = new Map<string, number>()
  for (const r of deductions) {
    map.set(r.categoryName, (map.get(r.categoryName) ?? 0) + r.amount)
  }
  return Array.from(map.entries())
    .map(([categoryName, total]) => ({ categoryName, total }))
    .sort((a, b) => b.total - a.total)
}

export function DeductionList({
  deductions,
  fiscalYear,
  isLocked,
  householdId,
  onRefresh,
  onFiscalYearChange,
}: DeductionListProps) {
  const [, startTransition] = useTransition()

  function handleUnflag(transactionId: string) {
    startTransition(async () => {
      await unflagTransactionAsDeductible(transactionId, householdId, fiscalYear)
      onRefresh()
    })
  }

  const grandTotal = deductions.reduce((sum, r) => sum + r.amount, 0)
  const categoryTotals = buildCategoryTotals(deductions)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Tax Deductions
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="deduction-year" className="text-sm text-gray-500 dark:text-gray-400">
            Year:
          </label>
          <input
            id="deduction-year"
            type="number"
            value={fiscalYear}
            onChange={(e) => onFiscalYearChange(Number(e.target.value))}
            className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLocked && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-3 text-sm text-amber-700 dark:text-amber-300">
          This fiscal year is archived. Unarchive the filing deadline to make changes.
        </div>
      )}

      {deductions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No deduction records for {fiscalYear}.</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Flag transactions as tax deductible from the Transactions page.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {deductions.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {record.description ?? '(No description)'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {record.categoryName} · {record.transactionDate}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatIDR(record.amount)}
                  </span>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleUnflag(record.id)}
                    className="inline-flex items-center min-h-[44px] min-w-[44px] justify-center p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Remove deductible flag"
                    title="Unflag as deductible"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total by Category
            </h3>
            {categoryTotals.map(({ categoryName, total }) => (
              <div key={categoryName} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{categoryName}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatIDR(total)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm font-semibold">
              <span className="text-gray-900 dark:text-gray-100">Total Deductions {fiscalYear}</span>
              <span className="text-blue-600 dark:text-blue-400">{formatIDR(grandTotal)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
