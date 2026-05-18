import { ZAKAT_MAAL_RATE } from '@/types/giving'

export interface ZakatMaalInput {
  nisabEligibleAssets: number
  nisabThreshold: number
}

export interface ZakatMaalResult {
  isDue: boolean
  amount: number
  nisabEligibleAssets: number
  nisabThreshold: number
  excessAssets: number
}

export function calculateZakatMaal(input: ZakatMaalInput): ZakatMaalResult {
  const { nisabEligibleAssets, nisabThreshold } = input

  if (nisabEligibleAssets <= 0) {
    return {
      isDue: false,
      amount: 0,
      nisabEligibleAssets,
      nisabThreshold,
      excessAssets: 0,
    }
  }

  if (nisabThreshold <= 0) {
    const excessAssets = nisabEligibleAssets
    const amount = Math.round(excessAssets * ZAKAT_MAAL_RATE * 100) / 100

    return {
      isDue: true,
      amount,
      nisabEligibleAssets,
      nisabThreshold,
      excessAssets: Math.round(excessAssets * 100) / 100,
    }
  }

  const excessAssets = nisabEligibleAssets - nisabThreshold

  if (excessAssets <= 0) {
    return {
      isDue: false,
      amount: 0,
      nisabEligibleAssets,
      nisabThreshold,
      excessAssets: 0,
    }
  }

  const amount = Math.round(excessAssets * ZAKAT_MAAL_RATE * 100) / 100

  return {
    isDue: true,
    amount,
    nisabEligibleAssets,
    nisabThreshold,
    excessAssets: Math.round(excessAssets * 100) / 100,
  }
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
