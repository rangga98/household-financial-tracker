-- Migration 008: Education Costs & Sinking Funds
-- Extends financial_goals table with target_date and description columns
-- No new tables — reuses existing Virtual Bucket pattern from 003-emergency-fund.sql

-- 1. Add target_date and description to financial_goals
ALTER TABLE financial_goals
ADD COLUMN IF NOT EXISTS target_date DATE,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Add notes column to transactions (for contribution notes)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Index for sinking fund queries by household
CREATE INDEX IF NOT EXISTS idx_financial_goals_sinking
  ON financial_goals(household_id, goal_type, target_date)
  WHERE deleted_at IS NULL AND goal_type = 'sinking';
