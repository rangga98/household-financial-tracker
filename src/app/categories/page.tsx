import { getCategories } from '@/lib/supabase/categories'
import { CategoryFormWrapper } from '@/components/features/categories/CategoryFormWrapper'
import { CategoryListWrapper } from '@/components/features/categories/CategoryListWrapper'

export default async function CategoriesPage() {
  const householdId = '963a25fc-553a-48b2-9439-d093984015f2'
  const categories = await getCategories(householdId)

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Categories
      </h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Create New Category
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <CategoryFormWrapper householdId={householdId} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Your Categories ({categories.length})
        </h2>
        <CategoryListWrapper initialCategories={categories} />
      </section>
    </div>
  )
}
