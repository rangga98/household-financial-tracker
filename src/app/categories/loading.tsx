import { Loader2 } from 'lucide-react'

export default function CategoriesLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded" />

        <div className="space-y-4">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>

        <div className="space-y-4">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>

      <div className="flex items-center justify-center mt-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
          Loading categories...
        </span>
      </div>
    </div>
  )
}
