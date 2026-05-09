import { describe, it, expect } from 'vitest'
import {
  calculateEmergencyFundTarget,
  getEffectiveTarget,
  calculateEmergencyFundProgress,
  calculateAvailableBalance,
} from './emergency-fund'
import type { UserProfile } from '@/types/emergency-fund'

describe('calculateEmergencyFundTarget', () => {
  it('should return 6x for single with no dependents', () => {
    const result = calculateEmergencyFundTarget('single', 0, 3000)
    expect(result).toBe(18000)
  })

  it('should return 6x for married with no children', () => {
    const result = calculateEmergencyFundTarget('married', 0, 4000)
    expect(result).toBe(24000)
  })

  it('should return 12x for married with children', () => {
    const result = calculateEmergencyFundTarget('married', 2, 5000)
    expect(result).toBe(60000)
  })

  it('should return 6x for single with dependents (not married)', () => {
    const result = calculateEmergencyFundTarget('single', 1, 3000)
    expect(result).toBe(18000)
  })

  it('should handle zero dependents correctly', () => {
    const result = calculateEmergencyFundTarget('married', 0, 5000)
    expect(result).toBe(30000)
  })
})

describe('getEffectiveTarget', () => {
  const baseProfile: UserProfile = {
    id: '123',
    householdId: 'hh-123',
    maritalStatus: 'married',
    dependents: 2,
    monthlyLivingExpenseEstimate: 5000,
    emergencyFundTarget: 60000,
    emergencyFundTargetOverride: null,
    emergencyFundTargetOverridden: false,
  }

  it('should return calculated target when not overridden', () => {
    const profile = { ...baseProfile, emergencyFundTargetOverridden: false }
    const result = getEffectiveTarget(profile)
    expect(result).toBe(60000)
  })

  it('should return override value when overridden', () => {
    const profile = {
      ...baseProfile,
      emergencyFundTargetOverridden: true,
      emergencyFundTargetOverride: 80000,
    }
    const result = getEffectiveTarget(profile)
    expect(result).toBe(80000)
  })

  it('should return 0 when target is null', () => {
    const profile = { ...baseProfile, emergencyFundTarget: null }
    const result = getEffectiveTarget(profile)
    expect(result).toBe(0)
  })

  it('should return override even if null target when overridden', () => {
    const profile = {
      ...baseProfile,
      emergencyFundTarget: null,
      emergencyFundTargetOverridden: true,
      emergencyFundTargetOverride: 50000,
    }
    const result = getEffectiveTarget(profile)
    expect(result).toBe(50000)
  })
})

describe('calculateEmergencyFundProgress', () => {
  it('should return 0 when target is 0', () => {
    const result = calculateEmergencyFundProgress(5000, 0)
    expect(result).toBe(0)
  })

  it('should return 0 when target is negative', () => {
    const result = calculateEmergencyFundProgress(5000, -1000)
    expect(result).toBe(0)
  })

  it('should calculate 50% progress correctly', () => {
    const result = calculateEmergencyFundProgress(30000, 60000)
    expect(result).toBe(50)
  })

  it('should calculate 100% progress correctly', () => {
    const result = calculateEmergencyFundProgress(60000, 60000)
    expect(result).toBe(100)
  })

  it('should cap at 150% for display', () => {
    const result = calculateEmergencyFundProgress(100000, 60000)
    expect(result).toBe(150)
  })

  it('should handle exact 150% correctly', () => {
    const result = calculateEmergencyFundProgress(90000, 60000)
    expect(result).toBe(150)
  })
})

describe('calculateAvailableBalance', () => {
  it('should return full balance when no emergency fund', () => {
    const result = calculateAvailableBalance(10000, 0)
    expect(result).toBe(10000)
  })

  it('should subtract emergency fund from total', () => {
    const result = calculateAvailableBalance(10000, 5000)
    expect(result).toBe(5000)
  })

  it('should handle zero total', () => {
    const result = calculateAvailableBalance(0, 0)
    expect(result).toBe(0)
  })

  it('should handle emergency fund exceeding total', () => {
    const result = calculateAvailableBalance(5000, 8000)
    expect(result).toBe(-3000)
  })
})
