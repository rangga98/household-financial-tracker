# Feature Specification: Net Worth Tracker

**Feature Branch**: `[009-net-worth-tracker]`  
**Created**: 2026-05-12  
**Status**: Draft  
**Input**: User description: "Net Worth Tracker This module is designed to track your true net worth—that is, what remains after all debts are paid off. The system will categorize Current Assets (cash, savings, stocks), Non-Current Assets (home, vehicle), and Liabilities (outstanding mortgage, credit card bills). The main calculation is: Net Worth = Total Assets - Total Liabilities."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add and Categorize Assets (Priority: P1)

As a user, I want to record all my assets categorized as Current or Non-Current so that the system can compute my total asset value accurately.

**Why this priority**: Asset entry is the foundational step of net worth tracking. Without accurate asset data, the net worth calculation is meaningless.

**Independent Test**: Can be fully tested by adding assets with different types (Current and Non-Current) and verifying they appear correctly categorized in the asset list.

**Acceptance Scenarios**:

1. **Given** the user is on the net worth page, **When** they click "Add Asset" and enter a name (e.g., "Emergency Savings"), amount (e.g., Rp 50.000.000), and select type "Current Asset", **Then** the asset is saved and appears under the Current Assets section.
2. **Given** the user is adding an asset, **When** they select type "Non-Current Asset" (e.g., "House" with value Rp 500.000.000), **Then** it appears under the Non-Current Assets section.
3. **Given** the user attempts to save an asset with an empty name, zero/negative amount, or no type selected, **When** they submit, **Then** the system shows a validation error and prevents creation.

---

### User Story 2 - Add and Categorize Liabilities (Priority: P1)

As a user, I want to record all my liabilities (debts) so that the system can compute how much I truly owe and factor it into my net worth.

**Why this priority**: Liabilities directly reduce net worth. Without liability tracking, the net worth figure would be inflated and misleading.

**Independent Test**: Can be fully tested by adding liabilities and verifying they appear in the liability list and reduce the net worth calculation.

**Acceptance Scenarios**:

1. **Given** the user is on the net worth page, **When** they click "Add Liability" and enter a name (e.g., "Home Mortgage"), amount (e.g., Rp 200.000.000), **Then** the liability is saved and appears in the Liabilities section.
2. **Given** the user is adding a liability, **When** they enter a name (e.g., "Credit Card Balance") and amount (e.g., Rp 3.500.000), **Then** it is saved and displayed in the liability list.
3. **Given** the user attempts to save a liability with an empty name or zero/negative amount, **When** they submit, **Then** the system shows a validation error and prevents creation.

---

### User Story 3 - View Net Worth Summary (Priority: P1)

As a user, I want to see my net worth calculated and displayed clearly so that I understand my overall financial position at a glance.

**Why this priority**: This is the core value proposition of the module. The user wants to know "what remains after all debts are paid off" — the single most important metric this module delivers.

**Independent Test**: Can be fully tested by adding assets and liabilities and verifying the dashboard displays Total Current Assets, Total Non-Current Assets, Total Assets, Total Liabilities, and Net Worth (= Total Assets - Total Liabilities).

**Acceptance Scenarios**:

1. **Given** the user has added assets totaling Rp 100.000.000 and liabilities totaling Rp 30.000.000, **When** they view the net worth summary, **Then** the system displays Net Worth = Rp 70.000.000.
2. **Given** the user views the summary, **When** they look at the breakdown, **Then** they see separate totals for Current Assets, Non-Current Assets, and Liabilities.
3. **Given** the user has no liabilities, **When** they view the summary, **Then** Net Worth equals Total Assets and is displayed positively.
4. **Given** the user has more liabilities than assets (Total Assets < Total Liabilities), **When** they view the summary, **Then** Net Worth is displayed as a negative number (in red) to indicate debt exceeds assets.

---

### User Story 4 - Track Net Worth Over Time (Priority: P2)

As a user, I want to see how my net worth changes over time so that I can measure my financial progress and identify trends.

**Why this priority**: A single net worth snapshot is useful, but tracking changes over time reveals whether the user is building wealth or falling behind. This provides long-term motivation and insight.

**Independent Test**: Can be fully tested by recording multiple net worth item value updates over different dates and verifying the system displays a trend using a Tremor AreaChart or BarChart.

**Acceptance Scenarios**:

1. **Given** the user has updated their net worth item values over several months, **When** they view the net worth history, **Then** they see a trend visualization of net worth values for each recorded date, rendered using a Tremor AreaChart or BarChart.
2. **Given** the user views the history, **When** they select a specific past date, **Then** they see the exact asset and liability values that were recorded on that date.
3. **Given** the user has only recorded values once, **When** they view the history, **Then** the system shows a single data point with a message indicating more data will appear as they update values over time.

---

### User Story 5 - Edit and Delete Assets and Liabilities (Priority: P2)

As a user, I want to update or remove assets and liabilities when my financial situation changes so that my net worth stays accurate.

**Why this priority**: Financial situations change — property values fluctuate, debts get paid down, new assets are acquired. This ensures the module remains useful over time without forcing the user to recreate entries.

**Independent Test**: Can be fully tested by editing a net worth item's amount and verifying the net worth recalculates, and by soft-deleting an item and confirming it no longer appears in the active summary while historical snapshots remain intact.

**Acceptance Scenarios**:

1. **Given** the user has an existing asset (e.g., "Savings Account" with Rp 20.000.000), **When** they edit the amount to Rp 25.000.000, **Then** the asset updates and the net worth summary recalculates immediately.
2. **Given** the user chooses to delete a net worth item, **When** they confirm deletion, **Then** the item is soft-deleted (marked as inactive, is_active = false), removed from the active list, and net worth recalculates to reflect the change while all historical snapshots remain intact.
3. **Given** the user edits an entry and clears a required field (name or amount), **When** they submit, **Then** the system prevents the update with a validation error.

---

### Edge Cases

- What happens when a user has no assets or liabilities? The system should display an empty state with zero values and a clear call-to-action to add the first entry.
- How does the system handle a negative net worth? The net worth should be displayed as a negative value (in red) to clearly indicate the user is "underwater" — liabilities exceed assets.
- What if a user adds an asset or liability with a very large value? The system should handle large numbers safely (e.g., property values in the billions) without overflow or formatting errors.
- What happens if a user soft-deletes a net worth item that was previously used in historical snapshots? Because the system uses soft delete (is_active = false), historical snapshots preserve the item's value at the time of the snapshot, and the item is merely hidden from the current active list.
- How does the system handle duplicate names for assets or liabilities? The system should allow duplicate names but may append a subtle indicator (e.g., count) to distinguish them in the UI.
- What if a user updates an asset value on the same day multiple times? The system should record the latest value for that date, replacing the previous snapshot for that day.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to add a net worth item with a name, amount, and type (CURRENT_ASSET, NON_CURRENT_ASSET, or LIABILITY).
- **FR-002**: The system MUST calculate and display Total Current Assets as the sum of all items with type CURRENT_ASSET.
- **FR-003**: The system MUST calculate and display Total Non-Current Assets as the sum of all items with type NON_CURRENT_ASSET.
- **FR-004**: The system MUST calculate and display Total Assets as the sum of Total Current Assets and Total Non-Current Assets.
- **FR-005**: The system MUST calculate and display Total Liabilities as the sum of all items with type LIABILITY.
- **FR-006**: The system MUST calculate and display Net Worth using the formula: Net Worth = Total Assets - Total Liabilities.
- **FR-007**: Users MUST be able to view a net worth summary dashboard that shows all totals (Current Assets, Non-Current Assets, Total Assets, Total Liabilities, Net Worth) in a single view.
- **FR-008**: Users MUST be able to edit the name, amount, and type of any existing net worth item.
- **FR-009**: Users MUST be able to soft-delete any existing net worth item, marking it as inactive (is_active = false) without removing historical data.
- **FR-010**: The system MUST validate that item names are non-empty and amounts are positive numbers greater than zero.
- **FR-011**: The system MUST record a snapshot of the user's net worth each time values are updated, enabling historical tracking.
- **FR-012**: Users MUST be able to view a history of their net worth over time, rendered using Tremor AreaChart or BarChart components.
- **FR-013**: The system MUST visually distinguish between positive and negative net worth (e.g., green for positive, red for negative).

### Key Entities *(include if feature involves data)*

- **NetWorthItem**: Represents a single financial entry that can be an asset or a liability. Attributes: name, amount, type (`CURRENT_ASSET`, `NON_CURRENT_ASSET`, or `LIABILITY`), is_active (soft delete flag), created_at, updated_at.
- **NetWorthSnapshot**: Represents a point-in-time record of the user's complete financial position. Attributes: snapshot_date, total_current_assets, total_non_current_assets, total_assets, total_liabilities, net_worth, created_at.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add their first asset or liability in under 1 minute.
- **SC-002**: The net worth calculation (Total Assets - Total Liabilities) is always mathematically accurate to two decimal places.
- **SC-003**: The net worth summary updates immediately (within 1 second) after any asset or liability is added, edited, or deleted.
- **SC-004**: Users can view their complete net worth breakdown on a single screen without scrolling on a standard desktop viewport.
- **SC-005**: 90% of users successfully add their first asset or liability on the first attempt without encountering validation errors.
- **SC-006**: Users can view at least 12 months of net worth history without performance degradation.

## Assumptions

- Asset and liability values are entered manually by the user; automated bank or property valuation integration is out of scope.
- Asset values are recorded as current estimated market values, not purchase prices.
- Currency formatting follows the existing application's locale settings (assumed Indonesian Rupiah based on project context).
- The module operates in a single-user context; shared or household-level net worth aggregation across multiple accounts is out of scope.
- Net worth snapshots are taken automatically whenever the user updates any asset or liability value.
- Historical snapshots are immutable; editing a current asset does not retroactively change past snapshots.
- Only one snapshot is stored per day; multiple updates on the same day overwrite the day's snapshot with the latest values.
