'use client'

import { useState } from 'react'
import { Button, TextInput } from '@tremor/react'
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
      <TextInput
        type="number"
        placeholder="Amount"
        prefix="Rp "
        value={amount}
        onValueChange={setAmount}
      />

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

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={isLoading || !amount || parseFloat(amount) <= 0 || !goalId}
      >
        {isLoading ? 'Processing...' : action === 'add' ? 'Add to Emergency Fund' : 'Withdraw'}
      </Button>

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
