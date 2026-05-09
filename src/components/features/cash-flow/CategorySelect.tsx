'use client'

import { cn } from '@/lib/utils/cn'
import type { Category } from '@/types'

interface CategorySelectProps {
  categories: Category[]
  value: string
  onChange: (value: string) => void
  label?: string
}

export function CategorySelect({
  categories,
  value,
  onChange,
  label = 'Category',
}: CategorySelectProps) {
  const activeCategories = categories.filter((c) => c.isActive)

  const fixedCategories = activeCategories.filter((c) => c.type === 'fixed')
  const variableCategories = activeCategories.filter((c) => c.type === 'variable')

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        <option value="">Select category</option>
        
        {fixedCategories.length > 0 && (
          <optgroup label="Fixed (Mandatory)">
            {fixedCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </optgroup>
        )}
        
        {variableCategories.length > 0 && (
          <optgroup label="Variable (Optional)">
            {variableCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  )
}
