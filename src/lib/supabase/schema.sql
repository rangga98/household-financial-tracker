-- Cash Flow Tracker Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Households table
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Profiles (User Accounts)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('fixed', 'variable')),
  icon VARCHAR(50),
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  description VARCHAR(255),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_scheduled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_household_date 
  ON transactions(household_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user 
  ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category 
  ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_profiles_household 
  ON profiles(household_id);
CREATE INDEX IF NOT EXISTS idx_categories_household 
  ON categories(household_id);

-- RLS Policies (enable after creating auth setup)
-- ALTER TABLE households ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Default Categories Seed Data (run after household is created)
-- INSERT INTO categories (household_id, name, type, icon, color) VALUES
--   ('household-uuid', 'Installments', 'fixed', 'credit-card', '#ef4444'),
--   ('household-uuid', 'Electricity', 'fixed', 'zap', '#f59e0b'),
--   ('household-uuid', 'Children''s School Fees', 'fixed', 'graduation-cap', '#8b5cf6'),
--   ('household-uuid', 'Insurance', 'fixed', 'shield', '#06b6d4'),
--   ('household-uuid', 'Dining Out', 'variable', 'utensils', '#10b981'),
--   ('household-uuid', 'Hobbies', 'variable', 'gamepad-2', '#ec4899'),
--   ('household-uuid', 'Groceries', 'variable', 'shopping-cart', '#22c55e'),
--   ('household-uuid', 'Transportation', 'variable', 'car', '#3b82f6');
