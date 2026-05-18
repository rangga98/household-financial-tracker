'use client'

import { useState } from 'react'
import { Button, Card, Title, Text, Metric } from '@tremor/react'
import { calculateZakatFitrah } from '@/lib/utils/zakat-fitrah'
import { formatRupiah } from '@/lib/utils/zakat-maal'
import { DEFAULT_SHA_WEIGHT_KG } from '@/types/giving'

export function ZakatFitrahForm() {
  const [familyMembers, setFamilyMembers] = useState('')
  const [stapleFoodPricePerSha, setStapleFoodPricePerSha] = useState('')
  const [shaWeightKg, setShaWeightKg] = useState(DEFAULT_SHA_WEIGHT_KG.toString())
  const [result, setResult] = useState<ReturnType<typeof calculateZakatFitrah> | null>(null)
  const [error, setError] = useState('')

  const handleCalculate = () => {
    setError('')
    
    const members = parseInt(familyMembers)
    const price = parseFloat(stapleFoodPricePerSha)
    const weight = parseFloat(shaWeightKg) || DEFAULT_SHA_WEIGHT_KG
    
    if (isNaN(members) || members < 0) {
      setError('Please enter a valid number of family members')
      return
    }
    
    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price per sha')
      return
    }
    
    const calcResult = calculateZakatFitrah({
      familyMembers: members,
      stapleFoodPricePerSha: price,
      shaWeightKg: weight,
    })
    
    setResult(calcResult)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Number of Family Members
        </label>
        <input
          type="number"
          placeholder="e.g., 4"
          value={familyMembers}
          onChange={(e) => setFamilyMembers(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base tabular-nums"
        />
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Number of people in your household eligible for Zakat Fitrah
        </Text>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Price per Sha' (Rp)
        </label>
        <input
          type="number"
          placeholder="e.g., 50000"
          value={stapleFoodPricePerSha}
          onChange={(e) => setStapleFoodPricePerSha(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base tabular-nums"
        />
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Local price of staple food per sha' (1 sha' ≈ 2.5 kg)
        </Text>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Sha' Weight (kg) - Optional
        </label>
        <input
          type="number"
          placeholder="2.5"
          value={shaWeightKg}
          onChange={(e) => setShaWeightKg(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base tabular-nums"
        />
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Default: 2.5 kg per sha' (adjust if local scholarly guidance differs)
        </Text>
      </div>
      
      <button
        type="button"
        onClick={handleCalculate}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        Calculate Zakat Fitrah
      </button>
      
      {error && (
        <Card className="mt-4 border-red-200 dark:border-red-800">
          <Text className="text-red-600 dark:text-red-400">{error}</Text>
        </Card>
      )}
      
      {result && (
        <Card className="mt-4">
          <Text>Zakat Fitrah Obligation</Text>
          <Metric className="text-emerald-600">{formatRupiah(result.amount)}</Metric>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>Family Members: {result.familyMembers}</p>
            <p>Sha' Weight: {result.shaWeightKg} kg</p>
            <p>Total Rice: {result.totalKg} kg</p>
            <p className="text-xs text-gray-500 mt-2">
              Calculation: {result.familyMembers} × {result.shaWeightKg} kg × {formatRupiah(parseFloat(stapleFoodPricePerSha))} = {formatRupiah(result.amount)}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
