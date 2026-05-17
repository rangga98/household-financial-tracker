-- Migration 011: Tax Management & Compliance Module
-- Extends financial_goals with tax_type column and updated goal_type CHECK
-- Extends transactions with is_tax_deductible and fiscal_year columns
-- Creates tax_filing_deadlines table
-- Run after 010-risk-management.sql is applied

-- 1. Add tax_type to financial_goals (only populated when goal_type = 'tax_obligation')
ALTER TABLE financial_goals
ADD COLUMN IF NOT EXISTS tax_type VARCHAR(50)
CHECK (tax_type IN ('vehicle_registration', 'property_tax', 'custom'));

-- 2. Extend financial_goals.goal_type CHECK to include 'tax_obligation'
ALTER TABLE financial_goals
DROP CONSTRAINT IF EXISTS financial_goals_goal_type_check;

ALTER TABLE financial_goals
ADD CONSTRAINT financial_goals_goal_type_check
CHECK (goal_type IN ('emergency', 'sinking', 'savings', 'debt', 'protection_target', 'tax_obligation'));

-- 3. Extend transactions with tax deductibility columns
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS is_tax_deductible BOOLEAN DEFAULT false;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS fiscal_year INTEGER;

-- 4. Create tax_filing_deadlines table
CREATE TABLE IF NOT EXISTS tax_filing_deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  tax_type VARCHAR(50) NOT NULL CHECK (tax_type IN ('income_tax', 'custom')),
  fiscal_year INTEGER NOT NULL,
  filing_deadline DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'filed')),
  filed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_filing_deadline_household_type_year
    UNIQUE(household_id, tax_type, fiscal_year)
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_financial_goals_tax_obligation
  ON financial_goals(household_id, goal_type, target_date)
  WHERE deleted_at IS NULL AND goal_type = 'tax_obligation';

CREATE INDEX IF NOT EXISTS idx_transactions_tax_deductible
  ON transactions(household_id, fiscal_year, is_tax_deductible)
  WHERE is_tax_deductible = true;

CREATE INDEX IF NOT EXISTS idx_tax_filing_deadlines_household
  ON tax_filing_deadlines(household_id, status, filing_deadline);

-- 6. Enable RLS on tax_filing_deadlines
ALTER TABLE tax_filing_deadlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for demo" ON tax_filing_deadlines;
CREATE POLICY "Allow all for demo" ON tax_filing_deadlines FOR ALL USING (true) WITH CHECK (true);
