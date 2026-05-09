const ID_LOCALE = 'id-ID'

export function formatRp(amount: number): string {
  return new Intl.NumberFormat(ID_LOCALE, {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCompactRp(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} JT`
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} RB`
  }
  return formatRp(amount)
}

export function parseRp(value: string): number {
  const cleaned = value.replace(/[Rp.\s]/g, '').replace(/,/g, '')
  return parseInt(cleaned, 10) || 0
}
