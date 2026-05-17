'use client'

import { useState, useTransition } from 'react'
import { createInsurancePolicy, updateInsurancePolicy } from '@/app/actions/risk-management'
import type { InsurancePolicy } from '@/types/risk-management'

interface PolicyFormProps {
  mode: 'create' | 'edit'
  householdId?: string
  initialValues?: Partial<InsurancePolicy>
  onSuccess: (policy: InsurancePolicy) => void
  onCancel: () => void
}

const INPUT_CLASS =
  'block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
const ERROR_INPUT_CLASS =
  'block w-full rounded-lg border border-red-500 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors'
const LABEL_CLASS = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

export function PolicyForm({
  mode,
  householdId = '',
  initialValues,
  onSuccess,
  onCancel,
}: PolicyFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    name: initialValues?.name ?? '',
    insuranceType: initialValues?.insuranceType ?? 'life',
    insurer: initialValues?.insurer ?? '',
    coverageAmount: initialValues?.coverageAmount != null ? String(initialValues.coverageAmount) : '',
    premiumAmount: initialValues?.premiumAmount != null ? String(initialValues.premiumAmount) : '',
    paymentFrequency: initialValues?.paymentFrequency ?? 'annual',
    startDate: initialValues?.startDate ?? '',
    nextDueDate: initialValues?.nextDueDate ?? '',
    notes: initialValues?.notes ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const isOneTime = formData.paymentFrequency === 'one-time'

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!formData.name.trim()) next.name = 'Policy name is required'
    if (!formData.insurer.trim()) next.insurer = 'Insurer name is required'
    const coverage = Number(formData.coverageAmount)
    if (isNaN(coverage) || coverage < 0) next.coverageAmount = 'Coverage amount must be 0 or more'
    const premium = Number(formData.premiumAmount)
    if (!formData.premiumAmount || isNaN(premium) || premium <= 0)
      next.premiumAmount = 'Premium amount must be greater than zero'
    if (!formData.startDate) next.startDate = 'Start date is required'
    if (!isOneTime && !formData.nextDueDate) next.nextDueDate = 'Next due date is required'
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
        insuranceType: formData.insuranceType as InsurancePolicy['insuranceType'],
        insurer: formData.insurer.trim(),
        coverageAmount: Number(formData.coverageAmount),
        premiumAmount: Number(formData.premiumAmount),
        paymentFrequency: formData.paymentFrequency as InsurancePolicy['paymentFrequency'],
        startDate: formData.startDate,
        nextDueDate: isOneTime ? null : formData.nextDueDate || null,
        notes: formData.notes?.trim() || null,
      }

      let result
      if (mode === 'edit' && initialValues?.id) {
        result = await updateInsurancePolicy(initialValues.id, payload)
      } else {
        result = await createInsurancePolicy({ ...payload, householdId })
      }

      if (result.success) {
        onSuccess(result.data)
      } else {
        setServerError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="pol-name" className={LABEL_CLASS}>Policy Name</label>
        <input
          id="pol-name"
          type="text"
          placeholder="e.g. Jiwa AIA, BPJS Ketenagakerjaan"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={errors.name ? ERROR_INPUT_CLASS : INPUT_CLASS}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pol-type" className={LABEL_CLASS}>Type</label>
          <select
            id="pol-type"
            value={formData.insuranceType}
            onChange={(e) => handleChange('insuranceType', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="life">Life</option>
            <option value="health">Health</option>
            <option value="property">Property</option>
            <option value="vehicle">Vehicle</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="pol-insurer" className={LABEL_CLASS}>Insurer</label>
          <input
            id="pol-insurer"
            type="text"
            placeholder="e.g. AIA, Prudential"
            value={formData.insurer}
            onChange={(e) => handleChange('insurer', e.target.value)}
            className={errors.insurer ? ERROR_INPUT_CLASS : INPUT_CLASS}
          />
          {errors.insurer && <p className="mt-1 text-xs text-red-600">{errors.insurer}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="pol-coverage" className={LABEL_CLASS}>Coverage Amount (Rp)</label>
        <input
          id="pol-coverage"
          type="number"
          placeholder="e.g. 1000000000"
          min="0"
          value={formData.coverageAmount}
          onChange={(e) => handleChange('coverageAmount', e.target.value)}
          className={errors.coverageAmount ? ERROR_INPUT_CLASS : INPUT_CLASS}
        />
        {errors.coverageAmount && <p className="mt-1 text-xs text-red-600">{errors.coverageAmount}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pol-premium" className={LABEL_CLASS}>Premium Amount (Rp)</label>
          <input
            id="pol-premium"
            type="number"
            placeholder="e.g. 2000000"
            min="1"
            value={formData.premiumAmount}
            onChange={(e) => handleChange('premiumAmount', e.target.value)}
            className={errors.premiumAmount ? ERROR_INPUT_CLASS : INPUT_CLASS}
          />
          {errors.premiumAmount && <p className="mt-1 text-xs text-red-600">{errors.premiumAmount}</p>}
        </div>
        <div>
          <label htmlFor="pol-freq" className={LABEL_CLASS}>Payment Frequency</label>
          <select
            id="pol-freq"
            value={formData.paymentFrequency}
            onChange={(e) => handleChange('paymentFrequency', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="semi-annual">Semi-annual</option>
            <option value="annual">Annual</option>
            <option value="one-time">One-time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pol-start" className={LABEL_CLASS}>Start Date</label>
          <input
            id="pol-start"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className={errors.startDate ? ERROR_INPUT_CLASS : INPUT_CLASS}
          />
          {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>}
        </div>
        <div>
          <label htmlFor="pol-due" className={LABEL_CLASS}>
            Next Due Date {isOneTime && <span className="text-gray-400">(N/A)</span>}
          </label>
          <input
            id="pol-due"
            type="date"
            value={isOneTime ? '' : formData.nextDueDate}
            onChange={(e) => handleChange('nextDueDate', e.target.value)}
            disabled={isOneTime}
            className={`${errors.nextDueDate ? ERROR_INPUT_CLASS : INPUT_CLASS} disabled:opacity-40 disabled:cursor-not-allowed`}
          />
          {errors.nextDueDate && <p className="mt-1 text-xs text-red-600">{errors.nextDueDate}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="pol-notes" className={LABEL_CLASS}>Notes (optional)</label>
        <textarea
          id="pol-notes"
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
          {isPending ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Policy'}
        </button>
      </div>
    </form>
  )
}
