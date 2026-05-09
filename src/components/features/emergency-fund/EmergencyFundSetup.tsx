'use client'

import { useState } from 'react'
import { Card, Button } from '@tremor/react'
import type { MaritalStatus, EmergencyFundSetupInput } from '@/types/emergency-fund'
import { calculateEmergencyFundTarget, formatCurrency } from '@/lib/utils/emergency-fund'
import { User, Users, Heart, Baby } from 'lucide-react'

interface EmergencyFundSetupProps {
  onSubmit: (input: EmergencyFundSetupInput) => void
  isLoading?: boolean
}

export function EmergencyFundSetup({ onSubmit, isLoading }: EmergencyFundSetupProps) {
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('single')
  const [dependents, setDependents] = useState(0)
  const [monthlyExpense, setMonthlyExpense] = useState('')

  const calculatedTarget = monthlyExpense
    ? calculateEmergencyFundTarget(maritalStatus, dependents, parseFloat(monthlyExpense) || 0)
    : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!monthlyExpense || parseFloat(monthlyExpense) <= 0) return

    onSubmit({
      maritalStatus,
      dependents,
      monthlyLivingExpenseEstimate: parseFloat(monthlyExpense),
    })
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Setup Emergency Fund Target</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Let's calculate your emergency fund target based on your household situation.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Marital Status - Visual Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">What is your marital status?</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMaritalStatus('single')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                maritalStatus === 'single'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <User className={`w-8 h-8 ${maritalStatus === 'single' ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${maritalStatus === 'single' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                Single
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMaritalStatus('married')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                maritalStatus === 'married'
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <Heart className={`w-8 h-8 ${maritalStatus === 'married' ? 'text-pink-500' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${maritalStatus === 'married' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-400'}`}>
                Married
              </span>
            </button>
          </div>
        </div>

        {/* Dependents - Visual Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">How many dependents do you have?</label>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setDependents(num)}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                  dependents === num
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                {num === 0 ? (
                  <Users className={`w-6 h-6 ${dependents === num ? 'text-green-500' : 'text-gray-400'}`} />
                ) : (
                  <Baby className={`w-6 h-6 ${dependents === num ? 'text-green-500' : 'text-gray-400'}`} />
                )}
                <span className={`text-sm font-medium ${dependents === num ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {num === 0 ? 'None' : num === 3 ? '3+' : num}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Expense - Input with formatting */}
        <div className="space-y-3">
          <label className="block text-base font-semibold text-gray-900 dark:text-white">
            Monthly Expenses
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-xl font-bold text-gray-400">Rp</span>
            </div>
            <input
              type="text"
              placeholder="5.000.000"
              value={monthlyExpense}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, '')
                setMonthlyExpense(value)
              }}
              className="w-full pl-14 pr-4 py-4 text-2xl font-bold bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-300"
            />
          </div>
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <span className="text-amber-500 mt-0.5">💡</span>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              This is a static estimate you set yourself. It won't change with your actual spending - no more moving targets!
            </p>
          </div>
        </div>

        {/* Calculated Target Preview */}
        {calculatedTarget > 0 && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10"></div>
            <div className="relative p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Your Target
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  maritalStatus === 'married' && dependents > 0
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                }`}>
                  {maritalStatus === 'married' && dependents > 0 ? '12×' : '6×'} multiplier
                </span>
              </div>
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                {formatCurrency(calculatedTarget)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {maritalStatus === 'married' && dependents > 0
                  ? 'Higher target recommended for families with children'
                  : 'Standard 6-month emergency fund'}
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !monthlyExpense || parseFloat(monthlyExpense) <= 0}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:shadow-none"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Setting up...
            </span>
          ) : (
            '🚀 Set Emergency Fund Target'
          )}
        </button>
      </form>
    </Card>
  )
}
