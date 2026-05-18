import { DEFAULT_SHA_WEIGHT_KG } from '@/types/giving'

export interface ZakatFitrahInput {
  familyMembers: number
  stapleFoodPricePerSha: number
  shaWeightKg?: number
}

export interface ZakatFitrahResult {
  amount: number
  familyMembers: number
  shaWeightKg: number
  totalKg: number
}

export function calculateZakatFitrah(input: ZakatFitrahInput): ZakatFitrahResult {
  const { familyMembers, stapleFoodPricePerSha, shaWeightKg = DEFAULT_SHA_WEIGHT_KG } = input

  if (familyMembers <= 0 || stapleFoodPricePerSha <= 0) {
    return {
      amount: 0,
      familyMembers,
      shaWeightKg,
      totalKg: 0,
    }
  }

  const totalKg = familyMembers * shaWeightKg
  const amount = Math.round(totalKg * stapleFoodPricePerSha * 100) / 100

  return {
    amount,
    familyMembers,
    shaWeightKg,
    totalKg: Math.round(totalKg * 100) / 100,
  }
}
