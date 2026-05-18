'use client'

import { useState } from 'react'
import { Card, Title, Text } from '@tremor/react'
import { useToast } from '@/components/features/cash-flow/Toast'
import { updateGivingSettingsAction } from '@/app/actions/giving'

interface GivingSettingsFormProps {
  userId: string
  initialSettings?: {
    nama?: string
    namaLengkap?: string
    email?: string
  }
}

export function GivingSettingsForm({ userId, initialSettings }: GivingSettingsFormProps) {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [zakatRate, setZakatRate] = useState('')
  const [donationRate, setDonationRate] = useState('')
  const [compassionFixed, setCompassionFixed] = useState('')
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setFormError('')

    // Client-side validation (FR-010)
    const zr = zakatRate ? parseFloat(zakatRate) : 0
    const dr = donationRate ? parseFloat(donationRate) : 0
    const cf = compassionFixed ? parseFloat(compassionFixed) : 0

    if (zr < 0 || zr > 100) {
      setIsLoading(false)
      return setFormError('Zakat percentage must be between 0 and 100')
    }
    if (dr < 0 || dr > 100) {
      setIsLoading(false)
      return setFormError('Donation percentage must be between 0 and 100')
    }
    if (cf < 0) {
      setIsLoading(false)
      return setFormError('Compassion Fund amount must be greater than or equal to 0')
    }

    const result = await updateGivingSettingsAction(userId, {
      zakatAutoRate: zr,
      donationAutoRate: dr,
      compassionFixedAmount: cf,
    })

    if (result.success) {
      setMessage('Settings saved successfully')
      showToast('Giving settings saved', 'success')
    } else {
      setMessage(result.error || 'Failed to save settings')
      showToast(result.error || 'Failed to save settings', 'error')
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <Title>Giving Settings</Title>
      <Text className="mb-4">Configure your automatic giving allocations</Text>
      
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Zakat Percentage (%)
              </label>
              <button
                type="button"
                onClick={() => setZakatRate('0')}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear
              </button>
            </div>
            <input
              type="number"
              min={0}
              max={100}
              step={0.01}
              placeholder="e.g., 2.5"
              value={zakatRate}
              onChange={(e) => setZakatRate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Set 0 to disable</p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Donation Percentage (%)
              </label>
              <button
                type="button"
                onClick={() => setDonationRate('0')}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear
              </button>
            </div>
            <input
              type="number"
              min={0}
              max={100}
              step={0.01}
              placeholder="e.g., 1.0"
              value={donationRate}
              onChange={(e) => setDonationRate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Set 0 to disable</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Compassion Fund (Rp)
            </label>
            <button
              type="button"
              onClick={() => setCompassionFixed('0')}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear
            </button>
          </div>
          <input
            type="number"
            min={0}
            step={0.01}
            placeholder="e.g., 500000"
            value={compassionFixed}
            onChange={(e) => setCompassionFixed(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Set 0 to disable monthly earmark</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={async () => {
              setZakatRate('0');
              setDonationRate('0');
              setCompassionFixed('0');
              setIsLoading(true);
              const result = await updateGivingSettingsAction(userId, {
                zakatAutoRate: 0,
                donationAutoRate: 0,
                compassionFixedAmount: 0,
              });
              setIsLoading(false);
              if (result.success) {
                setMessage('All allocations cleared (past records unaffected)');
                showToast('All allocations cleared', 'success')
              } else {
                const msg = result.error || 'Failed to clear allocations'
                setFormError(msg)
                showToast(msg, 'error')
              }
            }}
            className="whitespace-nowrap px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Clear all allocations
          </button>
        </div>

        {formError && (
          <Text className="text-center text-red-600">{formError}</Text>
        )}
        {message && (
          <Text className={`text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </Text>
        )}
      </form>
    </Card>
  )
}
