import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getFIProfile, getBudgetBasedAnnualExpenses } from '@/app/actions/financial-freedom'
import { getProfiles } from '@/lib/supabase/queries/profiles'
import { FinancialFreedomDashboard } from '@/components/features/financial-freedom/FinancialFreedomDashboard'

const DEMO_HOUSEHOLD_ID = '963a25fc-553a-48b2-9439-d093984015f2'

export default async function FinancialFreedomPage() {
  // Get the first profile for demo
  const profiles = await getProfiles(DEMO_HOUSEHOLD_ID)
  const userId = profiles[0]?.id

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Freedom
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            No profile found. Please create a profile first.
          </p>
        </div>
      </div>
    )
  }

  // Fetch FI profile and suggested expenses in parallel
  const [fiProfile, suggestedAnnualExpenses] = await Promise.all([
    getFIProfile(userId),
    getBudgetBasedAnnualExpenses(DEMO_HOUSEHOLD_ID),
  ])

  // If no FI profile exists yet, create a default one with the user ID
  const profile = fiProfile || {
    id: userId,
    householdId: DEMO_HOUSEHOLD_ID,
    fiAnnualExpenses: null,
    fiSavingsRate: null,
    fiCurrentAge: null,
    fiCurrentNetWorth: null,
    fiExpectedReturn: null,
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Financial Freedom
        </h1>
        <FinancialFreedomDashboard
          profile={profile}
          suggestedAnnualExpenses={suggestedAnnualExpenses}
        />
      </div>
    </div>
  )
}
