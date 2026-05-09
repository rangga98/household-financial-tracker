import { AlertTriangle } from 'lucide-react'

interface OverbudgetAlertProps {
  categoryName: string
  percentageUsed: number
}

export function OverbudgetAlert({
  categoryName,
  percentageUsed,
}: OverbudgetAlertProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
    >
      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-red-800 dark:text-red-200">
          Budget Warning
        </p>
        <p className="text-sm text-red-700 dark:text-red-300">
          {categoryName} spending is at {Math.round(percentageUsed)}% of your
          monthly limit.
        </p>
      </div>
    </div>
  )
}
