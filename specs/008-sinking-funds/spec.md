# Feature Specification: Education Costs & Sinking Funds Module

**Feature Branch**: `008-sinking-funds`  
**Created**: 2026-05-11  
**Status**: Draft  
**Input**: User description: "Education Costs & Sinking Funds Module. The focus of this module is to set aside funds for large, scheduled future expenses. You can create sinking funds for specific goals such as buying a car, renovating your home, or taking a vacation. There is a special calculator for education funds because it requires factoring in inflation. The calculation uses the formula: $Future Value = Current Cost \\times (1 + Inflation)^{Years}$."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Sinking Fund (Priority: P1)

As a user, I want to create a sinking fund for a large future expense so that I can systematically set aside money toward a specific goal.

**Why this priority**: Creating the fund is the foundational step. Without it, no tracking or progress monitoring can occur. This is the primary entry point for the entire module.

**Independent Test**: Can be fully tested by opening the sinking funds page, clicking "New Fund," filling in the form with a name, target amount, and target date, and verifying the fund appears in the list.

**Acceptance Scenarios**:

1. **Given** the user is on the sinking funds page, **When** they click "Create Fund" and enter a name (e.g., "New Car"), target amount (e.g., Rp 150.000.000), and target date (e.g., 2028-12-31), **Then** the fund is saved and appears in their fund list with 0% progress.
2. **Given** the user is creating a fund, **When** they leave the target amount or target date empty, **Then** the system shows a validation error and prevents creation.
3. **Given** the user has created a fund, **When** they view the fund list, **Then** they see the fund name, target amount, current saved amount, and visual progress bar.

---

### User Story 2 - Track Sinking Fund Progress (Priority: P1)

As a user, I want to see the progress of all my sinking funds at a glance so that I know how close I am to each goal and can adjust my savings behavior.

**Why this priority**: Progress tracking is the core value proposition. It converts raw data into actionable insight and motivates continued contributions.

**Independent Test**: Can be fully tested by navigating to the sinking funds dashboard and verifying that each fund displays percentage complete, amount remaining, and a visual indicator (e.g., progress bar or ring).

**Acceptance Scenarios**:

1. **Given** a user has one or more sinking funds, **When** they open the sinking funds page, **Then** they see each fund's progress as a percentage and remaining amount needed.
2. **Given** a user has a fund with target Rp 50.000.000 and current balance Rp 10.000.000, **When** they view the fund, **Then** the progress shows 20% complete and Rp 40.000.000 remaining.
3. **Given** a fund has passed its target date but is not fully funded, **When** the user views the fund, **Then** the system visually indicates the fund is overdue.

---

### User Story 3 - Calculate Education Costs with Inflation (Priority: P2)

As a user planning for a child's education, I want to calculate the future cost of education factoring in inflation so that I can set an accurate savings target.

**Why this priority**: Education costs are uniquely sensitive to inflation, making a standard sinking fund insufficient without forward-looking cost projection. This calculator differentiates education funds from generic goals.

**Independent Test**: Can be fully tested by opening the education calculator, entering current cost, years until needed, and inflation rate, and verifying the computed future value matches the formula $Future Value = Current Cost \\times (1 + Inflation)^{Years}$.

**Acceptance Scenarios**:

1. **Given** a user enters current education cost Rp 50.000.000, 10 years until needed, and 5% annual inflation, **When** they submit the calculator, **Then** the system displays the future cost of approximately Rp 81.444.730.
2. **Given** a user uses the education calculator, **When** they see the result, **Then** they have the option to create a new sinking fund pre-filled with the calculated future value as the target amount.
3. **Given** a user leaves any required field empty in the education calculator, **When** they try to calculate, **Then** the system shows a validation error.

---

### User Story 4 - Record Contributions to a Sinking Fund (Priority: P2)

As a user, I want to add money to an existing sinking fund so that I can incrementally build toward my goal.

**Why this priority**: Contributions are how progress moves from 0% to 100%. Without this, the fund is static and loses motivational value.

**Independent Test**: Can be fully tested by selecting a fund, entering a contribution amount, and confirming the fund's current balance and progress percentage update accordingly.

**Acceptance Scenarios**:

1. **Given** a user has a sinking fund with a current balance of Rp 0, **When** they record a contribution of Rp 5.000.000, **Then** the fund's current balance updates to Rp 5.000.000 and progress recalculates.
2. **Given** a user records a contribution, **When** the contribution is saved, **Then** the system logs the date, amount, and optionally a note for the contribution.
3. **Given** a user attempts to enter a negative contribution amount, **When** they submit, **Then** the system rejects the input with a validation error.

---

### User Story 5 - Manage (Edit/Delete) Sinking Funds (Priority: P3)

As a user, I want to edit the details of a sinking fund or delete it entirely so that I can adapt to changing circumstances.

**Why this priority**: Life changes — goals shift, timelines move, or plans are cancelled. This provides flexibility without requiring users to recreate funds from scratch.

**Independent Test**: Can be fully tested by selecting a fund, editing its name or target amount, and verifying the changes reflect in the fund list. Also test deleting a fund and confirming it disappears.

**Acceptance Scenarios**:

1. **Given** a user has an existing sinking fund, **When** they edit the target amount or target date, **Then** the system updates the fund and recalculates progress.
2. **Given** a user chooses to delete a sinking fund, **When** they confirm the deletion, **Then** the goal is soft-deleted (marked as archived) and all linked transactions remain intact in the transactions table; the money is not "lost" from the application's accounting universe.
3. **Given** a user edits a fund, **When** they clear a required field (name, target amount, target date), **Then** the system prevents the update with a validation error.

---

### Edge Cases

- What happens when a user contributes more than the target amount? The fund should show >100% progress and allow the user to adjust the target or celebrate completion.
- How does the system handle a target date in the past? The fund should be flagged as overdue with a visual indicator.
- What if the inflation rate entered is negative? The calculator should accept it and compute a lower future value (deflation scenario).
- How does the system behave when there are no sinking funds? It should show an empty state with a clear call-to-action to create the first fund.
- What happens to contribution history when a fund is edited? The history should be preserved unless the fund is deleted.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to create a sinking fund with a name, target amount, target date, and optional description.
- **FR-002**: The system MUST display a list of all user sinking funds with real-time progress (percentage and amount remaining).
- **FR-003**: The system MUST provide an education cost calculator that computes $Future Value = Current Cost \\times (1 + Inflation)^{Years}$.
- **FR-004**: Users MUST be able to record contributions to any sinking fund with an amount, date, and optional note.
- **FR-005**: Users MUST be able to edit a sinking fund's name, target amount, target date, and description.
- **FR-006**: Users MUST be able to delete a sinking fund, including the option to confirm deletion to prevent accidental loss.
- **FR-007**: The system MUST visually indicate when a fund's target date has passed but the target amount has not been reached.
- **FR-008**: The system MUST allow users to create a sinking fund directly from the education calculator, pre-filling the target amount with the computed future value.
- **FR-009**: The system MUST validate that target amount and contribution amounts are positive numbers.
- **FR-010**: The UI MUST be built using Tremor data-visualization components (e.g., `ProgressBar`) and shadcn/ui base components; no ad-hoc CSS-only progress indicators.
- **FR-011**: The inflation formula ($Future Value = Current Cost \\times (1 + Inflation)^{Years}$) MUST be implemented as a standalone, pure, testable function with no UI or database side effects, enabling TDD verification.

### Key Entities *(include if feature involves data)*

- **Goal**: Represents a savings goal (sinking fund). Reuses the existing Virtual Bucket concept from the Emergency Fund module. Attributes: name, target_amount, current_amount, target_date, description, goal_type (`sinking_fund` | `emergency_fund`), is_deleted (soft delete flag), created_at, updated_at.
- **Transaction**: Existing transactions table reused for contributions. A contribution is recorded as a transaction with `type = 'expense'` or `'transfer'` and a linked `goal_id`. No new table is created.
- **EducationCostEstimate**: A computed value produced by the education calculator. Not persisted as a standalone entity; results may be passed directly into Goal creation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a sinking fund in under 1 minute from the first page load.
- **SC-002**: The education cost calculator produces mathematically accurate results matching $Current Cost \\times (1 + Inflation)^{Years}$ to two decimal places.
- **SC-003**: Users can view all sinking funds and their progress on a single screen without scrolling on a standard desktop viewport.
- **SC-004**: 90% of users successfully create their first sinking fund on the first attempt without encountering validation errors.
- **SC-005**: Fund progress updates immediately (within 1 second) after a contribution is recorded.
- **SC-006**: Users can navigate from the education calculator to a pre-filled fund creation form in two clicks or fewer.

## Assumptions

- Inflation rate for education costs defaults to a country-specific or globally accepted average (e.g., 5% annually) if the user does not provide one.
- Sinking funds are tracked independently from monthly budget categories and do not directly affect the cash flow module.
- Contributions are entered manually by the user; automated bank synchronization is out of scope.
- The module operates in a single-user context; shared or family goals are out of scope.
- Currency formatting follows the existing application's locale settings (assumed Indonesian Rupiah based on project context).
- The target date is stored as a date (not datetime) and interpreted as the end of that day for timeline calculations.
- Education fund calculations are one-time projections; the system does not track or update them automatically over time unless the user re-runs the calculator.
