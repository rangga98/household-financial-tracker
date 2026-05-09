-- Migration 004: Simple Budgeting (The Guardrail)
-- Adds monthly_limit to categories for guardrail budgeting

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS monthly_limit NUMERIC(14,2) CHECK (monthly_limit > 0);
