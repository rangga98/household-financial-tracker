'use client'

import { Card, Title, Text } from '@tremor/react'
import { EmergencyFundProgress } from './EmergencyFundProgress'
import { EmergencyFundSetup } from './EmergencyFundSetup'
import { EmergencyFundForm } from './index'
import type { UserProfile, FinancialGoal } from '@/types/emergency-fund'
import { formatCurrency } from '@/lib/utils/emergency-fund'
import { Shield } from 'lucide-react'

interface EmergencyFundCardProps {
  profile: UserProfile | null
  emergencyGoal: FinancialGoal | null
  totalFunds: number
  availableBalance: number
  progress: number
  isLoading?: boolean
  onSetup: (input: {
    maritalStatus: 'single' | 'married'
    dependents: number
    monthlyLivingExpenseEstimate: number
  }) => void
  onAdd: (amount: number) => void
  onWithdraw: (amount: number) => void
}

export function EmergencyFundCard({
  profile,
  emergencyGoal,
  totalFunds,
  availableBalance,
  progress,
  isLoading,
  onSetup,
  onAdd,
  onWithdraw,
}: EmergencyFundCardProps) {
  const hasTarget = profile?.emergencyFundTarget && profile.emergencyFundTarget > 0
  const effectiveTarget = profile?.emergencyFundTargetOverridden && profile.emergencyFundTargetOverride
    ? profile.emergencyFundTargetOverride
    : profile?.emergencyFundTarget || 0

  if (!hasTarget) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-600" />
          <Title>Emergency Fund</Title>
        </div>
        <EmergencyFundSetup onSubmit={onSetup} isLoading={isLoading} />
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-600" />
        <Title>Emergency Fund</Title>
      </div>

      <div className="grid gap-6">
        <EmergencyFundProgress
          currentAmount={emergencyGoal?.currentAmount || 0}
          targetAmount={effectiveTarget}
          progress={progress}
        />

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <Text className="text-gray-500 dark:text-gray-400">Total Balance</Text>
            <p className="text-lg font-semibold">{formatCurrency(totalFunds)}</p>
          </div>
          <div>
            <Text className="text-gray-500 dark:text-gray-400">Available</Text>
            <p className="text-lg font-semibold">{formatCurrency(availableBalance)}</p>
          </div>
        </div>

        <EmergencyFundForm
          goalId={emergencyGoal?.id || ''}
          onAdd={onAdd}
          onWithdraw={onWithdraw}
          isLoading={isLoading}
        />
      </div>
    </Card>
  )
}
