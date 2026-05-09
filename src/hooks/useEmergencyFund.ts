import { create } from 'zustand'
import type { UserProfile, FinancialGoal, EmergencyFundSetupInput } from '@/types/emergency-fund'
import {
  getUserProfile,
  updateUserProfile,
  getEmergencyGoal,
  createEmergencyGoal,
  updateEmergencyGoal,
  getTotalFunds,
} from '@/lib/supabase/queries/emergency-fund'
import { calculateEmergencyFundTarget, getEffectiveTarget } from '@/lib/utils/emergency-fund'

interface EmergencyFundStore {
  profile: UserProfile | null
  emergencyGoal: FinancialGoal | null
  totalFunds: number
  availableBalance: number
  progress: number
  effectiveTarget: number
  isLoading: boolean
  error: string | null

  loadEmergencyFund: (userId: string, householdId: string) => Promise<void>
  setupEmergencyFund: (
    userId: string,
    householdId: string,
    input: EmergencyFundSetupInput
  ) => Promise<void>
  updateTargetOverride: (userId: string, overrideAmount: number) => Promise<void>
  addToEmergencyFund: (goalId: string, amount: number) => Promise<void>
  withdrawFromEmergencyFund: (goalId: string, amount: number) => Promise<void>
  recalculateTarget: (userId: string) => Promise<void>
}

export const useEmergencyFundStore = create<EmergencyFundStore>((set, get) => ({
  profile: null,
  emergencyGoal: null,
  totalFunds: 0,
  availableBalance: 0,
  progress: 0,
  effectiveTarget: 0,
  isLoading: false,
  error: null,

  loadEmergencyFund: async (userId: string, householdId: string) => {
    set({ isLoading: true, error: null })
    try {
      const [profile, emergencyGoal, totalFunds] = await Promise.all([
        getUserProfile(userId),
        getEmergencyGoal(householdId),
        getTotalFunds(householdId),
      ])

      const effectiveTarget = profile ? getEffectiveTarget(profile) : 0
      const emergencyFundAmount = emergencyGoal?.currentAmount || 0
      const availableBalance = totalFunds - emergencyFundAmount
      const progress = effectiveTarget > 0 ? (emergencyFundAmount / effectiveTarget) * 100 : 0

      set({
        profile,
        emergencyGoal,
        totalFunds,
        availableBalance,
        effectiveTarget,
        progress: Math.min(progress, 150),
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load emergency fund',
      })
    }
  },

  setupEmergencyFund: async (
    userId: string,
    householdId: string,
    input: EmergencyFundSetupInput
  ) => {
    set({ isLoading: true, error: null })
    try {
      const target = calculateEmergencyFundTarget(
        input.maritalStatus,
        input.dependents,
        input.monthlyLivingExpenseEstimate
      )

      const updatedProfile = await updateUserProfile(userId, {
        maritalStatus: input.maritalStatus,
        dependents: input.dependents,
        monthlyLivingExpenseEstimate: input.monthlyLivingExpenseEstimate,
        emergencyFundTarget: target,
        emergencyFundTargetOverridden: false,
      })

      const emergencyGoal = await createEmergencyGoal(householdId, target)

      const effectiveTarget = updatedProfile ? getEffectiveTarget(updatedProfile) : 0
      const progress = emergencyGoal.currentAmount > 0 && effectiveTarget > 0
        ? (emergencyGoal.currentAmount / effectiveTarget) * 100
        : 0

      set({
        profile: updatedProfile,
        emergencyGoal,
        effectiveTarget,
        progress: Math.min(progress, 150),
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to setup emergency fund',
      })
    }
  },

  updateTargetOverride: async (userId: string, overrideAmount: number) => {
    const { profile } = get()
    if (!profile) return

    set({ isLoading: true, error: null })
    try {
      const updatedProfile = await updateUserProfile(userId, {
        emergencyFundTargetOverride: overrideAmount,
        emergencyFundTargetOverridden: true,
      })

      const effectiveTarget = updatedProfile ? getEffectiveTarget(updatedProfile) : 0
      const emergencyGoal = get().emergencyGoal
      const progress = emergencyGoal && effectiveTarget > 0
        ? (emergencyGoal.currentAmount / effectiveTarget) * 100
        : 0

      set({
        profile: updatedProfile,
        effectiveTarget,
        progress: Math.min(progress, 150),
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update target override',
      })
    }
  },

  addToEmergencyFund: async (goalId: string, amount: number) => {
    const { emergencyGoal, profile, totalFunds } = get()
    if (!emergencyGoal || !profile) return

    set({ isLoading: true, error: null })
    try {
      const newAmount = emergencyGoal.currentAmount + amount
      const updatedGoal = await updateEmergencyGoal(goalId, {
        currentAmount: newAmount,
      })

      const effectiveTarget = get().effectiveTarget
      const progress = effectiveTarget > 0 ? (newAmount / effectiveTarget) * 100 : 0
      const availableBalance = totalFunds - newAmount

      set({
        emergencyGoal: updatedGoal,
        availableBalance,
        progress: Math.min(progress, 150),
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add to emergency fund',
      })
    }
  },

  withdrawFromEmergencyFund: async (goalId: string, amount: number) => {
    const { emergencyGoal, profile, totalFunds } = get()
    if (!emergencyGoal || !profile) return

    set({ isLoading: true, error: null })
    try {
      const newAmount = Math.max(0, emergencyGoal.currentAmount - amount)
      const updatedGoal = await updateEmergencyGoal(goalId, {
        currentAmount: newAmount,
      })

      const effectiveTarget = get().effectiveTarget
      const progress = effectiveTarget > 0 ? (newAmount / effectiveTarget) * 100 : 0
      const availableBalance = totalFunds - newAmount

      set({
        emergencyGoal: updatedGoal,
        availableBalance,
        progress: Math.min(progress, 150),
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to withdraw from emergency fund',
      })
    }
  },

  recalculateTarget: async (userId: string) => {
    const { profile } = get()
    if (!profile || !profile.maritalStatus || profile.dependents === null ||
        !profile.monthlyLivingExpenseEstimate) return

    set({ isLoading: true, error: null })
    try {
      const newTarget = calculateEmergencyFundTarget(
        profile.maritalStatus,
        profile.dependents,
        profile.monthlyLivingExpenseEstimate
      )

      const updatedProfile = await updateUserProfile(userId, {
        emergencyFundTarget: newTarget,
        emergencyFundTargetOverridden: false,
      })

      const effectiveTarget = updatedProfile ? getEffectiveTarget(updatedProfile) : 0
      const emergencyGoal = get().emergencyGoal
      const progress = emergencyGoal && effectiveTarget > 0
        ? (emergencyGoal.currentAmount / effectiveTarget) * 100
        : 0

      set({
        profile: updatedProfile,
        effectiveTarget,
        progress: Math.min(progress, 150),
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to recalculate target',
      })
    }
  },
}))
