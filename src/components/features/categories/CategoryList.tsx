'use client'

import { useState, useMemo } from 'react'
import { CategoryCard } from './CategoryCard'
import { CategoryFilter } from './CategoryFilter'
import type { CustomCategory } from '@/lib/supabase/categories'

interface CategoryListProps {
  categories: CustomCategory[]
  onUpdate: () => void
}

export function CategoryList({ categories, onUpdate }: CategoryListProps) {
  const [filterType, setFilterType] = useState<'all' | 'fixed' | 'variable'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesType = filterType === 'all' || category.type === filterType
      const matchesSearch =
        searchQuery.trim() === '' ||
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [categories, filterType, searchQuery])

  return (
    <div className="space-y-4">
      <CategoryFilter
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {filteredCategories.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          {categories.length === 0
            ? 'No categories yet. Create your first category above.'
            : 'No categories match your filters.'}
        </p>
      ) : (
        <div className="space-y-3">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
