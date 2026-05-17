import { getSupabaseClient } from '@/lib/supabase/client'
import { calculateNetWorthSummary } from '@/lib/utils/net-worth'
import type { NetWorthItem, NetWorthSnapshot, NetWorthSummary } from '@/types/net-worth'

function mapRowToItem(data: Record<string, unknown>): NetWorthItem {
  return {
    id: data.id as string,
    householdId: data.household_id as string,
    name: data.name as string,
    amount: Number(data.amount),
    type: data.type as NetWorthItem['type'],
    isActive: data.is_active as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

function mapRowToSnapshot(data: Record<string, unknown>): NetWorthSnapshot {
  return {
    id: data.id as string,
    householdId: data.household_id as string,
    snapshotDate: data.snapshot_date as string,
    totalCurrentAssets: Number(data.total_current_assets),
    totalNonCurrentAssets: Number(data.total_non_current_assets),
    totalAssets: Number(data.total_assets),
    totalLiabilities: Number(data.total_liabilities),
    netWorth: Number(data.net_worth),
    createdAt: data.created_at as string,
  }
}

export async function getNetWorthItems(householdId: string): Promise<NetWorthItem[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('net_worth_items')
    .select('id, household_id, name, amount, type, is_active, created_at, updated_at')
    .eq('household_id', householdId)
    .eq('is_active', true)
    .order('type', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error(JSON.stringify({ event: 'NET_WORTH_ITEMS_FETCH_FAIL', error: error.message }))
    return []
  }

  return (data ?? []).map(mapRowToItem)
}

export async function getNetWorthItemById(id: string): Promise<NetWorthItem | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('net_worth_items')
    .select('id, household_id, name, amount, type, is_active, created_at, updated_at')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    return null
  }

  return mapRowToItem(data)
}

export async function getNetWorthSummary(householdId: string): Promise<NetWorthSummary> {
  const items = await getNetWorthItems(householdId)
  return calculateNetWorthSummary(items)
}

export async function getNetWorthSnapshots(
  householdId: string,
  limit = 365
): Promise<NetWorthSnapshot[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .select('id, household_id, snapshot_date, total_current_assets, total_non_current_assets, total_assets, total_liabilities, net_worth, created_at')
    .eq('household_id', householdId)
    .order('snapshot_date', { ascending: true })
    .limit(limit)

  if (error) {
    console.error(JSON.stringify({ event: 'NET_WORTH_SNAPSHOTS_FETCH_FAIL', error: error.message }))
    return []
  }

  return (data ?? []).map(mapRowToSnapshot)
}
