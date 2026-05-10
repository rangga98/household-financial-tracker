'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface CategoryFilterProps {
  filterType: 'all' | 'fixed' | 'variable'
  onFilterTypeChange: (type: 'all' | 'fixed' | 'variable') => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function CategoryFilter({
  filterType,
  onFilterTypeChange,
  searchQuery,
  onSearchChange,
}: CategoryFilterProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search categories..."
          className={cn(
            'w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-sm',
            'border-gray-200 dark:border-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
        />
      </div>

      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', 'fixed', 'variable'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onFilterTypeChange(type)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize whitespace-nowrap min-h-[36px]',
                filterType === type
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
