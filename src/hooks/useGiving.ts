import { create } from 'zustand'
import type { GivingSettings, GivingGoal, GivingSummary, GivingGoalType, GivingTransaction } from '@/types/giving'
import {
  getGivingSettings,
  updateGivingSettings,
  getGivingGoals,
  getGivingGoal,
  getGivingSummary,
  ensureGivingGoalsExist,
  getGivingTransactions,
} from '@/lib/supabase/queries/giving'
import { calculateZakatMaal, type ZakatMaalInput, type ZakatMaalResult } from '@/lib/utils/zakat-maal'
import { calculateZakatFitrah, type ZakatFitrahInput, type ZakatFitrahResult } from '@/lib/utils/zakat-fitrah'

interface GivingState {
  settings: GivingSettings | null
  goals: GivingGoal[]
  summary: GivingSummary | null
  isLoading: boolean
  error: string | null

  loadSettings: (userId: string) => Promise<void>
  loadGoals: (householdId: string) => Promise<void>
  loadSummary: (householdId: string, startDate: Date, endDate: Date) => Promise<void>
  ensureGoalsExist: (householdId: string) => Promise<void>
  updateSettings: (userId: string, updates: Partial<GivingSettings>) => Promise<void>
  calculateZakatMaal: (input: ZakatMaalInput) => ZakatMaalResult
  calculateZakatFitrah: (input: ZakatFitrahInput) => ZakatFitrahResult
  getGoalTransactions: (householdId: string, goalId: string, startDate?: Date, endDate?: Date) => Promise<GivingTransaction[]>
}

export const useGivingStore = create<GivingState>((set, get) => ({
  settings: null,
  goals: [],
  summary: null,
  isLoading: false,
  error: null,

  loadSettings: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const settings = await getGivingSettings(userId)
      set({ settings, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  loadGoals: async (householdId: string) => {
    set({ isLoading: true, error: null })
    try {
      const goals = await getGivingGoals(householdId)
      set({ goals, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  loadSummary: async (householdId: string, startDate: Date, endDate: Date) => {
    set({ isLoading: true, error: null })
    try {
      const summary = await getGivingSummary(householdId, startDate, endDate)
      set({ summary, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  ensureGoalsExist: async (householdId: string) => {
    try {
      const goals = await ensureGivingGoalsExist(householdId)
      set({ goals })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  updateSettings: async (userId: string, updates: Partial<GivingSettings>) => {
    set({ isLoading: true, error: null })
    try {
      const settings = await updateGivingSettings(userId, {
        nama: updates.nama,
        namaLengkap: updates.namaLengkap,
        email: updates.email,
      })
      set({ settings, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  calculateZakatMaal: (input: ZakatMaalInput) => {
    return calculateZakatMaal(input)
  },

  calculateZakatFitrah: (input: ZakatFitrahInput) => {
    return calculateZakatFitrah(input)
  },

  getGoalTransactions: async (householdId: string, goalId: string, startDate?: Date, endDate?: Date) => {
    try {
      return await getGivingTransactions(householdId, goalId, startDate, endDate)
    } catch (error) {
      set({ error: (error as Error).message })
      return []
    }
  },
}))
