import type { MaritalStatus, UserProfile } from '@/types/emergency-fund';

export function calculateEmergencyFundTarget(
  maritalStatus: MaritalStatus,
  dependents: number,
  monthlyExpenseEstimate: number
): number {
  const hasChildren = dependents > 0;
  const multiplier = maritalStatus === 'married' && hasChildren ? 12 : 6;
  return monthlyExpenseEstimate * multiplier;
}

export function getEffectiveTarget(profile: UserProfile): number {
  if (profile.emergencyFundTargetOverridden && profile.emergencyFundTargetOverride) {
    return profile.emergencyFundTargetOverride;
  }
  return profile.emergencyFundTarget || 0;
}

export function calculateEmergencyFundProgress(
  currentAmount: number,
  targetAmount: number
): number {
  if (targetAmount <= 0) return 0;
  return Math.min((currentAmount / targetAmount) * 100, 150);
}

export function calculateAvailableBalance(
  totalFunds: number,
  emergencyFundCurrentAmount: number
): number {
  return totalFunds - emergencyFundCurrentAmount;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}
