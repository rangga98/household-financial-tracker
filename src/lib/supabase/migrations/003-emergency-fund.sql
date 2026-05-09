-- Emergency Fund Management Migration
-- Run this in Supabase SQL Editor after the base schema

-- 1. Add columns to profiles table for emergency fund target calculation
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married')),
ADD COLUMN IF NOT EXISTS dependents INTEGER CHECK (dependents >= 0),
ADD COLUMN IF NOT EXISTS monthly_living_expense_estimate NUMERIC(14,2) CHECK (monthly_living_expense_estimate >= 0),
ADD COLUMN IF NOT EXISTS emergency_fund_target NUMERIC(14,2) CHECK (emergency_fund_target >= 0),
ADD COLUMN IF NOT EXISTS emergency_fund_target_override NUMERIC(14,2),
ADD COLUMN IF NOT EXISTS emergency_fund_target_overridden BOOLEAN DEFAULT FALSE;

-- 2. Create financial_goals table
CREATE TABLE IF NOT EXISTS financial_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('emergency', 'sinking', 'savings', 'debt')),
  name VARCHAR(255) NOT NULL,
  target_amount NUMERIC(14,2) NOT NULL CHECK (target_amount >= 0),
  current_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 3. Add goal_id to transactions for Virtual Bucket tracking
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES financial_goals(id) ON DELETE SET NULL;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_financial_goals_household_type 
  ON financial_goals(household_id, goal_type) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_goal 
  ON transactions(goal_id) 
  WHERE goal_id IS NOT NULL;

-- 5. Enable RLS on financial_goals
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policy for financial_goals (open for demo - disable in production)
DROP POLICY IF EXISTS "Users can manage own household goals" ON financial_goals;
CREATE POLICY "Allow all for demo" ON financial_goals FOR ALL USING (true) WITH CHECK (true);

-- 6. Enable RLS on new columns in profiles (if not already enabled)
-- Note: Existing RLS policies on profiles will need to be updated to include these columns
