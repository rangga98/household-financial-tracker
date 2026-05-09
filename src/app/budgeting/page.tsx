import { getSupabaseServerClient } from '@/lib/supabase/server'
import { BudgetLimitForm } from '@/components/features/budgeting/BudgetLimitForm'
import { BudgetCard } from '@/components/features/budgeting/BudgetCard'
import { updateCategoryLimit } from '@/app/actions/budgeting'
import { getBudgetMetrics } from '@/lib/supabase/queries/budgeting'
import type { Category } from '@/types'

export default async function BudgetingPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Please sign in to view your budget.</p>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Profile not found.</p>
      </div>
    )
  }

  const householdId = String(profile.household_id)

  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_active', true)
    .order('type')
    .order('name')

  const categories: Category[] = (categoriesData || []).map(
    (c: Record<string, unknown>) => ({
      id: String(c.id),
      householdId: String(c.household_id),
      name: String(c.name),
      type: String(c.type) as 'fixed' | 'variable',
      icon: c.icon ? String(c.icon) : undefined,
      color: c.color ? String(c.color) : undefined,
      isActive: Boolean(c.is_active),
      monthlyLimit: c.monthly_limit ? Number(c.monthly_limit) : undefined,
      createdAt: new Date(String(c.created_at)),
      updatedAt: new Date(String(c.updated_at)),
    })
  )

  const metrics = await getBudgetMetrics(householdId)
  const budgetCategories = metrics.filter((m) => m.monthlyLimit !== null)

  async function handleSaveLimit(categoryId: string, limit: number) {
    'use server'
    await updateCategoryLimit(categoryId, limit)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
        Simple Budgeting
      </h1>

      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Set Monthly Limit
        </h2>
        <BudgetLimitForm
          categories={categories}
          onSave={handleSaveLimit}
        />
      </section>

      {budgetCategories.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Budget Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetCategories.map((m) => (
              <BudgetCard key={m.categoryId} metrics={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
