'use client'

import { formatCompactRp } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import type { Transaction } from '@/types'

interface TransactionListProps {
  transactions: Transaction[]
  showUser?: boolean
  categoryTypeFilter?: 'fixed' | 'variable' | null
}

export function TransactionList({ 
  transactions, 
  showUser = false,
  categoryTypeFilter = null 
}: TransactionListProps) {
  const filteredTransactions = categoryTypeFilter
    ? transactions.filter((t) => t.category?.type === categoryTypeFilter)
    : transactions

  if (filteredTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No transactions yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {filteredTransactions.map((transaction) => (
        <div
          key={transaction.id}
          className={cn(
            'flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700',
            transaction.isScheduled && 'opacity-50 italic'
          )}
        >
          <div className="flex items-center gap-3">
            {transaction.type === 'income' ? (
              <ArrowUpCircle className="w-10 h-10 text-emerald-500" />
            ) : (
              <ArrowDownCircle className="w-10 h-10 text-red-500" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {transaction.category?.name || 'Unknown'}
                </p>
                {transaction.category?.type && (
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    transaction.category.type === 'fixed' 
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  )}>
                    {transaction.category.type === 'fixed' ? 'Fixed' : 'Variable'}
                  </span>
                )}
              </div>
              {transaction.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {transaction.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{new Date(transaction.transactionDate).toLocaleDateString('id-ID')}</span>
                {showUser && transaction.user && (
                  <span className="text-blue-500">{transaction.user.name}</span>
                )}
              </div>
            </div>
          </div>
          <div className={cn(
            'font-semibold tabular-nums',
            transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
          )}>
            {transaction.type === 'income' ? '+' : '-'}
            {formatCompactRp(transaction.amount)}
          </div>
        </div>
      ))}
    </div>
  )
}
