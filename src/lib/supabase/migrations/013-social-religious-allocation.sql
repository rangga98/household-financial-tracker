-- Social & Religious Allocation Module (Giving)
-- Run this in Supabase SQL Editor

-- 1. Add giving columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS zakat_auto_rate NUMERIC(5,2) CHECK (zakat_auto_rate >= 0 AND zakat_auto_rate <= 100),
ADD COLUMN IF NOT EXISTS compassion_fixed_amount NUMERIC(14,2) CHECK (compassion_fixed_amount >= 0),
ADD COLUMN IF NOT EXISTS donation_auto_rate NUMERIC(5,2) CHECK (donation_auto_rate >= 0 AND donation_auto_rate <= 100);

-- 2. First, drop the old constraint (if exists)
ALTER TABLE financial_goals DROP CONSTRAINT IF EXISTS financial_goals_goal_type_check;

-- 3. Add the new constraint with ALL goal types (existing + new giving goals)
ALTER TABLE financial_goals ADD CONSTRAINT financial_goals_goal_type_check
  CHECK (goal_type IN (
    'emergency', 
    'sinking', 
    'savings', 
    'debt', 
    'protection_target', 
    'tax_obligation',
    'giving_zakat', 
    'giving_compassion', 
    'giving_donation'
  ));

-- 4. Enable RLS on new profile columns (if not already enabled)
-- Note: Existing RLS policies on profiles will need to be updated to include these columns

-- 5. Create indexes for giving goals
CREATE INDEX IF NOT EXISTS idx_financial_goals_giving_types 
  ON financial_goals(household_id, goal_type) 
  WHERE goal_type IN ('giving_zakat', 'giving_compassion', 'giving_donation');
