# Feature Specification: Cash Flow Tracker

**Feature Branch**: `[001-cash-flow-tracker]`  
**Created**: 2026-05-09  
**Status**: Draft  
**Input**: User description: "Cash Flow Module (The Core Engine)Main objective: To track where every rupiah goes with minimal effort (frictionless).Quick Entry: Prominent input buttons. Minimal fields: Amount, Category, Date, Short Description. Dual-User Sync: Ability to record transactions from two separate accounts (husband & wife) into a single household balance. "Fixed vs. Variable" Categorization: Fixed (Mandatory): Installments, electricity, children's school fees, insurance. Variable (Optional): Dining out, hobbies, impulse purchases. Running Balance Logic: The system automatically calculates: Ending Balance = Beginning Balance + Total In - Total Out"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Transaction Entry (Priority: P1)

As a user, I want to quickly record a transaction with minimal fields so that I can track spending without friction.

**Why this priority**: This is the core value proposition - frictionless transaction recording is essential for consistent usage.

**Independent Test**: Can be fully tested by entering a transaction with amount, category, date, and description, then verifying it appears in the transaction list.

**Acceptance Scenarios**:

1. **Given** the user is on the main dashboard, **When** they tap the prominent "Add Income" or "Add Expense" button, **Then** a minimal input form appears with fields for Amount, Category, Date, and Short Description
2. **Given** the user has filled in all required fields, **When** they tap "Save", **Then** the transaction is saved and the running balance is updated
3. **Given** the user attempts to save with empty required fields, **When** they tap "Save", **Then** validation errors appear prompting completion

---

### User Story 2 - Dual-User Account Sync (Priority: P1)

As a household with two adults, I want to record transactions from my spouse and myself into a single household balance so we can see our combined financial picture.

**Why this priority**: Core requirement for dual-user households to track shared finances.

**Independent Test**: Can be fully tested by switching between husband/wife accounts, recording transactions, and verifying all transactions appear in the unified household view.

**Acceptance Scenarios**:

1. **Given** two user accounts exist (husband and wife), **When** either user records a transaction, **Then** the transaction is attributed to that user but contributes to the shared household balance
2. **Given** the household dashboard is displayed, **When** a user views the balance, **Then** they see the combined total from both accounts
3. **Given** a user wants to filter by account, **When** they apply a filter, **Then** only transactions from the selected account are displayed

---

### User Story 3 - Fixed vs. Variable Categorization (Priority: P2)

As a user, I want to categorize expenses as Fixed (Mandatory) or Variable (Optional) so I can understand my spending patterns and identify areas for potential savings.

**Why this priority**: Enables users to distinguish between unavoidable expenses and discretionary spending for better financial planning.

**Independent Test**: Can be fully tested by creating transactions in both categories and verifying they are correctly grouped in reports.

**Acceptance Scenarios**:

1. **Given** the category selection is displayed, **When** the user selects a category, **Then** the category is labeled as either Fixed (Mandatory) or Variable (Optional)
2. **Given** Fixed categories (installments, electricity, school fees, insurance), **When** selected, **Then** they are marked as mandatory expenses
3. **Given** Variable categories (dining out, hobbies, impulse purchases), **When** selected, **Then** they are marked as optional expenses
4. **Given** the user views spending reports, **When** they select category type filter, **Then** spending is grouped by Fixed vs. Variable

---

### User Story 4 - Running Balance Calculation (Priority: P1)

As a user, I want the system to automatically calculate my ending balance so I always know my current financial position.

**Why this priority**: Provides immediate visibility into household financial health without manual calculation.

**Independent Test**: Can be fully tested by recording income and expense transactions and verifying the balance updates correctly using the formula: Ending Balance = Beginning Balance + Total In - Total Out.

**Acceptance Scenarios**:

1. **Given** a beginning balance exists, **When** income is recorded, **Then** the balance increases by the income amount
2. **Given** a beginning balance exists, **When** an expense is recorded, **Then** the balance decreases by the expense amount
3. **Given** multiple transactions occur, **When** the user views the balance, **Then** it reflects the cumulative result of all transactions
4. **Given** the user views a historical date, **When** they select a past date, **Then** the balance shown reflects the state at that point in time

---

### Edge Cases

#### 1. Negative Balance (Overdraft)

**Decision**: Allowed, displayed in red.

- **Business Logic**: The app reflects reality. If in the real world you use a credit card, go into debt, or dip into your emergency fund to cover this month's shortfall, your monthly cash balance is technically negative.
- **UI Handling**: Do not block it. Allow the balance to show a negative number to serve as a visual alert (red color). Blocking it will cause the data in the app to be out of sync with the actual state of your wallet or bank account.

---

#### 2. Future-Dated Transactions

**Decision**: Allowed; treated as "Scheduled" or "Pending".

- **Business Logic**: We often know there are recurring charges (such as Netflix or loan payments) at the end of the month. Entering them at the beginning is a common budgeting practice.
- **DB Handling**: Can be entered into the database with a future date.
- **UI Handling**: Future-dated transactions can be styled differently (e.g., 50% opacity or italicized). Alternatively, let it directly deduct from your remaining daily budget so you know the actual balance available for use today.

---

#### 3. Concurrent Transactions (Both Users Click Save Simultaneously)

**Decision**: No conflict; database handles automatically.

- **Business Logic**: Using PostgreSQL (Supabase), concurrency issues are handled natively by the database.
- **Technical Aspect**: The balance is a calculation (SUM(in) - SUM(out)) derived from the transaction table, not stored in a table prone to being overwritten. Both transactions will be saved and the dashboard will instantly update the combined balance using Supabase's real-time feature.

---

#### 4. Very Large Transaction Amounts

**Decision**: Handled safely at database level and formatted in UI.

- **Technical Logic**: Numeric columns defined as NUMERIC(14,2) or BIGINT for cents can accommodate numbers up to trillions of Rupiah without decimal precision errors.
- **UI Handling**: On the main dashboard, large numbers can be simplified (e.g., "Rp 1.5 M"). In transaction details table, display the full number using tabular-nums.

---

#### 5. Category Deletion with Existing Transactions

**Decision**: Soft Delete (Hide, do not delete).

- **Business Logic**: Vital for financial audits. Historical expense history must not show errors or lose the category information.
- **Technical Side**: Use Soft Delete with is_active (boolean) or deleted_at (timestamp) column in the categories table.
- **UI Handling**: The category will be missing from the dropdown when entering new transactions, but the category name will still render correctly when viewing historical transaction reports.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide prominent "Add Income" and "Add Expense" buttons on the main dashboard for quick access
- **FR-002**: System MUST allow users to enter transactions with minimal fields: Amount, Category, Date, and Short Description
- **FR-003**: System MUST support dual-user (husband and wife) accounts that sync to a single household balance
- **FR-004**: System MUST categorize expenses as Fixed (Mandatory): Installments, electricity, children's school fees, insurance
- **FR-005**: System MUST categorize expenses as Variable (Optional): Dining out, hobbies, impulse purchases
- **FR-006**: System MUST automatically calculate running balance using the formula: Ending Balance = Beginning Balance + Total In - Total Out
- **FR-007**: System MUST display the current running balance prominently on the dashboard
- **FR-008**: System MUST allow users to filter transactions by account (husband/wife/both)
- **FR-009**: System MUST validate that required fields (Amount, Category, Date) are filled before saving
- **FR-010**: System MUST allow users to view historical balances by selecting a specific date

### Key Entities

- **Transaction**: Represents a single financial entry with amount, category, date, description, and user attribution
- **User Account**: Represents either husband or wife account that can record transactions
- **Household Balance**: Represents the combined financial position of both accounts
- **Category**: Represents a spending category with Fixed or Variable classification

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a transaction entry in under 30 seconds from dashboard to saved
- **SC-002**: Both husband and wife can record transactions that appear in the unified household balance within 2 seconds
- **SC-003**: Running balance updates immediately after each transaction is saved
- **SC-004**: Users can distinguish between Fixed and Variable expenses in reports with 100% accuracy
- **SC-005**: 95% of users successfully complete transaction entry on first attempt without errors

## Assumptions

- Users have stable internet connectivity for real-time sync (Supabase)
- Mobile and web access are both important for v1
- Default date for new transactions is today
- Categories are pre-defined but can be extended in future versions
- Balance can go negative (overdraft permitted) - displayed in red as visual alert
- Each transaction is attributed to exactly one user account
- Future-dated transactions are allowed and treated as "Scheduled/Pending"
- Database uses NUMERIC(14,2) or BIGINT for amount columns to handle large values
- Categories use soft delete (is_active or deleted_at) to preserve historical data
