'use client'

import { useState } from 'react'
import { Card, Title, Text } from '@tremor/react'
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
  const [nama, setNama] = useState(initialSettings?.nama || '')
  const [namaLengkap, setNamaLengkap] = useState(initialSettings?.namaLengkap || '')
  const [email, setEmail] = useState(initialSettings?.email || '')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const result = await updateGivingSettingsAction(userId, {
      nama,
      namaLengkap,
      email,
    })

    if (result.success) {
      setMessage('Settings saved successfully')
    } else {
      setMessage(result.error || 'Failed to save settings')
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <Title>Giving Settings</Title>
      <Text className="mb-4">Configure your automatic giving allocations</Text>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Display Name
          </label>
          <input
            placeholder="Your name"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Full Name
          </label>
          <input
            placeholder="Your full name"
            value={namaLengkap}
            onChange={(e) => setNamaLengkap(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>

        {message && (
          <Text className={`text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </Text>
        )}
      </form>
    </Card>
  )
}
