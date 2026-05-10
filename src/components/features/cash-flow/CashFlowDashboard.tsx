'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Minus } from 'lucide-react'
import { useCashFlowStore } from '@/hooks/useCashFlow'
import { getSupabaseClient } from '@/lib/supabase/client'
import { createTransaction } from '@/lib/supabase/actions/transactions'
import { getTransactions } from '@/lib/supabase/queries/transactions'
import { getCategories } from '@/lib/supabase/queries/categories'
import { getProfiles } from '@/lib/supabase/queries/profiles'
import { getBalance } from '@/lib/supabase/queries/balance'
import { TransactionForm } from './TransactionForm'
import { TransactionList } from './TransactionList'
import { BalanceDisplay } from './BalanceDisplay'
import { UserSwitcher } from './UserSwitcher'
import { SpendingBreakdown } from './SpendingBreakdown'
import { useToast } from './Toast'
import type { TransactionInput } from '@/types'

// TODO: Replace with actual household ID from Supabase
const DEMO_HOUSEHOLD_ID = '963a25fc-553a-48b2-9439-d093984015f2'

export function CashFlowDashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [isLoading, setIsLoading] = useState(true)
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<'fixed' | 'variable' | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)

  const { showToast } = useToast()
  
  const {
    currentUserId,
    users,
    transactions,
    categories,
    balance,
    setUsers,
    setTransactions,
    setCategories,
    setBalance,
    setCurrentUser,
    addTransaction,
  } = useCashFlowStore()

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Load profiles
      const profiles = await getProfiles(DEMO_HOUSEHOLD_ID)
      setUsers(profiles)
      
      // Load categories
      const cats = await getCategories(DEMO_HOUSEHOLD_ID)
      setCategories(cats)
      
      // Load transactions
      const txs = await getTransactions(DEMO_HOUSEHOLD_ID, { limit: 50 })
      setTransactions(txs)
      
      // Load balance (with optional date filter)
      const bal = await getBalance(DEMO_HOUSEHOLD_ID, selectedDate)
      setBalance(bal)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [setUsers, setCategories, setTransactions, setBalance, setCurrentUser, selectedDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Reload balance when date changes
  useEffect(() => {
    const fetchBalance = async () => {
      const bal = await getBalance(DEMO_HOUSEHOLD_ID, selectedDate)
      setBalance(bal)
    }
    fetchBalance()
  }, [selectedDate, setBalance])

  // Real-time subscription for balance updates
  useEffect(() => {
    const supabase = getSupabaseClient()
    
    const channel = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `household_id=eq.${DEMO_HOUSEHOLD_ID}`,
        },
        async () => {
          // Refresh balance on any transaction change
          const bal = await getBalance(DEMO_HOUSEHOLD_ID)
          setBalance(bal)
          
          // Also refresh transactions
          const txs = await getTransactions(DEMO_HOUSEHOLD_ID, { limit: 50 })
          setTransactions(txs)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [setBalance, setTransactions])

  const handleSubmit = async (data: TransactionInput) => {
    if (!currentUserId) {
      showToast('Please select a user first', 'error')
      return
    }

    try {
      const transaction = await createTransaction({
        ...data,
        householdId: DEMO_HOUSEHOLD_ID,
        userId: currentUserId,
      })
      
      addTransaction(transaction)
      
      // Refresh balance
      const bal = await getBalance(DEMO_HOUSEHOLD_ID)
      setBalance(bal)
      
      showToast('Transaction saved successfully', 'success')
      setIsFormOpen(false)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save transaction', 'error')
      throw error
    }
  }

  const handleAddIncome = () => {
    setTransactionType('income')
    setIsFormOpen(true)
  }

  const handleAddExpense = () => {
    setTransactionType('expense')
    setIsFormOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white shrink-0">
            Cash Flow
          </h1>
          <div className="flex items-center gap-2">
            <UserSwitcher
              users={users}
              currentUserId={currentUserId || ''}
              onSwitch={setCurrentUser}
            />
          </div>
        </div>

        {/* Balance */}
        <BalanceDisplay 
          balance={balance} 
          isLoading={isLoading}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Quick Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAddIncome}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Income
          </button>
          <button
            onClick={handleAddExpense}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
          >
            <Minus className="w-5 h-5" />
            Expense
          </button>
        </div>

        {/* Transaction Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-2xl sm:rounded-xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add {transactionType === 'income' ? 'Income' : 'Expense'}
                </h2>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              
              <TransactionForm
                categories={categories}
                onSubmit={handleSubmit}
                currentUserId={currentUserId || ''}
              />
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setCategoryTypeFilter(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryTypeFilter === null
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setCategoryTypeFilter('fixed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryTypeFilter === 'fixed'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            Fixed
          </button>
          <button
            onClick={() => setCategoryTypeFilter('variable')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryTypeFilter === 'variable'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            Variable
          </button>
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Transactions
          </h2>
          <div className="max-h-[400px] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <TransactionList 
              transactions={transactions} 
              showUser={users.length > 1}
              categoryTypeFilter={categoryTypeFilter}
            />
          </div>
        </div>

        {/* Spending Breakdown */}
        <SpendingBreakdown transactions={transactions} />
      </div>
    </div>
  )
}
