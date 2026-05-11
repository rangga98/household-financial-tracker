'use client'

import { useState, useTransition } from 'react'
import { Button, TextInput, Text } from '@tremor/react'
import { updateFIProfile } from '@/app/actions/financial-freedom'
import type { FIProfile } from '@/types/financial-freedom'
import { Sparkles, TrendingUp, Shield, Zap } from 'lucide-react'

interface FIInputFormProps {
  profile: FIProfile
  suggestedAnnualExpenses?: number | null
  onUpdate: (updatedProfile: FIProfile) => void
}

const RETURN_PRESETS = [
  { label: 'Conservative', value: 5, icon: Shield, description: 'Bonds, savings accounts' },
  { label: 'Moderate', value: 7, icon: TrendingUp, description: 'Index funds, diversified portfolio' },
  { label: 'Aggressive', value: 10, icon: Zap, description: 'Growth stocks, higher risk' },
]

export function FIInputForm({
  profile,
  suggestedAnnualExpenses,
  onUpdate,
}: FIInputFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    fiAnnualExpenses: profile.fiAnnualExpenses ?? suggestedAnnualExpenses ?? '',
    fiSavingsRate: profile.fiSavingsRate ? (profile.fiSavingsRate * 100).toFixed(0) : '',
    fiCurrentAge: profile.fiCurrentAge ?? '',
    fiCurrentNetWorth: profile.fiCurrentNetWorth ?? '',
    fiExpectedReturn: profile.fiExpectedReturn ? (profile.fiExpectedReturn * 100).toFixed(1) : '7.0',
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const annualExpenses = formData.fiAnnualExpenses ? Number(formData.fiAnnualExpenses) : null
    const savingsRate = formData.fiSavingsRate ? Number(formData.fiSavingsRate) / 100 : null
    const currentAge = formData.fiCurrentAge ? Number(formData.fiCurrentAge) : null
    const currentNetWorth = formData.fiCurrentNetWorth ? Number(formData.fiCurrentNetWorth) : null
    const expectedReturn = formData.fiExpectedReturn ? Number(formData.fiExpectedReturn) / 100 : null

    startTransition(async () => {
      const result = await updateFIProfile(profile.id, {
        fiAnnualExpenses: annualExpenses,
        fiSavingsRate: savingsRate,
        fiCurrentAge: currentAge,
        fiCurrentNetWorth: currentNetWorth,
        fiExpectedReturn: expectedReturn,
      })

      if (result.success) {
        onUpdate(result.profile)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Annual Expenses (Rp)
        </label>
        <TextInput
          type="number"
          value={String(formData.fiAnnualExpenses)}
          onChange={(e) => setFormData({ ...formData, fiAnnualExpenses: e.target.value })}
          placeholder={suggestedAnnualExpenses?.toString() || 'e.g., 40000000'}
          disabled={isPending}
        />
        {suggestedAnnualExpenses && !profile.fiAnnualExpenses && (
          <button
            type="button"
            onClick={() => setFormData({ ...formData, fiAnnualExpenses: String(suggestedAnnualExpenses) })}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Use suggested: Rp {suggestedAnnualExpenses.toLocaleString()}
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Savings Rate (%)
        </label>
        <TextInput
          type="number"
          value={String(formData.fiSavingsRate)}
          onChange={(e) => setFormData({ ...formData, fiSavingsRate: e.target.value })}
          placeholder="e.g., 50"
          min="0"
          max="100"
          disabled={isPending}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Current Age
        </label>
        <TextInput
          type="number"
          value={String(formData.fiCurrentAge)}
          onChange={(e) => setFormData({ ...formData, fiCurrentAge: e.target.value })}
          placeholder="e.g., 30"
          min="0"
          disabled={isPending}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Current Net Worth (Rp)
        </label>
        <TextInput
          type="number"
          value={String(formData.fiCurrentNetWorth)}
          onChange={(e) => setFormData({ ...formData, fiCurrentNetWorth: e.target.value })}
          placeholder="e.g., 100000000"
          min="0"
          disabled={isPending}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Expected Return (%)
        </label>
        <TextInput
          type="number"
          value={String(formData.fiExpectedReturn)}
          onChange={(e) => setFormData({ ...formData, fiExpectedReturn: e.target.value })}
          placeholder="e.g., 7.0"
          min="0"
          max="100"
          step="0.1"
          disabled={isPending}
        />
        {/* Return Presets */}
        <div className="mt-2 grid grid-cols-3 gap-2">
          {RETURN_PRESETS.map((preset) => {
            const Icon = preset.icon
            const isSelected = Math.abs(Number(formData.fiExpectedReturn) - preset.value) < 0.1
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => setFormData({ ...formData, fiExpectedReturn: String(preset.value) })}
                disabled={isPending}
                className={`p-2 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className={`w-4 h-4 mx-auto mb-1 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                <p className={`text-xs font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                  {preset.value}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {preset.label}
                </p>
              </button>
            )
          })}
        </div>
        <Text className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Higher returns = faster FI, but more risk
        </Text>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <Button
        type="submit"
        color="blue"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  )
}
