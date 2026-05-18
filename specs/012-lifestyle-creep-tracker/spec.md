# Feature Specification: Lifestyle Creep Tracker

**Feature Branch**: `012-lifestyle-creep-tracker`  
**Created**: May 18, 2026  
**Status**: Draft  
**Input**: User description: "Lifestyle Creep Tracker - An analytics module that compares the percentage increase in your income versus the percentage increase in your expenses. If your expenses rise more sharply than your income, the system will issue a warning."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Income vs Expense Growth Comparison (Priority: P1)

As a user, I want to see a comparison of my income growth versus my expense growth over a selected time period so that I can understand if my spending is keeping pace with my earnings.

**Why this priority**: This is the core functionality of the feature. Without the ability to view the comparison, users cannot identify lifestyle creep patterns.

**Independent Test**: Can be fully tested by selecting a time period and viewing the percentage change displayed for both income and expenses. Delivers immediate insight into spending behavior relative to earning growth.

**Acceptance Scenarios**:

1. **Given** a user has at least two months of income and expense data, **When** they navigate to the Lifestyle Creep Tracker page and select a 6-month comparison period, **Then** they see the percentage increase/decrease for both income and expenses calculated from the first month to the last month of the period.
2. **Given** a user has insufficient data (less than 2 months), **When** they view the tracker, **Then** they see a message indicating more data is needed to perform the analysis.

---

### User Story 2 - Receive Lifestyle Creep Warning (Priority: P1)

As a user, I want to receive a clear warning when my expenses are growing faster than my income so that I can take corrective action before the pattern becomes problematic.

**Why this priority**: The warning system is the key value-add that differentiates this from simple reporting. It alerts users to potential financial issues.

**Independent Test**: Can be fully tested by simulating a scenario where expense growth percentage exceeds income growth percentage. The warning indicator should appear without requiring other features.

**Acceptance Scenarios**:

1. **Given** a user's expenses grew by 15% over the selected period while income grew by only 5%, **When** they view the tracker, **Then** they see a prominent warning indicator indicating lifestyle creep has been detected.
2. **Given** a user's income grew by 10% and expenses grew by only 3%, **When** they view the tracker, **Then** they see a positive indicator (or no warning) showing their spending is under control.
3. **Given** a user's income and expenses grew at exactly the same rate, **When** they view the tracker, **Then** they see a neutral indicator showing balanced growth.

---

### User Story 3 - Trend Visualization (Priority: P2)

As a user, I want to see visual charts showing the trend of my income and expenses over time so that I can visually identify when spending patterns changed.

**Why this priority**: Visual representation makes it easier to spot trends and patterns at a glance, enhancing the usability of the raw comparison data.

**Independent Test**: Can be tested by viewing a line chart that displays both income and expense lines over the selected time period. The chart renders independently of the warning logic.

**Acceptance Scenarios**:

1. **Given** a user has selected a 12-month period, **When** the chart renders, **Then** they see two distinct lines (one for income, one for expenses) plotted month by month with clear differentiation between the two data series.
2. **Given** a user hovers over a specific month on the chart, **When** the tooltip appears, **Then** they see the exact income and expense amounts for that month.

---

### User Story 4 - Time Period Selection (Priority: P2)

As a user, I want to select different time periods (3 months, 6 months, 12 months, custom) for the analysis so that I can analyze trends at different granularities.

**Why this priority**: Financial patterns vary by timeframe. Short periods catch recent changes, while longer periods reveal sustained trends.

**Independent Test**: Can be tested by changing the time period selector and observing that the percentage calculations and chart update to reflect the new date range.

**Acceptance Scenarios**:

1. **Given** a user is viewing 6-month data, **When** they select 12-month from a dropdown, **Then** the page recalculates percentages and refreshes the chart using the 12-month data range.
2. **Given** a user selects a custom date range, **When** they specify start and end dates, **Then** the analysis uses only data within that inclusive date range.

---

### Edge Cases

- What happens when the user has no income or expense data for the selected period? → Display "No data available" message.
- What happens when income decreased while expenses increased (worst-case lifestyle creep)? → Show critical warning with appropriate messaging.
- What happens when income growth is negative (pay cut, job loss) but expenses also decreased? → Show neutral analysis acknowledging reduced spending.
- How does the system handle missing data points within the selected period? → Use available data points for calculation and show a note about data gaps.
- What happens when the user has income but zero expenses in the baseline period? → Cannot calculate percentage change; show "Insufficient baseline data" message.
- How does the system handle currency changes or transfers between accounts? → Aggregate all income and expense transactions regardless of account for the overall trend.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST calculate the percentage change in total income between the start and end of the selected time period using the formula: ((End Income - Start Income) / Start Income) × 100.
- **FR-002**: The system MUST calculate the percentage change in total expenses between the start and end of the selected time period using the formula: ((End Expenses - Start Expenses) / Start Expenses) × 100.
- **FR-003**: The system MUST display both income and expense percentage changes in a clear, side-by-side comparison format.
- **FR-004**: The system MUST issue a visual warning when the expense growth percentage exceeds the income growth percentage by any margin.
- **FR-005**: The system MUST support predefined time period selections: 3 months, 6 months, and 12 months.
- **FR-006**: The system MUST support custom date range selection with user-defined start and end dates.
- **FR-007**: The system MUST display a line chart showing both income and expense trends over the selected time period.
- **FR-008**: The system MUST handle edge cases gracefully by displaying appropriate messages when data is insufficient or missing.
- **FR-009**: The system MUST calculate growth rates using monthly aggregated totals (sum of all income/expense transactions per month).
- **FR-010**: The system MUST exclude transfer transactions between user's own accounts from both income and expense calculations to avoid double-counting.

### Key Entities *(include if feature involves data)*

- **Lifestyle Creep Analysis**: Represents a snapshot comparison of income vs expense growth for a specific time period. Contains: period start date, period end date, income growth percentage, expense growth percentage, warning status, and trend data points.
- **Trend Data Point**: Monthly aggregated financial data for charting purposes. Contains: month/year, total income for the month, total expenses for the month.
- **Time Period Selection**: User's chosen analysis window. Contains: period type (3mo/6mo/12mo/custom), custom start date (if applicable), custom end date (if applicable).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view the income vs expense growth comparison within 3 seconds of selecting a time period.
- **SC-002**: The lifestyle creep warning appears 100% of the time when expense growth exceeds income growth.
- **SC-003**: The growth percentage calculations are accurate within 0.01% precision.
- **SC-004**: 90% of users can correctly identify whether they have lifestyle creep after viewing the tracker for the first time without additional explanation.
- **SC-005**: The chart renders without errors for all users with 2+ months of data.

## Assumptions

- Users have existing income and expense transaction data in the system (minimum 2 months).
- Income is defined as positive transactions to income-type accounts or categorized as income.
- Expenses are defined as negative transactions (expense-type accounts) or transactions categorized as expenses.
- Monthly aggregation is sufficient granularity for lifestyle creep detection.
- Users understand that percentage growth is a relative measure and may be affected by one-time windfalls or unusual expenses.
- The system has access to the existing transaction and account data from the Cash Flow Tracker feature.
