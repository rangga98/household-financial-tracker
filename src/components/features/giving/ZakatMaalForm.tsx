'use client'

import { useState } from 'react'
import { Card, Title, Text, Metric, Badge } from '@tremor/react'
import { calculateZakatMaal } from '@/lib/utils/zakat-maal'
import { formatRupiah } from '@/lib/utils/zakat-maal'
import { AlertCircle, Info } from 'lucide-react'

export function ZakatMaalForm() {
  const [nisabEligibleAssets, setNisabEligibleAssets] = useState('')
  const [nisabThreshold, setNisabThreshold] = useState('')
  const [result, setResult] = useState<ReturnType<typeof calculateZakatMaal> | null>(null)
  const [error, setError] = useState('')

  const handleCalculate = () => {
    setError('')
    
    const assets = parseFloat(nisabEligibleAssets)
    const threshold = parseFloat(nisabThreshold)
    
    if (isNaN(assets) || assets < 0) {
      setError('Please enter a valid asset amount')
      return
    }
    
    if (isNaN(threshold) || threshold < 0) {
      setError('Please enter a valid nisab threshold')
      return
    }
    
    const calcResult = calculateZakatMaal({
      nisabEligibleAssets: assets,
      nisabThreshold: threshold,
    })
    
    setResult(calcResult)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Total Nisab-Eligible Assets (Rp)
        </label>
        <input
          type="number"
          placeholder="e.g., 100000000"
          value={nisabEligibleAssets}
          onChange={(e) => setNisabEligibleAssets(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base tabular-nums"
        />
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Total savings and assets that meet nisab threshold
        </Text>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Nisab Threshold (Rp)
        </label>
        <input
          type="number"
          placeholder="e.g., 85000000"
          value={nisabThreshold}
          onChange={(e) => setNisabThreshold(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base tabular-nums"
        />
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Current nisab threshold (≈ 85g gold in IDR)
        </Text>
      </div>
      
      <button
        type="button"
        onClick={handleCalculate}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        Calculate Zakat Maal
      </button>
      
      {error && (
        <Card className="mt-4 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <Text className="font-medium">Validation Error</Text>
          </div>
          <Text className="mt-2">{error}</Text>
        </Card>
      )}
      
      {result && (
        <Card className="mt-4">
          {result.isDue ? (
            <>
              <Text>Zakat Obligation</Text>
              <Metric className="text-emerald-600">{formatRupiah(result.amount)}</Metric>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Nisab-Eligible Assets: {formatRupiah(result.nisabEligibleAssets)}</p>
                <p>Nisab Threshold: {formatRupiah(result.nisabThreshold)}</p>
                <p>Excess Assets: {formatRupiah(result.excessAssets)}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Calculation: {formatRupiah(result.excessAssets)} × 2.5% = {formatRupiah(result.amount)}
                </p>
              </div>
            </>
          ) : (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Info className="h-5 w-5" />
                <Text className="font-medium">No Zakat Due</Text>
              </div>
              <Text className="mt-2">
                Your eligible assets ({formatRupiah(result.nisabEligibleAssets)}) are below the nisab threshold ({formatRupiah(result.nisabThreshold)}). 
                Zakat is not obligatory until assets exceed the nisab.
              </Text>
            </Card>
          )}
        </Card>
      )}
    </div>
  )
}
