# Feature Specification: Simple Budgeting (The Guardrail)

**Feature Branch**: `004-simple-budgeting`  
**Created**: 2026-05-09  
**Status**: Draft  
**Input**: User description: "Simple Budgeting (The Guardrail). It is not about setting rigid limits, but about providing a warning. Monthly Limit: Sets a maximum limit for the Variable category. Daily Spending Power: The app calculates how much money is safe to spend today based on the remaining monthly budget. Formula: Remaining Budget / Remaining Days in the Month. Overbudget Alert: A visual notification if spending in a specific category has exceeded 80% of the limit."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Monthly Budget Limit (Priority: P1)

As a user, I want to set a maximum monthly spending limit for my Variable category so that I have a guardrail to guide my discretionary spending.

**Why this priority**: Without a defined limit, the subsequent daily spending power and overbudget alerts have no basis. This is the foundational action that makes all other budgeting features meaningful.

**Independent Test**: Can be fully tested by navigating to the budgeting settings, setting a Variable category limit (e.g., Rp 2,000,000), and confirming the limit is saved and visible. This delivers immediate value by making the user explicitly aware of their intended spending boundary.

**Acceptance Scenarios**:

1. **Given** the user has not yet set a budget limit, **When** the user enters a positive amount for the Variable category monthly limit and saves, **Then** the system stores the limit and displays it in the budgeting view.
2. **Given** the user has an existing budget limit, **When** the user updates the limit to a new positive amount and saves, **Then** the system updates the stored limit and immediately recalculates any dependent metrics (Daily Spending Power, alert status).
3. **Given** the user tries to set a non-positive amount (zero or negative), **When** the user attempts to save, **Then** the system rejects the input and displays an error message indicating the limit must be a positive number.

---

### User Story 2 - View Daily Spending Power (Priority: P2)

As a user, I want to see how much money is "safe" to spend today so that I can pace my discretionary spending throughout the month and avoid running out of budget too early.

**Why this priority**: This translates the abstract monthly limit into an actionable daily guideline, which is the core "guardrail" behavior. It directly supports the user's day-to-day financial decision making.

**Independent Test**: Can be fully tested by recording spending transactions and observing the Daily Spending Power update. The value is delivered when the user sees a clear, calculated daily allowance that changes based on their actual spending behavior.

**Acceptance Scenarios**:

1. **Given** the user has set a Variable category limit of Rp 3,000,000 and the current date is the 1st of a 30-day month with no recorded spending, **When** the user views the budgeting dashboard, **Then** the Daily Spending Power displays Rp 100,000 (3,000,000 / 30).
2. **Given** the user has spent Rp 500,000 in the Variable category by the 10th of a 30-day month with a Rp 3,000,000 limit, **When** the user views the budgeting dashboard, **Then** the Daily Spending Power displays Rp 100,000 ((3,000,000 - 500,000) / 20).
3. **Given** the user has exceeded their Variable category limit (spent Rp 3,500,000) by the 15th of a 30-day month, **When** the user views the budgeting dashboard, **Then** the Daily Spending Power displays Rp 0 in a high-contrast (red) visual style, with the overbudget amount shown as supplementary information.

---

### User Story 3 - Receive Overbudget Alert (Priority: P3)

As a user, I want to receive a visual notification when my spending in a specific category has exceeded 80% of its configured limit so that I am warned before I overspend.

**Why this priority**: This provides the "warning" aspect of the guardrail. It is lower priority than setting limits and viewing daily power because it is a reactive notification rather than a proactive planning tool, but it is essential for preventing overspending.

**Independent Test**: Can be fully tested by configuring a category limit and recording spending transactions that cross the 80% threshold. The value is delivered when a clear visual alert appears on the dashboard or relevant category view.

**Acceptance Scenarios**:

1. **Given** the Variable category has a monthly limit of Rp 2,000,000 and current spending is Rp 1,500,000 (75%), **When** the user records a new Variable expense of Rp 200,000 bringing total to Rp 1,700,000 (85%), **Then** the system displays a visual overbudget alert for the Variable category.
2. **Given** the Variable category spending is at Rp 1,700,000 (85%) and an alert is already visible, **When** the user views the budgeting dashboard, **Then** the alert remains visible until the next month resets the budget cycle.
3. **Given** a category has no configured limit, **When** spending is recorded in that category, **Then** no overbudget alert is triggered regardless of spending amount.

---

### Edge Cases

- What happens when the current day is the last day of the month? The Daily Spending Power should show the exact remaining budget (division by 1).
- What happens when no budget limit has been set for a category? The Daily Spending Power should not be displayed for that category, and no overbudget alert should be triggered.
- How does the system handle spending recorded for a future date? Spending should be counted toward the current month's total if it falls within the current calendar month, regardless of when it is recorded.
- How does the system handle spending recorded for a past month? Past month spending should not affect the current month's Daily Spending Power or alert status.
- What happens when spending exactly equals 80% of the limit? The alert should trigger at >80% (strictly greater than), so exactly 80% should not trigger the alert.
- What happens on month rollover? The system should automatically reset the remaining budget calculation to the full monthly limit at the start of a new month.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to set, view, and update a positive numerical monthly spending limit for the Variable category.
- **FR-002**: System MUST calculate and display the Daily Spending Power as the remaining monthly budget divided by the number of remaining days in the current calendar month (including the current day).
- **FR-003**: System MUST display a persistent visual alert when total spending in any category with a configured limit exceeds 80% of that category's monthly limit.
- **FR-004**: System MUST recalculate the Daily Spending Power and re-evaluate overbudget alert status in real-time whenever new spending is recorded.
- **FR-005**: System MUST reset the monthly spending totals and remaining budget calculations at the start of each new calendar month.
- **FR-006**: System MUST exclude categories without a configured limit from Daily Spending Power display and overbudget alert evaluation.
- **FR-007**: System MUST calculate remaining budget as the configured monthly limit minus the sum of all spending recorded in that category within the current calendar month.
- **FR-008**: System MUST utilize Tremor's ProgressBar (with dynamic color changes: green for <80%, yellow for >=80%, red for >=100%) and Shadcn's Alert component to visualize limits and warnings within the Bento-style dashboard layout.

### Key Entities *(Simplified for MVP)*

- **Category**: The existing category entity MUST be expanded to include a new column `monthly_limit` (positive number, nullable).
- **DailySpendingPower** (Derived State): Calculated on-the-fly. Not stored in the database. If remaining budget <= 0, this value MUST be clamped to 0.
- **OverbudgetAlert** (Derived UI State): A purely visual indicator triggered dynamically on the client/server components when (Current Month Spent / limit) > 0.8. No database table should be created for alerts or acknowledgments.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can set or update a monthly Variable category limit in under 30 seconds from the budgeting view.
- **SC-002**: Daily Spending Power updates and is visible to the user within 1 second of recording a new expense.
- **SC-003**: Overbudget alert appears within 1 second of spending crossing the 80% threshold for any category.
- **SC-004**: 90% of users understand the Daily Spending Power value and its meaning on their first encounter without additional explanation.
- **SC-005**: Budget calculations and alert states are accurate 100% of the time across month boundaries.

## Assumptions

- Users already have spending categories established through the existing Cash Flow Tracker feature.
- Budget limits apply per calendar month and reset automatically on the 1st of each month.
- "Remaining Days in the Month" includes the current day; for example, on the last day of a 30-day month, the divisor is 1.
- Spending data is already being tracked by the existing cash flow system; this feature adds budgeting logic on top of existing transaction records.
- Only the Variable category is explicitly required for v1, but the architecture should support any category with a configured limit for future expansion.
- Users will access the budgeting features through the main application dashboard or a dedicated budgeting section.
- All monetary values are stored and calculated in the application's base currency without real-time currency conversion.
