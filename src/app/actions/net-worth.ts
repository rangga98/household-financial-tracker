'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getNetWorthItems } from '@/lib/supabase/queries/net-worth'
import { createSnapshotFromItems } from '@/lib/utils/net-worth'
import type { NetWorthItem, NetWorthSnapshot, ActionResult } from '@/types/net-worth'

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

export async function createNetWorthItem(payload: {
  name: string
  amount: number
  type: NetWorthItem['type']
  householdId: string
}): Promise<ActionResult<NetWorthItem>> {
  if (!payload.name.trim()) {
    return { success: false, error: 'Item name is required' }
  }
  if (payload.amount <= 0) {
    return { success: false, error: 'Amount must be greater than zero' }
  }

  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('net_worth_items')
    .insert({
      household_id: payload.householdId,
      name: payload.name.trim(),
      amount: payload.amount,
      type: payload.type,
      is_active: true,
    })
    .select('id, household_id, name, amount, type, is_active, created_at, updated_at')
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'NET_WORTH_ITEM_CREATE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  await recordSnapshot(payload.householdId)
  revalidatePath('/net-worth')
  return { success: true, data: mapRowToItem(data) }
}

export async function updateNetWorthItem(
  id: string,
  payload: {
    name: string
    amount: number
    type: NetWorthItem['type']
    householdId: string
  }
): Promise<ActionResult<NetWorthItem>> {
  if (!payload.name.trim()) {
    return { success: false, error: 'Item name is required' }
  }
  if (payload.amount <= 0) {
    return { success: false, error: 'Amount must be greater than zero' }
  }

  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('net_worth_items')
    .update({
      name: payload.name.trim(),
      amount: payload.amount,
      type: payload.type,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('is_active', true)
    .select('id, household_id, name, amount, type, is_active, created_at, updated_at')
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'NET_WORTH_ITEM_UPDATE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  await recordSnapshot(payload.householdId)
  revalidatePath('/net-worth')
  return { success: true, data: mapRowToItem(data) }
}

export async function deleteNetWorthItem(
  id: string,
  householdId: string
): Promise<ActionResult> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('net_worth_items')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error(JSON.stringify({ event: 'NET_WORTH_ITEM_DELETE_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  await recordSnapshot(householdId)
  revalidatePath('/net-worth')
  return { success: true, data: undefined }
}

export async function recordSnapshot(householdId: string): Promise<ActionResult<NetWorthSnapshot>> {
  const supabase = await getSupabaseServerClient()
  const items = await getNetWorthItems(householdId)
  const snapshot = createSnapshotFromItems(items)

  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .upsert(
      {
        household_id: householdId,
        snapshot_date: snapshot.snapshotDate,
        total_current_assets: snapshot.totalCurrentAssets,
        total_non_current_assets: snapshot.totalNonCurrentAssets,
        total_assets: snapshot.totalAssets,
        total_liabilities: snapshot.totalLiabilities,
        net_worth: snapshot.netWorth,
      },
      { onConflict: 'household_id,snapshot_date' }
    )
    .select('id, household_id, snapshot_date, total_current_assets, total_non_current_assets, total_assets, total_liabilities, net_worth, created_at')
    .single()

  if (error) {
    console.error(JSON.stringify({ event: 'NET_WORTH_SNAPSHOT_UPSERT_FAIL', error: error.message }))
    return { success: false, error: error.message }
  }

  return {
    success: true,
    data: {
      id: data.id as string,
      householdId: data.household_id as string,
      snapshotDate: data.snapshot_date as string,
      totalCurrentAssets: Number(data.total_current_assets),
      totalNonCurrentAssets: Number(data.total_non_current_assets),
      totalAssets: Number(data.total_assets),
      totalLiabilities: Number(data.total_liabilities),
      netWorth: Number(data.net_worth),
      createdAt: data.created_at as string,
    },
  }
}
