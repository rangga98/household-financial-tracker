'use client'

import { Card, Title, Text, ProgressBar } from '@tremor/react'
import { Target, TrendingUp, Calendar, AlertTriangle, PartyPopper, Edit3 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { computeFIProjection } from '@/lib/utils/finance'
import { formatCompactRp, formatRp } from '@/lib/utils/currency'
import type { FIProfile } from '@/types/financial-freedom'
import { FIInputForm } from './FIInputForm'
import { FIProjectionChart } from './FIProjectionChart'

interface FinancialFreedomDashboardProps {
  profile: FIProfile
  suggestedAnnualExpenses?: number | null
  onProfileUpdate?: (profile: FIProfile) => void
}

export function FinancialFreedomDashboard({
  profile,
  suggestedAnnualExpenses,
  onProfileUpdate,
}: FinancialFreedomDashboardProps) {
  const [showForm, setShowForm] = useState(false)

  // Compute FI projection
  const projection = useMemo(() => computeFIProjection(profile), [profile])

  // Check for missing data
  const hasMissingData =
    profile.fiAnnualExpenses === null ||
    profile.fiSavingsRate === null ||
    profile.fiCurrentAge === null ||
    profile.fiCurrentNetWorth === null

  // Handle onboarding prompt
  if (hasMissingData && !showForm) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <Title>Financial Freedom Calculator</Title>
        </div>
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <Target className="w-8 h-8 text-blue-600" />
          </div>
          <Text className="text-gray-600 dark:text-gray-400 mb-4">
            Complete your profile to calculate when you'll reach financial freedom
          </Text>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Set Up Profile
          </button>
        </div>
      </Card>
    )
  }

  // Handle celebratory state (already FI)
  if (projection.isAlreadyFI) {
    return (
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/30 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-200 dark:bg-emerald-800 mb-4">
            <PartyPopper className="w-10 h-10 text-emerald-600 dark:text-emerald-300" />
          </div>
          <Title className="text-emerald-700 dark:text-emerald-300 mb-2">
            🎉 Congratulations! 🎉
          </Title>
          <Text className="text-emerald-600 dark:text-emerald-400 text-lg">
            You are already financially independent!
          </Text>
          <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <Text className="text-gray-500 dark:text-gray-400">Your Net Worth</Text>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatRp(profile.fiCurrentNetWorth ?? 0)}
            </p>
            <Text className="text-gray-500 dark:text-gray-400 mt-2">FI Number</Text>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {formatRp(projection.fiNumber)}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
        {showForm && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <FIInputForm
              profile={profile}
              suggestedAnnualExpenses={suggestedAnnualExpenses}
              onUpdate={(updatedProfile: FIProfile) => {
                onProfileUpdate?.(updatedProfile)
                setShowForm(false)
              }}
            />
          </div>
        )}
      </Card>
    )
  }

  // Handle unreachable state (0% savings and 0% return)
  if (projection.yearsToFI === null && !projection.isAlreadyFI) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <Title>Financial Freedom Calculator</Title>
        </div>
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <Text className="text-amber-600 dark:text-amber-400 text-lg font-semibold mb-2">
            FI Currently Unreachable
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-4">
            With 0% savings rate and no investment returns, FI cannot be reached. Increase your savings rate or add investment returns to see your projection.
          </Text>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Text className="text-gray-500 dark:text-gray-400">FI Number</Text>
              <p className="text-lg font-bold">{formatCompactRp(projection.fiNumber)}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Text className="text-gray-500 dark:text-gray-400">Current Net Worth</Text>
              <p className="text-lg font-bold">{formatCompactRp(profile.fiCurrentNetWorth ?? 0)}</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Update Profile
          </button>
        </div>
        {showForm && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <FIInputForm
              profile={profile}
              suggestedAnnualExpenses={suggestedAnnualExpenses}
              onUpdate={(updatedProfile: FIProfile) => {
                onProfileUpdate?.(updatedProfile)
                setShowForm(false)
              }}
            />
          </div>
        )}
      </Card>
    )
  }

  // Normal state - show dashboard with KPIs
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          <Title>Financial Freedom Calculator</Title>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          aria-label="Edit profile"
        >
          <Edit3 className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Text className="text-gray-500 dark:text-gray-400">Progress to FI</Text>
          <Text className="font-semibold tabular-nums">
            {projection.progressPercentage.toFixed(1)}%
          </Text>
        </div>
        <ProgressBar
          value={projection.progressPercentage}
          color="emerald"
          className="h-3"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* FI Number */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-600" />
            <Text className="text-xs text-gray-500 dark:text-gray-400">FI Number</Text>
          </div>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-300 tabular-nums">
            {formatCompactRp(projection.fiNumber)}
          </p>
        </div>

        {/* Years to FI */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <Text className="text-xs text-gray-500 dark:text-gray-400">Years to FI</Text>
          </div>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
            {projection.yearsToFI ?? '—'}
          </p>
        </div>

        {/* Projected FI Age */}
        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <Text className="text-xs text-gray-500 dark:text-gray-400">FI Age</Text>
          </div>
          <p className="text-lg font-bold text-purple-700 dark:text-purple-300 tabular-nums">
            {projection.projectedFIAge ?? '—'}
          </p>
        </div>
      </div>

      {/* Projection Chart */}
      {projection.trajectory.length > 0 && (
        <div className="mb-6">
          <FIProjectionChart trajectory={projection.trajectory} fiNumber={projection.fiNumber} />
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div>
          <Text className="text-gray-500 dark:text-gray-400">Current Net Worth</Text>
          <p className="text-lg font-semibold tabular-nums">
            {formatRp(profile.fiCurrentNetWorth ?? 0)}
          </p>
        </div>
        <div>
          <Text className="text-gray-500 dark:text-gray-400">Savings Rate</Text>
          <p className="text-lg font-semibold tabular-nums">
            {((profile.fiSavingsRate ?? 0) * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Input Form (collapsible) */}
      {showForm && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <FIInputForm
            profile={profile}
            suggestedAnnualExpenses={suggestedAnnualExpenses}
            onUpdate={() => setShowForm(false)}
          />
        </div>
      )}
    </Card>
  )
}
