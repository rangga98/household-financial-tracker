# Feature Specification: Basic Report (The Insight)

**Feature Branch**: `[005-basic-report]`  
**Created**: 2026-05-09  
**Status**: Draft  
**Input**: User description: "Basic Report (The Insight). Simple visualizations for end-of-month evaluation. Expense Breakdown: A pie chart showing the largest expense categories. Monthly Comparison: A comparison of this month's total expenses versus last month's (to detect any unusual increases in living costs). Savings Rate: The most important figure. Formula: (Total Income - Total Expenses) / Total Income * 100%. Goal: If it's above 20%, your financial foundation is very healthy."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - View Expense Breakdown (Priority: P1)

As a user, I want to see a pie chart of my largest expense categories so I can understand where my money goes each month.

**Why this priority**: Understanding spending distribution is the foundation of financial awareness and the primary reason users review end-of-month reports.

**Independent Test**: Can be fully tested by recording expenses across multiple categories and verifying the pie chart correctly shows category names, amounts, and percentages.

**Acceptance Scenarios**:

1. **Given** the user has recorded expenses across multiple categories for the current month, **When** they open the report, **Then** a pie chart displays each category's share of total expenses with labels and percentages
2. **Given** the user has recorded expenses, **When** they view the breakdown, **Then** categories are sorted by amount descending so the largest slices are immediately visible
3. **Given** the user has no expenses for the selected month, **When** they open the report, **Then** the chart area displays a friendly empty state message

---

### User Story 2 - View Savings Rate (Priority: P1)

As a user, I want to see my savings rate with a clear health indicator so I can evaluate whether my financial foundation is healthy.

**Why this priority**: The savings rate is the single most important metric for financial health; a target above 20% is a widely accepted benchmark.

**Independent Test**: Can be fully tested by recording both income and expense transactions and verifying the savings rate is calculated correctly as (Total Income - Total Expenses) / Total Income * 100% with an appropriate health indicator.

**Acceptance Scenarios**:

1. **Given** the user has recorded income and expenses for the month, **When** they view the report, **Then** the savings rate is displayed prominently with a color-coded health indicator
2. **Given** the savings rate is above 20%, **When** the metric is displayed, **Then** it is marked as "Healthy" with a positive visual treatment
3. **Given** the savings rate is between 10% and 20%, **When** the metric is displayed, **Then** it is marked as "Caution" with a warning visual treatment
4. **Given** the savings rate is below 10%, **When** the metric is displayed, **Then** it is marked as "Needs Attention" with an alert visual treatment

---

### User Story 3 - Monthly Expense Comparison (Priority: P2)

As a user, I want to compare this month's total expenses to last month's so I can detect unusual increases in living costs.

**Why this priority**: Month-over-month comparison provides early warning of lifestyle creep or unexpected cost increases, enabling timely budget adjustments.

**Independent Test**: Can be fully tested by recording expenses in two consecutive months and verifying the comparison clearly shows the direction and magnitude of change.

**Acceptance Scenarios**:

1. **Given** expenses exist for both this month and last month, **When** the user views the comparison, **Then** both totals are displayed with the absolute difference and percentage change
2. **Given** expenses increased by more than 10% month-over-month, **When** the comparison is displayed, **Then** a visual alert highlights the increase
3. **Given** no expenses exist for the previous month, **When** the user views the comparison, **Then** the previous month is shown as zero with a note that no data is available

---

### Edge Cases

#### 1. No Income Recorded (Division by Zero for Savings Rate)

**Decision**: Display savings rate as N/A with an explanatory message.

- **Business Logic**: If no income is recorded, the savings rate formula would attempt division by zero. This is a valid user state (e.g., a month with only expenses and no income logged yet).
- **UI Handling**: Display "N/A" or "No Income Data" instead of a percentage, with a subtle prompt to record income transactions.

---

#### 2. No Transactions in Selected Month

**Decision**: Show an empty state for all report sections.

- **Business Logic**: Users may view a future month or a month before they started tracking.
- **UI Handling**: Display friendly empty state messages such as "No expenses recorded this month" and "No data to compare" instead of blank charts or zeroed metrics.

---

#### 3. All Expenses in a Single Category

**Decision**: Display a single-segment pie chart.

- **Business Logic**: If a user spends entirely in one category (e.g., only "Groceries"), the pie chart should still render meaningfully.
- **UI Handling**: Render a single full pie segment with 100% label and category name. Do not crash or hide the chart.

---

#### 4. Very Small Expense Amounts Leading to Rounding to 0%

**Decision**: Show exact amounts alongside percentages.

- **Business Logic**: Small categories may round to 0% in a pie chart, making them invisible.
- **UI Handling**: Always display the absolute monetary amount next to the percentage. Categories below 1% can be grouped into an "Other" slice if there are more than 6 categories.

---

#### 5. Future-Dated Transactions in Current Month

**Decision**: Include all transactions based purely on transaction_date.

- **Business Logic**: To maintain the KISS principle, the system does not use an is_scheduled flag. Any transaction logged with a transaction_date falling within the selected calendar month is included in that month's report, regardless of whether that date is in the future.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The system MUST aggregate expenses by category for the selected calendar month, summing all transactions where type = 'expense' and transaction_date falls within the selected month
- **FR-002**: The system MUST utilize Tremor's DonutChart to display the expense breakdown, ensuring absolute amounts are visible in custom tooltips or adjacent legends
- **FR-003**: System MUST calculate total expenses for the current (selected) month
- **FR-004**: System MUST calculate total expenses for the previous calendar month
- **FR-005**: System MUST display month-over-month expense comparison showing absolute difference, percentage change, and a directional indicator (increase/decrease)
- **FR-006**: System MUST calculate savings rate using the formula: (Total Income - Total Expenses) / Total Income * 100%, rounded to 2 decimal places
- **FR-007**: The system MUST display the savings rate using Tremor's Badge or Callout components with dynamic coloring: Green ("Healthy," >20%), Yellow ("Caution," 10–20%), or Red ("Needs Attention," <10% or negative)
- **FR-008**: System MUST handle the case where total income is zero by displaying savings rate as "N/A" with an explanatory message instead of causing a division error
- **FR-010**: System MUST allow the user to select a specific month for the report, defaulting to the current month

### Key Entities *(Aggregated States — Do NOT create new DB tables)*

- **Expense Breakdown**: Derived via SQL grouping (`SELECT category_id, SUM(amount) FROM transactions WHERE type = 'expense' GROUP BY category_id`) filtered to the selected calendar month
- **Savings Rate Metric**: Derived on-the-fly using the formula: ((Total Income - Total Expenses) / Total Income) * 100
- **Monthly Comparison**: Derived by querying the transactions table for the currently selected month and the exact previous month, then calculating the absolute and percentage differences in the server component

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Report loads and renders all visualizations within 2 seconds for a month with up to 500 transactions
- **SC-002**: Savings rate calculation is mathematically accurate to 2 decimal places
- **SC-003**: Users can identify their top 3 expense categories within 5 seconds of viewing the report
- **SC-004**: Month-over-month comparison clearly flags increases greater than 10% with a visual alert
- **SC-005**: Report displays a meaningful empty state when no transactions exist for the selected month, with zero confusion reports from users

## Assumptions

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right assumptions based on reasonable defaults
  chosen when the feature description did not specify certain details.
-->

- Transaction data exists from the Cash Flow Tracker module (transactions, categories, profiles tables)
- Income and expense records use transaction_date aligned to calendar month boundaries
- Categories include name and optional color attributes for chart rendering
- Reports are generated on-demand for a user-selected month, defaulting to the current month
- All transactions with transaction_date within the selected calendar month are included, regardless of whether that date is in the future
- Currency is Indonesian Rupiah (IDR) formatted with thousands separators
- The household-level report aggregates data across both husband and wife accounts
- Negative savings rates are possible and should be displayed accurately with the "Needs Attention" indicator
- Mobile and web access are both important for v1
- Reports do not require export or download functionality in v1
