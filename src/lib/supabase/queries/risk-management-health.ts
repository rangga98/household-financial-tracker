import { getBudgetMetrics } from './budgeting'
import type { BudgetMetrics } from '@/types'

const HEALTH_KEYWORDS = [
  'dokter',
  'doctor',
  'farmasi',
  'pharmacy',
  'gigi',
  'dental',
  'mata',
  'vision',
  'lab',
  'diagnostik',
  'diagnostic',
  'kesehatan',
  'health',
  'medis',
  'medical',
  'klinik',
  'clinic',
  'rumah sakit',
  'hospital',
  'insurance',
  'asuransi',
  'obat',
]

export async function getHealthBudgetMetrics(
  householdId: string,
  yearMonth?: string
): Promise<BudgetMetrics[]> {
  const allMetrics = await getBudgetMetrics(householdId, yearMonth)
  return allMetrics.filter((m) =>
    HEALTH_KEYWORDS.some((kw) => m.categoryName.toLowerCase().includes(kw))
  )
}
