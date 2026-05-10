'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function CategoriesErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        event: 'CATEGORIES_PAGE_ERROR',
        message: error.message,
        digest: error.digest,
      })
    )
  }, [error])

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
          Something went wrong
        </h2>
        <p className="text-red-600 dark:text-red-300 mb-6">
          {error.message || 'Failed to load categories. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors min-h-[44px]"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
