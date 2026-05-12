'use client'

import { useState } from 'react'
import { computeFutureValue } from '@/lib/utils/sinking-funds'

interface EducationCalculatorProps {
  onCreateFund: (prefillAmount: number) => void
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function EducationCalculator({ onCreateFund }: EducationCalculatorProps) {
  const [formData, setFormData] = useState({
    currentCost: '',
    inflationRate: '5',
    years: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<number | null>(null)

  function validate(): boolean {
    const next: Record<string, string> = {}
    const cost = Number(formData.currentCost)
    if (!formData.currentCost || isNaN(cost) || cost <= 0) {
      next.currentCost = 'Current cost is required and must be greater than zero'
    }
    const years = Number(formData.years)
    if (!formData.years || isNaN(years) || years < 1) {
      next.years = 'Must be at least 1 year'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setResult(null)
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const fv = computeFutureValue(
      Number(formData.currentCost),
      Number(formData.inflationRate) / 100,
      Number(formData.years)
    )
    setResult(fv)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ec-cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current Cost (Rp)
          </label>
          <input
            id="ec-cost"
            name="currentCost"
            type="number"
            placeholder="e.g. 50000000"
            value={formData.currentCost}
            onChange={(e) => handleChange('currentCost', e.target.value)}
            className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.currentCost ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.currentCost && <p className="mt-1 text-xs text-red-600">{errors.currentCost}</p>}
        </div>

        <div>
          <label htmlFor="ec-inflation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Inflation Rate (%)
          </label>
          <input
            id="ec-inflation"
            name="inflationRate"
            type="number"
            placeholder="e.g. 5"
            value={formData.inflationRate}
            onChange={(e) => handleChange('inflationRate', e.target.value)}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="ec-years" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Years Until Needed
          </label>
          <input
            id="ec-years"
            name="years"
            type="number"
            placeholder="e.g. 10"
            value={formData.years}
            onChange={(e) => handleChange('years', e.target.value)}
            className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.years ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.years && <p className="mt-1 text-xs text-red-600">{errors.years}</p>}
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Calculate
        </button>
      </form>

      {result !== null && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estimated Future Cost</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatIDR(result)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {formatIDR(Number(formData.currentCost))} today × (1 + {formData.inflationRate}%)^{formData.years} years
          </p>
          <button
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => onCreateFund(result)}
          >
            Create Fund
          </button>
        </div>
      )}
    </div>
  )
}
