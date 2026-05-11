# Research: Financial Freedom Module

**Phase**: 0 | **Date**: 2026-05-11 | **Feature**: Financial Freedom Module

## Decisions

### 1. Data Storage Strategy (YAGNI Compliance)

- **Decision**: Store only input variables in the existing `profiles` table. FI Projection is derived state computed in real-time.
- **Rationale**: The spec explicitly mandates FI Projection as Derived State. Adding a `fi_projections` table would violate YAGNI and KISS. The existing `profiles` table already stores user-level configuration (emergency fund fields), so adding FI-related columns is consistent with the established pattern.
- **Alternatives considered**: Separate `fi_profiles` table (rejected — unnecessary indirection for 5-6 columns); `fi_projections` table (rejected — derived state must not be persisted).

### 2. Years to FI Calculation Formula

- **Decision**: Use the standard FIRE compound-interest-with-contributions formula.
- **Rationale**: This is the community-standard formula used by Mr. Money Mustache, FIRECalc, and other FIRE tools. It produces accurate results within the ±1 year tolerance required by SC-003.
- **Formula**:
  - `annualIncome = annualExpenses / (1 - savingsRate)`
  - `annualSavings = annualIncome * savingsRate`
  - If `currentNetWorth >= fiNumber`: already FI
  - If `savingsRate <= 0`: unreachable
  - `yearsToFI = ln((r * fiNumber + annualSavings) / (r * currentNetWorth + annualSavings)) / ln(1 + r)`
  - Where `r = expectedAnnualReturn` (as decimal, e.g., 0.07)
- **Alternatives considered**: Simple linear savings (rejected — ignores compound growth); monthly compounding (rejected — over-engineered for a projection tool, annual compounding is the FIRE community standard).

### 3. Year-by-Year Trajectory Generation

- **Decision**: Generate trajectory as an array of `{ year, age, netWorth }` objects up to the FI year.
- **Rationale**: Simple loop calculation that feeds directly into Tremor `AreaChart`. Each year's net worth = previous year × (1 + r) + annualSavings. Stops when netWorth >= fiNumber.
- **Alternatives considered**: Store trajectory in state (rejected — cheap to recompute, no need for persistence).

### 4. Component Architecture

- **Decision**: Server Component for data fetching + Client Component for interactivity.
- **Rationale**: Aligns with Constitution Article V (Serverless/Zero-Cost) and existing project patterns. The FI profile data is fetched server-side; the dashboard with charts and editable inputs is a Client Component.
- **Alternatives considered**: Full client-side with API routes (rejected — unnecessary network round-trips for simple data).

### 5. Pre-Population Source for Annual Expenses

- **Decision**: Derive from existing budget/category data when available, fall back to manual input.
- **Rationale**: FR-010 requires pre-population. The existing budgeting feature has category data with fixed/variable types. Summing fixed + variable monthly limits gives a reasonable annual expense estimate.
- **Alternatives considered**: Cash flow transaction aggregation (rejected — volatile month-to-month; budget limits are more stable for FI planning).
