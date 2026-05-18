# Feature Specification: Social & Religious Allocation Module (Giving)

**Feature Branch**: `013-social-religious-allocation`  
**Created**: 2026-05-18  
**Status**: Draft  
**Input**: User description: "Calculator and automatic allocation for Zakat/Donations and the Compassion Fund (for parents or extended family)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Calculate Zakat Obligation (Priority: P1)

As a user, I want to calculate how much Zakat I owe based on my income and/or savings so that I know my exact religious giving obligation each period.

**Why this priority**: The Zakat calculator is the primary entry point and unique value of the module. Without it, no allocation logic can be set up. It delivers immediate, standalone value before any automation is configured.

**Independent Test**: Can be fully tested by opening the Giving module, selecting "Zakat Calculator," entering income or nisab-eligible assets, and verifying the computed amount matches the applicable Zakat formula (e.g., 2.5% of net savings above nisab threshold for Zakat Maal, or 1 sha' of food per person for Zakat Fitrah).

**Acceptance Scenarios**:

1. **Given** a user opens the Zakat calculator and selects "Zakat Maal," **When** they enter their total nisab-eligible savings (e.g., Rp 100.000.000) and the current nisab threshold (e.g., Rp 85 grams of gold equivalent), **Then** the system calculates 2.5% of the amount above the nisab threshold and displays the result.
2. **Given** a user selects "Zakat Fitrah," **When** they enter the number of family members and the local staple food price, **Then** the system calculates the total Zakat Fitrah amount and displays the result.
3. **Given** a user's eligible savings are below the nisab threshold, **When** they run the Zakat Maal calculator, **Then** the system displays "No Zakat due" with an explanation.
4. **Given** a user leaves required fields empty, **When** they try to calculate, **Then** the system shows a validation error.

---

### User Story 2 - Set Up Automatic Giving Allocation (Priority: P1)

As a user, I want to configure a recurring percentage or fixed amount to be automatically set aside from my income for Zakat/Donations and the Compassion Fund so that giving is consistent and not forgotten.

**Why this priority**: Automatic allocation removes the friction and forgetfulness associated with manual giving. It is the core automation feature that distinguishes this module from a simple calculator.

**Independent Test**: Can be fully tested by navigating to "Giving Settings" in their profile, entering an auto-allocation percentage for Zakat and a fixed monthly amount for the Compassion Fund, and verifying that when income is recorded the system automatically earmarks the correct amount to the Giving Virtual Bucket.

**Acceptance Scenarios**:

1. **Given** a user is on the Giving Settings page, **When** they set `zakat_auto_rate` to 2.5% of each income transaction, **Then** every subsequent income transaction triggers an automatic earmark of 2.5% to the Zakat Virtual Bucket.
2. **Given** a user sets `compassion_fixed_amount` to Rp 500.000 per month, **When** income is recorded in a month where no prior Compassion Fund earmark has occurred, **Then** the system earmarks Rp 500.000 to the Compassion Fund Virtual Bucket.
3. **Given** a user sets up both a Zakat rate and a Compassion Fund fixed amount, **When** income is recorded, **Then** both allocations are applied independently and the total earmarked amount is shown.
4. **Given** a user has not configured any giving allocation settings, **When** they visit the module, **Then** they see an empty state with a clear prompt to open Giving Settings.

---

### User Story 3 - Track the Compassion Fund (Priority: P2)

As a user, I want to see the balance and history of my Compassion Fund (money set aside for parents or extended family) so that I can manage how much has been given and how much is still available.

**Why this priority**: The Compassion Fund has a different use pattern from Zakat — it accumulates over time and is disbursed as needed. Tracking ensures users stay accountable and in control of family-support commitments.

**Independent Test**: Can be fully tested by recording a Compassion Fund contribution and a disbursement, then viewing the fund's running balance and transaction history.

**Acceptance Scenarios**:

1. **Given** a user has a Compassion Fund with Rp 1.500.000 earmarked, **When** they record a disbursement of Rp 500.000 for "Monthly allowance — Mom," **Then** the fund balance updates to Rp 1.000.000 and the transaction appears in the history.
2. **Given** a user views the Compassion Fund, **When** they open the history tab, **Then** they see all earmarks (contributions) and disbursements with dates, amounts, and notes, sorted most-recent first.
3. **Given** the Compassion Fund balance is zero and a user attempts a disbursement, **When** they submit, **Then** the system warns them the balance is insufficient but still allows the transaction if they explicitly confirm.

---

### User Story 4 - View Giving Summary Dashboard (Priority: P2)

As a user, I want to see a consolidated dashboard of all my giving activities so that I can understand my total contributions to Zakat, donations, and the Compassion Fund across a time period.

**Why this priority**: A summary view transforms individual transactions into meaningful insight — total given, breakdown by category, and year-to-date progress — supporting both spiritual accountability and financial planning.

**Independent Test**: Can be fully tested by verifying the dashboard shows correct totals and category breakdown after recording several giving transactions.

**Acceptance Scenarios**:

1. **Given** a user has recorded Zakat, donation, and Compassion Fund transactions, **When** they open the Giving dashboard, **Then** they see the year-to-date total for each category and a combined total.
2. **Given** a user selects a specific month or year filter, **When** they apply it, **Then** the dashboard updates totals to reflect only that period.
3. **Given** a user has no giving transactions in the selected period, **When** they view the dashboard, **Then** the system shows Rp 0 for all categories with an explanatory empty state.

---

### User Story 5 - Manage Giving Allocation Settings (Priority: P3)

As a user, I want to edit or remove giving allocation settings so that I can adapt my commitments as my financial situation changes.

**Why this priority**: Financial circumstances and religious obligations change. Users must be able to update or zero out allocation settings without deleting historical data.

**Independent Test**: Can be fully tested by editing the `zakat_auto_rate` profile field and verifying subsequent income transactions apply the updated rate, and by clearing the value to 0 and confirming it no longer auto-earmarks.

**Acceptance Scenarios**:

1. **Given** a user has `zakat_auto_rate` set to 2.5%, **When** they change it to 3.0%, **Then** all future income transactions use 3.0% and past allocations remain unchanged.
2. **Given** a user clears `compassion_fixed_amount` to Rp 0, **When** they save the profile settings, **Then** no future income transactions trigger a Compassion Fund earmark; historical transactions are preserved.
3. **Given** a user tries to save `zakat_auto_rate` with an invalid percentage (e.g., 0% or above 100%), **Then** the system shows a validation error.

---

### Edge Cases

- What happens when a user's income in a period is Rp 0? The system should skip percentage-based auto-allocations (resulting in Rp 0 earmark) without error.
- How does the system handle multiple income transactions in the same month? Each transaction triggers its own allocation independently; there is no deduplication.
- What if the nisab threshold changes (e.g., gold price updates)? The user must manually update the nisab value; the system does not auto-fetch commodity prices.
- What if a Compassion Fund disbursement exceeds the current balance? The system warns but allows the transaction (allowing a "deficit" balance to indicate debt-of-intention).
- How does the system behave when no giving categories exist? It shows an empty state with a prompt to set up Zakat or Compassion Fund categories.
- What if a user has Zakat Maal and Zakat Fitrah both due in the same period? Both are tracked independently and appear as separate line items.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a Zakat Maal calculator that accepts nisab-eligible asset value and nisab threshold, and returns 2.5% of the amount exceeding the threshold (zero if below threshold).
- **FR-002**: The system MUST provide a Zakat Fitrah calculator that accepts number of family members and local food price per sha', and returns the total owed.
- **FR-003**: Users MUST be able to configure giving allocation settings as static fields in their profile: `zakat_auto_rate` (percentage of income, 0–100), `compassion_fixed_amount` (fixed monthly amount, ≥ 0), and `donation_auto_rate` (optional percentage).
- **FR-004**: The system MUST automatically earmark the configured amount each time an income transaction is recorded by creating a `transfer` transaction to the relevant Giving Virtual Bucket (`Goal`). No new transaction table is created.
- **FR-005**: Users MUST be able to view the current balance and full transaction history of the Compassion Fund by querying the unified `transactions` table filtered by the Compassion Fund `goal_id`.
- **FR-006**: Users MUST be able to record a Compassion Fund disbursement as an `expense` transaction linked to the Compassion Fund `goal_id`, reducing the Virtual Bucket balance.
- **FR-007**: The system MUST display a Giving Summary dashboard using Tremor data-visualization components (e.g., `DonutChart`, `BarChart`, or `CategoryBar`) within a Bento-style card layout; ad-hoc CSS-only charts are prohibited.
- **FR-008**: Users MUST be able to edit the allocation settings in their profile; past earmarks MUST NOT be retroactively changed.
- **FR-009**: Users MUST be able to disable auto-allocation by setting a profile field to 0 without losing historical transaction data.
- **FR-010**: The system MUST validate that `zakat_auto_rate` and `donation_auto_rate` are between 0.01 and 100 (inclusive at 0 for disabled, exclusive at 0 for active), and that `compassion_fixed_amount` is a non-negative number.
- **FR-011**: The Zakat Maal and Zakat Fitrah calculation logic MUST each be implemented as standalone, pure, testable functions with no UI or database side effects, enabling TDD verification via Vitest before any UI is built.
- **FR-012**: The system MUST allow free-form giving (one-time Zakat/donation payments not tied to an allocation setting) recorded as an `expense` or `transfer` transaction to the appropriate Giving Virtual Bucket.

### Key Entities *(include if feature involves data)*

- **Profile / Household**: Reuses the existing user profile table. Extended with static giving-allocation columns: `zakat_auto_rate` (DECIMAL), `compassion_fixed_amount` (DECIMAL), `donation_auto_rate` (DECIMAL, optional). These are configuration values, not dynamic rule rows.
- **Goal (Virtual Bucket)**: Reuses the existing `goals` / Virtual Bucket concept from the Emergency Fund and Sinking Funds modules. Three giving goals exist by convention: `zakat`, `compassion_fund`, `donation`. Earmarks are `transfer` transactions **to** the goal; disbursements are `expense` transactions **from** the goal. No separate giving transaction table is created.
- **Transaction**: Reuses the existing unified `transactions` table. Auto-earmarks are recorded as `type = 'transfer'` with `goal_id` set to the relevant giving goal. Disbursements are recorded as `type = 'expense'` with `goal_id` set. This preserves the single-ledger principle and enables full reconciliation.
- **ZakatCalculatorInput**: A transient, non-persisted value object used to compute Zakat amounts (Maal or Fitrah). Not stored in the database.
- **GivingSummary**: A computed aggregate (not a stored entity) derived from `transactions` filtered by giving `goal_id`s for a given time period, broken down by category.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can calculate their Zakat obligation in under 1 minute from first opening the module.
- **SC-002**: Zakat Maal and Zakat Fitrah calculations are mathematically accurate to two decimal places for all valid inputs.
- **SC-003**: When an income transaction is recorded, the system earmarks the correct allocation amounts within 2 seconds (no perceptible delay for the user).
- **SC-004**: The Giving Summary dashboard displays a correct year-to-date total that matches the sum of all individual giving transactions in that period.
- **SC-005**: Users can set up a complete giving allocation rule (category + type + value) in under 2 minutes from first entering the module.
- **SC-006**: Editing or deleting an allocation rule does not alter any existing historical giving transaction records.
- **SC-007**: 90% of users who attempt to record a Compassion Fund disbursement succeed on the first attempt without encountering a blocking error.

## Assumptions

- The nisab threshold (gold-equivalent value in local currency) is entered manually by the user; the system does not fetch live commodity prices.
- Zakat Fitrah calculation uses the formula: `Number of Family Members × 1 sha' × Local Staple Food Price`, where 1 sha' ≈ 2.5 kg (the user may override this weight if local scholarly guidance differs).
- Currency formatting follows the existing application locale (Indonesian Rupiah, Rp).
- Giving allocations operate within a single-user context; shared family allocations are out of scope.
- Automatic earmarking is triggered by income transactions recorded in the Cash Flow module; automatic bank sync is out of scope.
- The Compassion Fund is a single, unified bucket; users who wish to track multiple family recipients do so via the note field rather than separate sub-buckets.
- Giving transactions are kept entirely separate from the monthly budget categories defined in the Simple Budgeting module to avoid double-counting.
- Donation (non-Zakat) giving follows no fixed formula and is entered manually as a fixed amount or percentage rule.
- Historical giving transaction records are never deleted, even when allocation rules are removed; they are preserved for audit and personal accountability.
