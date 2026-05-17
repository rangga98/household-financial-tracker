'use client'

import { useState } from 'react'
import { AlertTriangle, Calendar, Receipt, TrendingDown } from 'lucide-react'
import { TaxObligationList } from './TaxObligationList'
import { FilingDeadlineList } from './FilingDeadlineList'
import { DeductionList } from './DeductionList'
import type { TaxDashboardData, TaxDeductionRecord } from '@/types/tax-planning'

interface TaxPlanningDashboardProps {
  householdId: string
  data: TaxDashboardData
  currentFiscalYear: number
  deductions: TaxDeductionRecord[]
  isYearLocked: boolean
  onRefresh: () => void
  onFiscalYearChange: (year: number) => void
}

type Tab = 'overview' | 'obligations' | 'deadlines' | 'deductions'

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

interface KpiCardProps {
  label: string
  value: string
  icon: React.ReactNode
  highlight?: boolean
  alert?: boolean
}

function KpiCard({ label, value, icon, highlight, alert }: KpiCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 bg-white dark:bg-gray-900 ${
        alert
          ? 'border-red-300 dark:border-red-700'
          : highlight
          ? 'border-blue-300 dark:border-blue-700'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`${alert ? 'text-red-500' : 'text-blue-500'}`}>{icon}</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className={`text-xl font-bold ${
          alert
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-900 dark:text-gray-100'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'obligations', label: 'Obligations' },
  { id: 'deadlines', label: 'Deadlines' },
  { id: 'deductions', label: 'Deductions' },
]

export function TaxPlanningDashboard({
  householdId,
  data,
  currentFiscalYear,
  deductions,
  isYearLocked,
  onRefresh,
  onFiscalYearChange,
}: TaxPlanningDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  return (
    <div className="space-y-4">
      <nav className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard
              label="Monthly Installment"
              value={formatIDR(data.currentMonthInstallmentTotal)}
              icon={<TrendingDown className="w-4 h-4" />}
              highlight
            />
            <KpiCard
              label="Tax Obligations"
              value={String(data.obligations.length)}
              icon={<Receipt className="w-4 h-4" />}
            />
            <KpiCard
              label="Overdue Obligations"
              value={String(data.overdueObligationCount)}
              icon={<AlertTriangle className="w-4 h-4" />}
              alert={data.overdueObligationCount > 0}
            />
            <KpiCard
              label="Urgent Deadlines"
              value={String(data.urgentDeadlineCount)}
              icon={<Calendar className="w-4 h-4" />}
              alert={data.urgentDeadlineCount > 0}
            />
          </div>

          {data.overdueObligationCount > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-3">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">
                <span className="font-medium">
                  {data.overdueObligationCount} overdue obligation{data.overdueObligationCount > 1 ? 's' : ''}
                </span>{' '}
                — please renew or update the due date.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upcoming Obligations
              </h3>
              {data.obligations.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">No obligations yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {data.obligations.slice(0, 3).map(({ obligation, remainingAmount, isOverdue }) => (
                    <li
                      key={obligation.id}
                      className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <span
                        className={`truncate ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {obligation.name}
                      </span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100 flex-shrink-0">
                        {formatIDR(remainingAmount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upcoming Filings
              </h3>
              {data.filingDeadlines.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">No filing deadlines yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {data.filingDeadlines.slice(0, 3).map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <span className="text-gray-700 dark:text-gray-300 truncate">
                        FY {d.fiscalYear}
                      </span>
                      <span
                        className={`ml-2 font-medium flex-shrink-0 ${
                          d.isUrgent
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {d.daysUntilDeadline >= 0
                          ? `${d.daysUntilDeadline}d left`
                          : 'Overdue'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'obligations' && (
        <TaxObligationList
          obligations={data.obligations}
          householdId={householdId}
          onRefresh={onRefresh}
        />
      )}

      {activeTab === 'deadlines' && (
        <FilingDeadlineList
          deadlines={data.filingDeadlines}
          householdId={householdId}
          onRefresh={onRefresh}
        />
      )}

      {activeTab === 'deductions' && (
        <DeductionList
          deductions={deductions}
          fiscalYear={currentFiscalYear}
          isLocked={isYearLocked}
          householdId={householdId}
          onRefresh={onRefresh}
          onFiscalYearChange={onFiscalYearChange}
        />
      )}
    </div>
  )
}
