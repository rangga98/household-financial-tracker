import { create } from 'zustand'
import { getNetWorthItems, getNetWorthSnapshots } from '@/lib/supabase/queries/net-worth'
import { calculateNetWorthSummary } from '@/lib/utils/net-worth'
import type { NetWorthItem, NetWorthSnapshot, NetWorthSummary } from '@/types/net-worth'

interface NetWorthStore {
  items: NetWorthItem[]
  snapshots: NetWorthSnapshot[]
  summary: NetWorthSummary
  isLoading: boolean
  error: string | null

  loadNetWorth: (householdId: string) => Promise<void>
  addItem: (item: NetWorthItem) => void
  updateItem: (item: NetWorthItem) => void
  removeItem: (id: string) => void
  addSnapshot: (snapshot: NetWorthSnapshot) => void
}

const emptySummary: NetWorthSummary = {
  totalCurrentAssets: 0,
  totalNonCurrentAssets: 0,
  totalAssets: 0,
  totalLiabilities: 0,
  netWorth: 0,
  isPositive: true,
}

export const useNetWorthStore = create<NetWorthStore>((set, get) => ({
  items: [],
  snapshots: [],
  summary: emptySummary,
  isLoading: false,
  error: null,

  loadNetWorth: async (householdId: string) => {
    set({ isLoading: true, error: null })
    try {
      const [items, snapshots] = await Promise.all([
        getNetWorthItems(householdId),
        getNetWorthSnapshots(householdId),
      ])
      const summary = calculateNetWorthSummary(items)
      set({ items, snapshots, summary, isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load net worth data',
      })
    }
  },

  addItem: (item: NetWorthItem) => {
    const items = [item, ...get().items]
    set({ items, summary: calculateNetWorthSummary(items) })
  },

  updateItem: (item: NetWorthItem) => {
    const items = get().items.map((i) => (i.id === item.id ? item : i))
    set({ items, summary: calculateNetWorthSummary(items) })
  },

  removeItem: (id: string) => {
    const items = get().items.filter((i) => i.id !== id)
    set({ items, summary: calculateNetWorthSummary(items) })
  },

  addSnapshot: (snapshot: NetWorthSnapshot) => {
    const snapshots = get().snapshots
    const existing = snapshots.findIndex((s) => s.snapshotDate === snapshot.snapshotDate)
    if (existing >= 0) {
      const updated = [...snapshots]
      updated[existing] = snapshot
      set({ snapshots: updated })
    } else {
      set({ snapshots: [...snapshots, snapshot].sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate)) })
    }
  },
}))
