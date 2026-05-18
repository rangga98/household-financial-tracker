'use client'

import { useState } from 'react'
import { Text } from '@tremor/react'
import { ZakatMaalForm } from './ZakatMaalForm'
import { ZakatFitrahForm } from './ZakatFitrahForm'

export function ZakatCalculator() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="mt-2">
      <Text className="mb-4 text-gray-600 dark:text-gray-400">
        Choose calculator type below and enter values to compute your obligation.
      </Text>

      {/* Segmented tabs */}
      <div className="inline-flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab(0)}
          className={`px-4 py-2 text-sm font-medium transition-colors min-w-[120px] ${
            activeTab === 0
              ? 'bg-blue-600 text-white'
              : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Zakat Maal
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(1)}
          className={`px-4 py-2 text-sm font-medium transition-colors min-w-[120px] border-l border-gray-200 dark:border-gray-800 ${
            activeTab === 1
              ? 'bg-blue-600 text-white'
              : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Zakat Fitrah
        </button>
      </div>

      {activeTab === 0 ? <ZakatMaalForm /> : <ZakatFitrahForm />}
    </div>
  )
}
