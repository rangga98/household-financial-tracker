-- Migration 010: Risk Management Module (Protection Layer)
-- Creates insurance_policies table
-- Adds policy_id to transactions (mirrors goal_id pattern from 003-emergency-fund.sql)
-- Extends financial_goals.goal_type CHECK to include 'protection_target'
-- Run after 009-net-worth-tracker.sql is applied

-- 1. Create insurance_policies table
CREATE TABLE IF NOT EXISTS insurance_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  insurance_type VARCHAR(50) NOT NULL CHECK (insurance_type IN ('life','health','property','vehicle','other')),
  insurer VARCHAR(255) NOT NULL,
  coverage_amount NUMERIC(14,2) NOT NULL CHECK (coverage_amount >= 0),
  premium_amount NUMERIC(14,2) NOT NULL CHECK (premium_amount > 0),
  payment_frequency VARCHAR(20) NOT NULL CHECK (payment_frequency IN ('monthly','quarterly','semi-annual','annual','one-time')),
  start_date DATE NOT NULL,
  next_due_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 2. Add policy_id to transactions (nullable FK, mirrors goal_id from 003-emergency-fund.sql)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS policy_id UUID REFERENCES insurance_policies(id) ON DELETE SET NULL;

-- 3. Extend financial_goals.goal_type CHECK to include 'protection_target'
ALTER TABLE financial_goals
DROP CONSTRAINT IF EXISTS financial_goals_goal_type_check;

ALTER TABLE financial_goals
ADD CONSTRAINT financial_goals_goal_type_check
CHECK (goal_type IN ('emergency', 'sinking', 'savings', 'debt', 'protection_target'));

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_insurance_policies_household_active
  ON insurance_policies(household_id, is_active)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_insurance_policies_next_due
  ON insurance_policies(household_id, next_due_date)
  WHERE deleted_at IS NULL AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_transactions_policy
  ON transactions(policy_id)
  WHERE policy_id IS NOT NULL;

-- 5. Enable RLS
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for demo" ON insurance_policies;
CREATE POLICY "Allow all for demo" ON insurance_policies FOR ALL USING (true) WITH CHECK (true);
