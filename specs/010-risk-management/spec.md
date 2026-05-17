# Feature Specification: Risk Management Module (Protection Layer)

**Feature Branch**: `010-risk-management`  
**Created**: 2026-05-17  
**Status**: Draft  
**Input**: User description: "Risk Management Module (Protection Layer) — Insurance Tracker: track premium payments and total coverage amounts to ensure sufficient funds for family if primary breadwinner is gone. Health Budgeting: Track routine healthcare expenses not covered by insurance or BPJS."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Insurance Policies & View Total Coverage (Priority: P1)

A household member opens the Risk Management module and registers all active insurance policies — life insurance, vehicle insurance, etc. For each policy they record the insurer name, policy type, coverage amount, premium amount, and renewal/due date. The module instantly shows the **total coverage amount** across all policies and compares it against a user-defined family protection target so they can see at a glance whether the household is adequately protected.

**Why this priority**: This is the core value proposition of the Insurance Tracker. Without knowing total coverage, users cannot make informed protection decisions. Everything else (premium tracking, health budgeting) is secondary.

**Independent Test**: Can be fully tested by adding 2–3 insurance policies with different coverage amounts and verifying the total coverage summary and adequacy indicator reflect correct values.

**Acceptance Scenarios**:

1. **Given** no policies exist, **When** the user adds a life insurance policy (coverage: Rp 1,000,000,000; premium: Rp 500,000/month), **Then** the policy appears in the policy list and total coverage shows Rp 1,000,000,000.
2. **Given** two active policies with total coverage Rp 1,500,000,000, **When** the user sets a family protection target of Rp 2,000,000,000, **Then** the system shows a coverage gap of Rp 500,000,000 with a visual indicator (e.g., amber/red status).
3. **Given** an active policy, **When** the user deactivates it, **Then** it is excluded from the total coverage calculation and the list reflects the updated total.
4. **Given** an active policy, **When** the user edits the coverage amount, **Then** the total coverage summary updates immediately.

---

### User Story 2 - Track Premium Payment Status & Due Dates (Priority: P2)

A user views the Insurance Tracker and sees a clear list of all upcoming premium payments with their due dates. They can mark a payment as paid, which records the payment date and updates the status. Overdue payments are visually flagged so the user knows immediately which policies are at risk of lapsing.

**Why this priority**: Missed premium payments cause policy lapses — a critical failure in the protection layer. Tracking due dates is the most actionable day-to-day use of the Insurance Tracker.

**Independent Test**: Can be fully tested by adding a policy with a monthly premium, advancing to the due date, verifying the status shows "Upcoming" and then "Overdue", and marking it as paid to confirm status changes to "Paid".

**Acceptance Scenarios**:

1. **Given** a policy with a monthly premium due on the 15th, **When** the user views the tracker before the due date, **Then** the premium shows status "Upcoming" with days remaining.
2. **Given** a premium due date has passed without payment, **When** the user views the tracker, **Then** the payment is flagged as "Overdue" with visual emphasis.
3. **Given** an upcoming premium, **When** the user taps "Mark as Paid" and confirms with today's date, **Then** the status changes to "Paid", the next due date is calculated and shown, and a payment record is persisted.
4. **Given** a policy with quarterly payments, **When** a payment is marked paid, **Then** the system automatically generates the next payment due date 3 months later.

---

### User Story 3 - Set Health Budget & Log Healthcare Expenses (Priority: P3)

A user sets a monthly out-of-pocket health budget for expenses not covered by insurance or BPJS (e.g., co-pays, pharmacy, dental, vision). Each time they incur a healthcare expense they log it with the amount, category, date, and a short note. The module shows current spending vs. the budget for the month in real time.

**Why this priority**: Health Budgeting is the second primary feature. Without logging expenses, users cannot manage their healthcare spending or identify patterns.

**Independent Test**: Can be fully tested by setting a monthly budget of Rp 500,000, logging 3 expenses totaling Rp 350,000, and confirming the spending progress bar and remaining budget reflect the correct values.

**Acceptance Scenarios**:

1. **Given** no health budget is set, **When** the user sets a monthly budget of Rp 500,000, **Then** the budget is saved and the current-month spending summary initializes at Rp 0 / Rp 500,000.
2. **Given** a monthly budget of Rp 500,000, **When** the user logs a pharmacy expense of Rp 150,000, **Then** the spending summary updates to Rp 150,000 / Rp 500,000 and the remaining budget shows Rp 350,000.
3. **Given** logged expenses totaling Rp 520,000 against a budget of Rp 500,000, **When** the user views the module, **Then** the system shows an over-budget indicator (e.g., red status) with the exceeded amount.
4. **Given** an expense was logged in error, **When** the user deletes it, **Then** the monthly total recalculates and the deleted record is soft-deleted (not permanently erased).

---

### User Story 4 - Review Healthcare Expense History (Priority: P4)

A user navigates to the health expense history and filters by month or category (e.g., "Pharmacy", "Doctor", "Dental") to understand their healthcare spending patterns over time.

**Why this priority**: Historical visibility enables informed budgeting adjustments. A user who consistently overspends on pharmacy can raise their budget or seek generic alternatives.

**Independent Test**: Can be fully tested by logging expenses across 2 months with different categories, then filtering by month and category to confirm correct subsets are returned.

**Acceptance Scenarios**:

1. **Given** expenses exist across multiple months, **When** the user filters by a specific month, **Then** only expenses from that month are displayed with a correct subtotal.
2. **Given** expenses across multiple categories, **When** the user filters by "Dental", **Then** only dental expenses appear with an accurate category total.
3. **Given** no expenses in the selected filter range, **When** the user applies the filter, **Then** an empty state message is shown instead of a blank screen.

---

### Edge Cases

- What happens when a policy's renewal date passes without the user taking action — does it remain "active" or auto-expire?
- How does the system handle a policy with a one-time (lump-sum) premium rather than recurring payments?
- What if a healthcare expense is partially reimbursed by insurance later — can the user record the reimbursement?
- What happens to premium payment history if a policy is deactivated or deleted?
- How are policies and expenses handled when there are zero or negative amounts entered?

---

## Requirements *(mandatory)*

### Functional Requirements

**Insurance Tracker**

- **FR-001**: Users MUST be able to add an insurance policy with the following attributes: policy name, insurance type (life/health/property/vehicle/other), insurer name, coverage amount, premium amount, payment frequency (monthly/quarterly/semi-annual/annual/one-time), start date, and renewal/next-due date.
- **FR-002**: System MUST calculate and display the total coverage amount across all active insurance policies.
- **FR-003**: Users MUST be able to set a family protection target (desired total coverage amount), and the system MUST compare it against total active coverage showing a gap or surplus.
- **FR-004**: System MUST display premium payment status for each policy: Upcoming (due within 30 days), Overdue (past due date, unpaid), or Paid (for the current cycle).
- **FR-005**: Users MUST be able to mark a premium payment as paid with a payment date; the system MUST record the payment as an `expense` transaction in the existing `transactions` table (linked to the policy via `policy_id`) and calculate the next due date using a pure utility function based on the payment frequency.
- **FR-006**: System MUST automatically flag a premium as "Overdue" when its due date has passed without a recorded payment.
- **FR-007**: Users MUST be able to view, edit, and deactivate (soft-delete) insurance policies.
- **FR-008**: System MUST preserve full premium payment history for each policy even after the policy is deactivated.

**Health Budgeting**

- **FR-009**: Users MUST be able to configure a monthly health budget by setting a `monthly_limit` on existing healthcare-type categories (reusing the Simple Budgeting mechanism — no new budget table is created).
- **FR-010**: Users MUST be able to log out-of-pocket healthcare expenses as standard `expense` transactions tagged to a healthcare-type category (e.g., Doctor, Pharmacy, Dental, Vision, Lab) — no new expense table is created.
- **FR-011**: System MUST display total health spending vs. monthly budget for the current month using a Tremor `ProgressBar`, derived from aggregating `transactions` — consistent with the existing Simple Budgeting display pattern.
- **FR-012**: System MUST flag when monthly health spending meets or exceeds the budget with an over-budget indicator (amber at ≥80%, red at ≥100%), reusing the existing `getProgressColor` utility.
- **FR-013**: Users MUST be able to view healthcare expense history filtered by month/year and/or category (using the existing transaction filtering mechanism).
- **FR-014**: Users MUST be able to edit or delete (soft-delete) logged healthcare expenses via the existing transaction management flow.
- **FR-015**: Users MAY record a reimbursement note in the transaction `description` field to document any partial insurance refund; no separate reimbursement entity is required in v1.

### Key Entities *(include if feature involves data)*

**New Table**

- **`insurance_policies`** (New): The only genuinely new table. Stores: policy name, insurance type (life/health/property/vehicle/other), insurer name, coverage amount (`NUMERIC(14,2)`), premium amount (`NUMERIC(14,2)`), payment frequency (monthly/quarterly/semi-annual/annual/one-time), start date, next-due date, status (active/inactive), notes, `household_id`, `created_at`, `updated_at`, `deleted_at`.

**Modified Existing Tables (Minimal Changes)**

- **`transactions`** (Modified — Add Column): A nullable `policy_id` UUID FK → `insurance_policies` is added. Premium payments are recorded as standard `expense` transactions with this FK populated; all other transactions leave `policy_id` NULL. No new payment table is created.
- **`financial_goals`** (Modified — Extend `goal_type`): The `goal_type` CHECK constraint is extended to include `'protection_target'`. A family protection target is stored as a single `financial_goals` row (`goal_type = 'protection_target'`), where `target_amount` holds the desired total coverage amount. No separate target table is created.

**Reused Tables (No Schema Change)**

- **`categories`** (Reused): Healthcare categories (Doctor, Pharmacy, Dental, Vision, Lab) are standard `categories` rows. Monthly health budget is configured via the existing `monthly_limit` column (added by Simple Budgeting — 004). No new budget table is created.
- **`transactions`** (Reused for health expenses): Out-of-pocket healthcare costs are recorded as standard `expense` transactions tagged to healthcare categories. No separate expense table is created.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their total insurance coverage amount and coverage status (adequate/gap) from the Risk Management dashboard without any additional navigation.
- **SC-002**: Users can identify all premium payments due within the next 30 days in under 10 seconds.
- **SC-003**: Users can log a new insurance policy in under 2 minutes.
- **SC-004**: Users can determine whether total coverage meets their family protection target immediately upon opening the Insurance Tracker.
- **SC-005**: Users can log a healthcare expense in under 60 seconds.
- **SC-006**: Users can see current-month health spending vs. budget updated in real time after each entry — no page reload required.
- **SC-007**: Zero premium payment records or health expense records are permanently lost; all financial data uses soft-delete only (consistent with the existing `transactions` audit model).
- **SC-008**: 100% of monetary values display with correct IDR formatting and no floating-point rounding errors.

---

## Assumptions

- Currency is IDR (Indonesian Rupiah), consistent with the rest of the application.
- BPJS (Badan Penyelenggara Jaminan Sosial) is the Indonesian national health insurance scheme; Health Budgeting specifically covers expenses that fall outside BPJS and private insurance coverage (out-of-pocket costs).
- **Coverage target is user-defined only (YAGNI/KISS)**: The system does NOT auto-suggest a target from household income or expense data. Automatic suggestions would introduce speculative calculation logic not warranted for v1.
- **Reminders are in-app only (Zero-Cost Serverless constraint)**: Push notifications and email reminders are explicitly out of scope for v1. Both require background job infrastructure and third-party services that conflict with the zero-cost serverless architecture. In-app status indicators (Upcoming / Overdue badges) are sufficient.
- A policy with a "one-time" payment frequency generates a single premium transaction record and does not auto-generate future due dates.
- Reimbursement notes on health expenses are informational only (stored in transaction `description`); no insurance claim workflow is triggered.
- Multi-user households share insurance policies and health budget categories under one `household_id`, consistent with the existing multi-user model.
- The monthly health budget is set per category via `monthly_limit`; if not set, the module shows expenses only (no budget comparison) — consistent with existing Simple Budgeting behavior.
- Soft-deleting an insurance policy sets `deleted_at` on the `insurance_policies` row; linked `transactions.policy_id` references are retained for audit purposes (not cleared).
- **UI Stack (mandatory)**: Coverage adequacy and health budget progress MUST use Tremor `ProgressBar` (or `Tracker`). Forms, modals, and dropdowns MUST use Shadcn/ui components. Custom styling via Tailwind CSS only.
- **TDD (mandatory)**: The next-due date calculation (`calculateNextPremiumDueDate(currentDueDate, frequency)`) and coverage gap calculation (`calculateCoverageGap(totalCoverage, protectionTarget)`) MUST be implemented as pure utility functions in `src/lib/utils/insurance.ts` with Vitest unit tests written first (Red-Green-Refactor).
