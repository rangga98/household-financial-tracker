# Data Model: Custom Categories

**Feature**: Custom Categories
**Date**: 2025-01-10
**Database**: Supabase PostgreSQL

## Entity: categories

### Table Definition

```sql
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

-- Indexes for performance
CREATE INDEX idx_categories_household_id ON categories(household_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_deleted_at ON categories(deleted_at);
CREATE UNIQUE INDEX idx_categories_household_name_type 
  ON categories(household_id, name, type) 
  WHERE deleted_at IS NULL;
```

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key, auto-generated | Unique identifier for the category |
| household_id | UUID | Foreign Key, NOT NULL | References households table for multi-tenancy |
| name | VARCHAR(100) | NOT NULL, max 100 chars | Human-readable category name |
| type | VARCHAR(10) | NOT NULL, CHECK IN ('expense', 'income') | Category type (mutually exclusive) |
| icon | VARCHAR(50) | NOT NULL | Lucide icon name (e.g., 'shopping-cart', 'home') |
| created_at | TIMESTAMP | DEFAULT NOW() | Timestamp when category was created |
| updated_at | TIMESTAMP | DEFAULT NOW() | Timestamp when category was last modified |
| deleted_at | TIMESTAMP | NULLABLE | Soft delete timestamp (NULL = active) |

### Validation Rules

1. **Name Uniqueness**: Category names must be unique within the same household and type (enforced by unique index with WHERE deleted_at IS NULL)
2. **Type Restriction**: Type can only be 'expense' or 'income' (enforced by CHECK constraint)
3. **Name Length**: Maximum 100 characters (enforced by VARCHAR(100))
4. **Icon Validation**: Must be a valid Lucide icon name (application-level validation)
5. **Household Scoping**: All queries must filter by household_id for RLS compliance

### Relationships

- **categories → households**: Many-to-one (categories belong to a household)
- **transactions → categories**: Many-to-one (transactions reference a category via category_id - to be implemented in transaction schema)

### State Transitions

```
[Created] → [Active] → [Soft Deleted]
    ↓            ↓           ↓
created_at   updated_at   deleted_at
```

- **Created**: Initial state when category is first created
- **Active**: Normal operational state (deleted_at IS NULL)
- **Soft Deleted**: Hidden from UI but retained in database (deleted_at IS NOT NULL)

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see categories from their household
CREATE POLICY "Users can view their household categories"
  ON categories FOR SELECT
  USING (household_id = auth.uid());

-- Policy: Users can insert categories for their household
CREATE POLICY "Users can create categories for their household"
  ON categories FOR INSERT
  WITH CHECK (household_id = auth.uid());

-- Policy: Users can update categories in their household
CREATE POLICY "Users can update categories in their household"
  ON categories FOR UPDATE
  USING (household_id = auth.uid());

-- Policy: Users can soft delete categories in their household
CREATE POLICY "Users can soft delete categories in their household"
  ON categories FOR UPDATE
  USING (household_id = auth.uid());
```

### Audit Trail

Soft delete ensures all historical transaction categorization is preserved. When a category is soft-deleted:
- `deleted_at` is set to current timestamp
- Category no longer appears in active category lists
- Historical reports can still reference the category via joins that include deleted records
- Restore functionality (if added later) can clear `deleted_at` timestamp

### TypeScript Types

```typescript
// Database type (generated from Supabase)
export type DatabaseCategory = {
  id: string;
  household_id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

// Application type (for UI)
export type Category = Omit<DatabaseCategory, 'household_id' | 'deleted_at'>;

// Form input type
export type CategoryFormData = {
  name: string;
  type: 'expense' | 'income';
  icon: string;
};

// Filter type
export type CategoryFilter = {
  type?: 'expense' | 'income' | 'all';
  search?: string;
};
```
