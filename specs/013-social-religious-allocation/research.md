# Research: Social & Religious Allocation Module (Giving)

## Decision: Zakat Calculation Implementation

**Decision**: Implement Zakat calculators as pure utility functions in `/src/lib/utils/calculations/zakat.ts`

**Rationale**:
- FR-011 requires standalone, pure, testable functions with no UI or database side effects
- Constitution mandates TDD - tests must be written before implementation
- Existing pattern in `/src/lib/utils/calculations.test.ts` shows project uses this approach
- Enables Vitest unit testing before any UI is built

**Alternatives considered**:
- Server-side calculation via API route: Rejected - adds unnecessary latency for simple math
- Database function (PL/pgSQL): Rejected - harder to test and not following existing patterns

---

## Decision: Virtual Bucket (Goal) Integration

**Decision**: Reuse existing `financial_goals` table with `goal_type = 'giving'` and subtypes

**Rationale**:
- Spec defines three giving goals: `zakat`, `compassion_fund`, `donation`
- Existing `financial_goals` table already has `goal_type` column with CHECK constraint
- Migration pattern from `003-emergency-fund.sql` shows how to extend with new goal types
- Transaction pattern with `goal_id` already exists for Virtual Bucket tracking

**Alternatives considered**:
- Separate `giving_goals` table: Rejected - violates YAGNI, duplicates existing infrastructure
- New column on transactions: Rejected - `goal_id` already provides this capability

---

## Decision: Profile Extension for Allocation Settings

**Decision**: Add columns to `profiles` table via migration: `zakat_auto_rate`, `compassion_fixed_amount`, `donation_auto_rate`

**Rationale**:
- Spec defines these as static fields in user profile (FR-003)
- Existing pattern from `003-emergency-fund.sql` shows how to add profile columns
- Values are configuration, not dynamic rules - fits profile model
- Single-user context means per-profile settings are appropriate

**Alternatives considered**:
- Separate `giving_settings` table: Rejected - over-engineering for 3 simple fields
- JSONB column: Rejected - harder to query and validate, violates existing column patterns

---

## Decision: Auto-Allocation Trigger Point

**Decision**: Trigger auto-allocation in the income transaction creation flow

**Rationale**:
- FR-004 states "every time an income transaction is recorded" triggers allocation
- Need to identify where income transactions are created (likely in cash flow component)
- The trigger should create `transfer` transactions to the giving goals

**Alternatives considered**:
- Database trigger (AFTER INSERT): Rejected - complex to debug, violates app-layer pattern
- Background job: Rejected - unnecessary complexity, FR-004 implies immediate action

---

## Decision: Dashboard Visualization

**Decision**: Use Tremor components (DonutChart, BarChart, CategoryBar) per FR-007

**Rationale**:
- Constitution mandates Shadcn/ui + Tremor for data visualization
- FR-007 explicitly requires Tremor and prohibits CSS-only charts
- Existing project uses Tremor in other dashboards (e.g., report module)

**Alternatives considered**:
- CSS-only charts: Explicitly prohibited by FR-007 and Constitution
- Chart.js or Recharts: Would require new dependency, Tremor already available

---

## Decision: Transaction Types for Giving

**Decision**: Use `type = 'transfer'` for earmarks TO goals, `type = 'expense'` for disbursements FROM goals

**Rationale**:
- Matches existing Virtual Bucket pattern from Emergency Fund
- Transfer increases goal balance, expense decreases it
- Preserves single-ledger principle per spec
- Enables full reconciliation via unified transactions table

**Alternatives considered**:
- Separate `giving_transactions` table: Rejected - violates single-ledger principle, duplicates existing capability
- `type = 'giving'` with direction column: Rejected - unnecessary complexity
