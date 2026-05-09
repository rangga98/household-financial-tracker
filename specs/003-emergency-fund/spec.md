# Feature Specification: Emergency Fund Management

**Feature Branch**: `003-emergency-fund`  
**Created**: 2026-05-09  
**Status**: Draft  
**Input**: User description: "Emergency Fund Management (The Safety Net) - This is the first 'peace of mind' feature that must be included. Automatic Target Calculator: The app asks for the number of dependents. Logic: If you are married with children, the minimum target is 12 times your monthly expenses. Progress Visualization: A progress bar that shows the current status of your emergency fund compared to the target. 'Locked Fund' Feature: Designates a specific balance in the account as 'Emergency Fund' so it doesn't get mixed with daily spending money."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Emergency Fund Target (Priority: P1)

As a user, I want to set my emergency fund target based on my household situation so that I know how much I need to save for peace of mind.

**Why this priority**: This is the foundational feature that enables the entire emergency fund tracking system. Without a target, users cannot measure their progress.

**Independent Test**: Can be fully tested by entering household information (marital status, number of dependents) and verifying the calculated target matches the expected value based on monthly expenses.

**Acceptance Scenarios**:

1. **Given** a user is single with no dependents, **When** they enter a static Monthly Living Expense Estimate of $3,000, **Then** the system calculates a target of 6 times = $18,000
2. **Given** a user is married with children, **When** they enter a static Monthly Living Expense Estimate of $5,000, **Then** the system calculates a target of 12 times = $60,000
3. **Given** a user is married with no children, **When** they enter a static Monthly Living Expense Estimate of $4,000, **Then** the system calculates a target of 6 times = $24,000
4. **Given** a user has not entered their Monthly Living Expense Estimate, **When** they try to calculate their emergency fund target, **Then** the system prompts them to first enter their estimate

---

### User Story 2 - Track Emergency Fund Progress (Priority: P1)

As a user, I want to see a visual progress indicator showing how much of my emergency fund target I have accumulated so that I can track my progress toward financial security.

**Why this priority**: Progress visualization is the primary way users engage with this feature and stay motivated to continue saving.

**Independent Test**: Can be fully tested by setting a target amount, adding emergency fund contributions, and verifying the progress bar accurately reflects the percentage achieved.

**Acceptance Scenarios**:

1. **Given** a user has set a $24,000 target and has saved $12,000, **When** they view their emergency fund status, **Then** they see a progress bar showing 50% complete
2. **Given** a user has set a $60,000 target and has saved $65,000, **When** they view their emergency fund status, **Then** they see a progress bar showing 100%+ with an indicator that they have exceeded their target
3. **Given** a user has not set a target yet, **When** they view their emergency fund status, **Then** they see a prompt to set up their target first

---

### User Story 3 - Designate Locked Emergency Funds (Priority: P2)

As a user, I want to designate a specific portion of my account balance as "locked" emergency funds so that I can distinguish between money available for daily spending and money reserved for emergencies.

**Why this priority**: This feature provides psychological separation between spending money and emergency reserves, helping users avoid accidentally using their emergency fund.

**Independent Test**: Can be fully tested by designating a portion of balance as emergency fund and verifying it remains separate from available spending balance.

**Acceptance Scenarios**:

1. **Given** a user has a total account balance of $10,000, **When** they designate $5,000 as emergency fund, **Then** their available balance shows $5,000 and their locked emergency fund shows $5,000
2. **Given** a user has designated $3,000 as emergency fund, **When** they add $500 to their emergency fund, **Then** their locked emergency fund increases to $3,500
3. **Given** a user has designated $5,000 as emergency fund, **When** they withdraw from their emergency fund, **Then** the system shows a warning about reducing emergency reserves before allowing the withdrawal

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST prompt users to enter their marital status (single, married) and number of dependents (0, 1, 2, 3+)
- **FR-002**: System MUST calculate the emergency fund target using the formula: if married with children (1+ dependents), target = 12 × Monthly Living Expense Estimate; otherwise target = 6 × Monthly Living Expense Estimate
- **FR-003**: System MUST use a static "Monthly Living Expense Estimate" entered by the user during setup (NOT fluctuating actual expenses from transaction history) to prevent psychological demoralization from expense spikes
- **FR-004**: System MUST display a progress bar showing the current emergency fund balance as a percentage of the target
- **FR-005**: System MUST implement "Locked Funds" using the Virtual Bucket (Sinking Fund) approach: funds remain consolidated in the transactions table, but emergency fund contributions are recorded as virtual transfer transactions to the "Emergency Fund" goal/category
- **FR-006**: System MUST calculate available balance as: Total Funds - Total Funds in Goals (Emergency Fund). The UI displays both values separately, but the database remains simple.
- **FR-007**: System MUST show a warning confirmation when users attempt to withdraw from their emergency fund goal
- **FR-008**: System MUST update the progress visualization in real-time when emergency fund balance changes
- **FR-009**: System MUST utilize Tremor's ProgressBar or CategoryBar component within a Bento-style card for progress visualization
- **FR-010**: System MUST NOT automatically recalculate the target when monthly expenses are updated. The target remains static until the user manually clicks "Recalculate/Update Target" button
- **FR-011**: System MUST allow users to manually override the calculated target. The 6x/12x formulas are "Default Recommendations" only—users can set any target amount they choose
- **FR-012**: System MUST enforce a maximum target limit of Rp 99,999,999,999 (NUMERIC(14,2) database limit) and minimum of Rp 0 at the database level

### Key Entities

- **Emergency Fund Target**: Represents the calculated savings goal based on household situation and static Monthly Living Expense Estimate
- **Emergency Fund Balance**: Virtual balance tracked via goal/category records (not actual balance splitting)
- **Monthly Living Expense Estimate**: Static value entered by user during setup, used for target calculation (does not change with actual expenses)
- **Household Profile**: Contains marital status, number of dependents, and Monthly Living Expense Estimate

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can set up their emergency fund target within 2 minutes of first use
- **SC-002**: Progress bar accurately reflects the current emergency fund balance as a percentage of target (within 1% accuracy)
- **SC-003**: 90% of users who start the target setup flow complete it successfully
- **SC-004**: Locked emergency funds are visually distinguishable from available spending balance at all times
- **SC-005**: Users can view their emergency fund progress from the main dashboard without additional navigation

## Assumptions

- Users have a single primary account for tracking emergency funds (multi-account support is out of scope for v1 per YAGNI principle)
- The emergency fund target formula (6× or 12×) is based on standard financial advice and will be clearly communicated to users as "Default Recommendations"
- The Virtual Bucket approach keeps the database simple: funds remain in transactions table, emergency fund is tracked via goal/category records
- Users can manually adjust their emergency fund balance if they need to correct for errors
