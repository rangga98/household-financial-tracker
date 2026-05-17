'use client'

import { useState, useTransition } from 'react'
import { createTaxObligation, updateTaxObligation } from '@/app/actions/tax-planning'
import type { TaxObligationType } from '@/types/tax-planning'

interface TaxObligationFormProps {
  mode: 'create' | 'edit'
  householdId: string
  obligationId?: string
  initialValues?: {
    name: string
    taxType: TaxObligationType
    targetAmount: number
    targetDate: string
    notes: string | null
  }
  onSuccess: () => void
  onCancel: () => void
}

const INPUT_CLASS =
  'block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
const ERROR_INPUT_CLASS =
  'block w-full rounded-lg border border-red-500 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors'
const LABEL_CLASS = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

export function TaxObligationForm({
  mode,
  householdId,
  obligationId,
  initialValues,
  onSuccess,
  onCancel,
}: TaxObligationFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    name: initialValues?.name ?? '',
    taxType: initialValues?.taxType ?? ('vehicle_registration' as TaxObligationType),
    targetAmount: initialValues?.targetAmount != null ? String(initialValues.targetAmount) : '',
    targetDate: initialValues?.targetDate ?? '',
    notes: initialValues?.notes ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!formData.name.trim()) next.name = 'Obligation name is required'
    const amount = Number(formData.targetAmount)
    if (!formData.targetAmount || isNaN(amount) || amount <= 0)
      next.targetAmount = 'Total amount must be greater than zero'
    if (!formData.targetDate) next.targetDate = 'Annual due date is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    if (!validate()) return

    startTransition(async () => {
      const payload = {
        name: formData.name.trim(),
        taxType: formData.taxType,
        targetAmount: Number(formData.targetAmount),
        targetDate: formData.targetDate,
        notes: formData.notes.trim() || null,
      }

      let result
      if (mode === 'edit' && obligationId) {
        result = await updateTaxObligation(obligationId, payload)
      } else {
        result = await createTaxObligation({ ...payload, householdId })
      }

      if (result.success) {
        onSuccess()
      } else {
        setServerError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="tax-name" className={LABEL_CLASS}>Name</label>
        <input
          id="tax-name"
          type="text"
          placeholder="e.g. Honda Beat B 1234 XY, Rumah Depok"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={errors.name ? ERROR_INPUT_CLASS : INPUT_CLASS}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="tax-type" className={LABEL_CLASS}>Tax Type</label>
        <select
          id="tax-type"
          value={formData.taxType}
          onChange={(e) => handleChange('taxType', e.target.value)}
          className={INPUT_CLASS}
        >
          <option value="vehicle_registration">Vehicle Registration (STNK)</option>
          <option value="property_tax">Property Tax (PBB)</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div>
        <label htmlFor="tax-amount" className={LABEL_CLASS}>Total Amount (Rp)</label>
        <input
          id="tax-amount"
          type="number"
          placeholder="e.g. 1200000"
          value={formData.targetAmount}
          onChange={(e) => handleChange('targetAmount', e.target.value)}
          className={errors.targetAmount ? ERROR_INPUT_CLASS : INPUT_CLASS}
        />
        {errors.targetAmount && <p className="mt-1 text-xs text-red-600">{errors.targetAmount}</p>}
      </div>

      <div>
        <label htmlFor="tax-date" className={LABEL_CLASS}>Annual Due Date</label>
        <input
          id="tax-date"
          type="date"
          value={formData.targetDate}
          onChange={(e) => handleChange('targetDate', e.target.value)}
          className={errors.targetDate ? ERROR_INPUT_CLASS : INPUT_CLASS}
        />
        {errors.targetDate && <p className="mt-1 text-xs text-red-600">{errors.targetDate}</p>}
      </div>

      <div>
        <label htmlFor="tax-notes" className={LABEL_CLASS}>Notes (optional)</label>
        <textarea
          id="tax-notes"
          placeholder="Any additional notes..."
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={2}
          className={INPUT_CLASS + ' resize-y'}
        />
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {isPending ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Obligation'}
        </button>
      </div>
    </form>
  )
}
