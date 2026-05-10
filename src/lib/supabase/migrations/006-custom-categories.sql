-- Migration 006: Custom Categories
-- Adds soft-delete support and RLS policies for category management

-- 1. Add deleted_at for soft delete
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Create indexes for custom categories queries
CREATE INDEX IF NOT EXISTS idx_categories_deleted_at ON categories(deleted_at)
WHERE deleted_at IS NULL;

-- 3. Update unique constraint to respect soft delete
-- Drop old index if exists and recreate with deleted_at filter
DROP INDEX IF EXISTS idx_categories_household_name;
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_household_name_unique
ON categories(household_id, name)
WHERE deleted_at IS NULL;

-- 4. Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for categories
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their household categories" ON categories;
DROP POLICY IF EXISTS "Users can create categories for their household" ON categories;
DROP POLICY IF EXISTS "Users can update categories in their household" ON categories;
DROP POLICY IF EXISTS "Users can soft delete categories in their household" ON categories;

-- Open policies for demo (disable in production)
CREATE POLICY "Allow all for demo - categories select" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow all for demo - categories insert" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all for demo - categories update" ON categories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo - categories delete" ON categories FOR DELETE USING (true);
