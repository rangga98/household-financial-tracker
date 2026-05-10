# Quickstart: Custom Categories

**Feature**: Custom Categories
**Date**: 2025-01-10

## Overview

This quickstart guide provides the essential information to implement the Custom Categories feature. For detailed specifications, see [spec.md](./spec.md). For data model details, see [data-model.md](./data-model.md).

## Prerequisites

- Next.js App Router project setup
- Supabase PostgreSQL database configured
- Shadcn/ui components installed
- Lucide React icons installed
- Vitest and React Testing Library configured

## Implementation Steps

### 1. Database Setup

Run the SQL migration to create the `categories` table:

```sql
-- See data-model.md for complete schema
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income')),
  icon VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

Apply RLS policies (see data-model.md for complete policies).

### 2. Create Database Client Functions

Create `src/lib/supabase/categories.ts`:

```typescript
import { supabase } from './client';

export type Category = {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  created_at: string;
  updated_at: string;
};

export async function getCategories(householdId: string, filter?: { type?: 'expense' | 'income', search?: string }): Promise<Category[]> {
  let query = supabase
    .from('categories')
    .select('*')
    .eq('household_id', householdId)
    .is('deleted_at', null);

  if (filter?.type) {
    query = query.eq('type', filter.type);
  }

  if (filter?.search) {
    query = query.ilike('name', `%${filter.search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function createCategory(category: { name: string, type: 'expense' | 'income', icon: string }, householdId: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ ...category, household_id: householdId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, updates: Partial<{ name: string, type: 'expense' | 'income', icon: string }>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function softDeleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}
```

### 3. Create Validation Utilities

Create `src/lib/utils/category-validation.ts`:

```typescript
export function validateCategoryName(name: string): { valid: boolean, error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Category name is required' };
  }
  if (name.length > 100) {
    return { valid: false, error: 'Category name must be 100 characters or less' };
  }
  return { valid: true };
}

export function validateIconName(icon: string): { valid: boolean, error?: string } {
  // Add Lucide icon validation if needed
  if (!icon || icon.trim().length === 0) {
    return { valid: false, error: 'Icon is required' };
  }
  return { valid: true };
}
```

### 4. Create Server Actions

Create `src/app/categories/actions/create.ts`:

```typescript
'use server';

import { createCategory } from '@/lib/supabase/categories';
import { validateCategoryName, validateIconName } from '@/lib/utils/category-validation';

export async function createCategoryAction(formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as 'expense' | 'income';
  const icon = formData.get('icon') as string;
  const householdId = formData.get('householdId') as string;

  const nameValidation = validateCategoryName(name);
  if (!nameValidation.valid) {
    return { error: nameValidation.error };
  }

  const iconValidation = validateIconName(icon);
  if (!iconValidation.valid) {
    return { error: iconValidation.error };
  }

  try {
    const category = await createCategory({ name, type, icon }, householdId);
    return { success: true, category };
  } catch (error) {
    console.error(JSON.stringify({ event: 'CATEGORY_CREATE_FAIL', error }));
    return { error: 'Failed to create category' };
  }
}
```

Create similar actions for update and delete.

### 5. Create UI Components

#### IconPicker Component
Create `src/components/features/categories/IconPicker.tsx` using Shadcn/ui components and Lucide icons.

#### CategoryForm Component
Create `src/components/features/categories/CategoryForm.tsx` using Shadcn/ui Form, Input, Select components.

#### CategoryList Component
Create `src/components/features/categories/CategoryList.tsx` to display categories with mobile-first responsive design.

### 6. Create Page

Create `src/app/categories/page.tsx`:

```typescript
import { getCategories } from '@/lib/supabase/categories';
import { CategoryList } from '@/components/features/categories/CategoryList';

export default async function CategoriesPage() {
  const categories = await getCategories(/* householdId from auth */);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <CategoryList categories={categories} />
    </div>
  );
}
```

### 7. Add Tests

Write unit tests for validation utilities in `src/lib/utils/category-validation.test.ts`.

Write integration tests for CategoryForm and CategoryList in their respective `.test.tsx` files.

### 8. Mobile-First Responsive Design

Ensure all components follow mobile-first design:
- Use Tailwind's fluid stacking for mobile
- 44x44px minimum touch targets
- Bottom Navigation Bar and FAB for mobile
- Bento grid layout for tablets (`md:`) and desktops (`lg:`, `xl:`)

## Key Implementation Notes

- **Soft Delete**: Use `deleted_at` timestamp instead of hard delete to preserve audit trail
- **Icon Selection**: Use curated Lucide icon list for consistent UI
- **Type Restriction**: Categories are strictly expense or income (no "both" type)
- **RLS**: All queries must be scoped to household_id
- **TDD**: Write tests before implementation code
- **Shadcn/ui**: Use Shadcn/ui for all interactive components (forms, modals, buttons)

## Success Criteria

- Users can create a new custom category in under 30 seconds
- Users can edit an existing category in under 20 seconds
- 95% of users successfully complete category creation on first attempt without errors
- Category list loads within 2 seconds for users with up to 100 categories
- Category names are validated and errors displayed within 1 second
