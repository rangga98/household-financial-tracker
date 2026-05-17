-- Migration 009: Net Worth Tracker
-- Creates net_worth_items (single table for assets + liabilities using type enum)
-- Creates net_worth_snapshots (daily aggregated history)
-- Run this in Supabase SQL Editor after the base schema (001) is applied

-- 1. Create net_worth_items table
CREATE TABLE IF NOT EXISTS net_worth_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  type VARCHAR(50) NOT NULL CHECK (type IN ('CURRENT_ASSET', 'NON_CURRENT_ASSET', 'LIABILITY')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create net_worth_snapshots table
CREATE TABLE IF NOT EXISTS net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_current_assets NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_non_current_assets NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_assets NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_liabilities NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_worth NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (household_id, snapshot_date)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_net_worth_items_household_active_type
  ON net_worth_items(household_id, is_active, type);

CREATE INDEX IF NOT EXISTS idx_net_worth_snapshots_household_date
  ON net_worth_snapshots(household_id, snapshot_date);

-- 4. Enable RLS
ALTER TABLE net_worth_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth_snapshots ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (open for demo - tighten in production)
DROP POLICY IF EXISTS "Allow all for demo" ON net_worth_items;
CREATE POLICY "Allow all for demo" ON net_worth_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for demo" ON net_worth_snapshots;
CREATE POLICY "Allow all for demo" ON net_worth_snapshots FOR ALL USING (true) WITH CHECK (true);
