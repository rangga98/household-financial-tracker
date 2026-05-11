-- Financial Freedom Module Migration
-- Add FI-related columns to the existing profiles table

-- 1. Add FI columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS fi_annual_expenses NUMERIC(14,2) CHECK (fi_annual_expenses >= 0),
ADD COLUMN IF NOT EXISTS fi_savings_rate NUMERIC(5,4) CHECK (fi_savings_rate >= 0 AND fi_savings_rate <= 1),
ADD COLUMN IF NOT EXISTS fi_current_age INTEGER CHECK (fi_current_age >= 0),
ADD COLUMN IF NOT EXISTS fi_current_net_worth NUMERIC(14,2) CHECK (fi_current_net_worth >= 0),
ADD COLUMN IF NOT EXISTS fi_expected_return NUMERIC(5,4) CHECK (fi_expected_return >= 0);

-- 2. Set sensible default for expected return (7% is standard market return assumption)
-- Note: Run this after adding columns to set default for existing rows
UPDATE profiles SET fi_expected_return = 0.07 WHERE fi_expected_return IS NULL;

-- 3. Create index for FI queries (optional, for future filtering)
CREATE INDEX IF NOT EXISTS idx_profiles_fi_data 
  ON profiles(fi_annual_expenses, fi_savings_rate) 
  WHERE fi_annual_expenses IS NOT NULL AND fi_savings_rate IS NOT NULL;

-- 4. RLS is already enabled on profiles table from base schema
-- Existing RLS policies will automatically cover these new columns
