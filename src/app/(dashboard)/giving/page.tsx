import { ZakatCalculator } from '@/components/features/giving/ZakatCalculator'
import { Card, Title, Text, Badge } from '@tremor/react'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function GivingPage() {
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Giving (Zakat & Charity)
        </h1>
        <Text className="text-gray-600 dark:text-gray-400">
          Track Zakat, Donations, and Compassion Fund in one place
        </Text>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/giving/calculator" className="group block" aria-label="Open Zakat Calculator">
          <Card className="h-full transition-all cursor-pointer ring-1 ring-gray-200/60 dark:ring-gray-800 hover:ring-blue-500/60 hover:shadow-lg bg-white dark:bg-gray-900/60 group-hover:bg-gray-50 dark:group-hover:bg-gray-900/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Title>Zakat Calculator</Title>
                <Text className="mt-2 text-gray-600 dark:text-gray-400">Calculate Zakat Maal & Fitrah</Text>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Card>
        </Link>

        <Link href="/giving/settings" className="group block" aria-label="Open Giving Settings">
          <Card className="h-full transition-all cursor-pointer ring-1 ring-gray-200/60 dark:ring-gray-800 hover:ring-blue-500/60 hover:shadow-lg bg-white dark:bg-gray-900/60 group-hover:bg-gray-50 dark:group-hover:bg-gray-900/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Title>Giving Settings</Title>
                <Text className="mt-2 text-gray-600 dark:text-gray-400">Configure automatic allocation</Text>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Card>
        </Link>

        <Card className="h-full border border-emerald-200/60 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20">
          <Title>Compassion Fund</Title>
          <Text className="mt-2 text-emerald-800 dark:text-emerald-300">Balance & recent activity</Text>
          <div className="mt-4 text-2xl font-bold text-emerald-700 dark:text-emerald-400">Rp 0</div>
          <Badge color="gray" className="mt-2 w-max ring-1 ring-black/5 dark:ring-white/10">Coming soon</Badge>
        </Card>
      </div>

      {/* Inline calculator removed to avoid duplication; use the quick action card above */}
    </div>
  )
}
