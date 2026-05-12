'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface EmergencyFundFormProps {
  goalId: string
  onAdd: (amount: number) => void
  onWithdraw: (amount: number) => void
  isLoading?: boolean
}

export function EmergencyFundForm({ goalId, onAdd, onWithdraw, isLoading }: EmergencyFundFormProps) {
  const [amount, setAmount] = useState('')
  const [action, setAction] = useState<'add' | 'withdraw'>('add')
  const [showWarning, setShowWarning] = useState(false)

  const handleSubmit = () => {
    const value = parseFloat(amount)
    if (!value || value <= 0) return

    if (action === 'withdraw') {
      setShowWarning(true)
    } else {
      onAdd(value)
      setAmount('')
    }
  }

  const handleWithdrawConfirm = () => {
    const value = parseFloat(amount)
    onWithdraw(value)
    setAmount('')
    setShowWarning(false)
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Amount (Rp)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
            Rp
          </span>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-9 pr-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAction('add')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
            action === 'add'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
        <button
          type="button"
          onClick={() => setAction('withdraw')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
            action === 'withdraw'
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Minus className="w-4 h-4" />
          Withdraw
        </button>
      </div>

      <button
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={isLoading || !amount || parseFloat(amount) <= 0 || !goalId}
      >
        {isLoading ? 'Processing...' : action === 'add' ? 'Add to Emergency Fund' : 'Withdraw'}
      </button>

      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Withdraw from Emergency Fund?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This will reduce your emergency reserves. Are you sure you want to withdraw?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowWarning(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawConfirm}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
