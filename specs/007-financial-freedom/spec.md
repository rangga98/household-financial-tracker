# Feature Specification: Financial Freedom Module

**Feature Branch**: `007-financial-freedom`  
**Created**: 2026-05-11  
**Status**: Draft  
**Input**: User description: "Financial Freedom Module (The Long Game): predict at what age you can achieve financial freedom using the 4% Rule and savings rate calculations"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Calculate and Display FI Age (Priority: P1)

As a user, I want to see at what age I will achieve financial freedom so I can plan my long-term financial future.

**Why this priority**: This is the core value proposition of the feature. Without the projected FI age, the module delivers no actionable insight to the user.

**Independent Test**: Can be fully tested by inputting annual expenses, savings rate, current age, and current net worth, then verifying the displayed projected FI age matches the expected calculation.

**Acceptance Scenarios**:

1. **Given** a user has entered annual expenses of $40,000, a savings rate of 50%, current age of 30, current net worth of $100,000, and expected return of 7%, **When** they view the Financial Freedom module, **Then** the system displays an FI Number of $1,000,000 and a projected FI age based on compound growth calculations.
2. **Given** a user has already achieved financial freedom (current net worth >= FI Number), **When** they view the module, **Then** the system clearly indicates they have reached financial freedom instead of showing a projected age.

---

### User Story 2 - View FI Projection Dashboard (Priority: P2)

As a user, I want a visual dashboard showing my progress toward financial freedom so I can stay motivated and track my trajectory.

**Why this priority**: Visual feedback increases engagement and helps users understand their path. However, the raw numbers from P1 are sufficient for basic usage.

**Independent Test**: Can be fully tested by verifying a progress indicator and year-by-year projection chart are rendered based on the user's FI profile data.

**Acceptance Scenarios**:

1. **Given** a user has an active FI profile, **When** they view the dashboard, **Then** they see a Tremor progress bar (e.g., `ProgressBar`) showing what percentage of their FI Number they have already accumulated.
2. **Given** a user has an active FI profile, **When** they view the dashboard, **Then** they see a Tremor area or line chart (e.g., `AreaChart`) projecting net worth growth year-by-year until the FI target is reached.

---

### User Story 3 - Adjust Financial Assumptions (Priority: P3)

As a user, I want to adjust assumptions like expected return rate and see how changes affect my FI timeline so I can model different scenarios.

**Why this priority**: Scenario modeling is valuable for advanced users but is not required for the primary use case. The default assumptions should produce reasonable results for most users.

**Independent Test**: Can be fully tested by modifying the expected return rate and verifying the projected FI age and year-by-year chart update accordingly.

**Acceptance Scenarios**:

1. **Given** a user has an existing FI profile with a 7% expected return, **When** they change the expected return to 5%, **Then** the system recalculates and displays an updated projected FI age and projection chart.
2. **Given** a user modifies their annual expenses or savings rate, **When** the changes are saved, **Then** the FI Number, Years to FI, and projected FI age update immediately.

---

### Edge Cases

- **Zero or negative savings rate**: The system must display a clear message that financial freedom is not achievable with the current savings rate.
- **Already achieved FI**: If current net worth is greater than or equal to the FI Number, the system must celebrate the achievement and show the user has reached financial freedom.
- **Missing annual expenses or income data**: The system must prompt the user to enter their annual expenses (or derive them from existing budgeting/cash flow data).
- **Very low savings rate (< 10%)**: The system must display the projected timeline but may also include a contextual note about the extended time to FI.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate the FI Number using the 4% Rule: `FI Number = Annual Expenses × 25`.
- **FR-002**: System MUST calculate Years to FI based on the user's Savings Rate, Current Net Worth, Expected Annual Return Rate, and the FI Number using standard compound interest with regular contributions.
- **FR-003**: System MUST display the projected age at which the user achieves financial freedom (`Projected FI Age = Current Age + Years to FI`).
- **FR-004**: System MUST display the FI Number, Years to FI, and Projected FI Age prominently on the Financial Freedom module.
- **FR-005**: System MUST allow users to input or edit the following parameters: Annual Expenses, Savings Rate, Current Age, Current Net Worth, and Expected Annual Return Rate.
- **FR-006**: System MUST indicate when the user has already achieved financial freedom (Current Net Worth >= FI Number) with clear celebratory messaging.
- **FR-007**: System MUST display a progress indicator using a Tremor component (e.g., `ProgressBar`) showing the percentage of the FI Number that the user's Current Net Worth represents.
- **FR-008**: System MUST generate and display a year-by-year projection of net worth growth from the current year until the FI target is reached, rendered with a Tremor chart component (e.g., `AreaChart` or `LineChart`).
- **FR-009**: System MUST handle a zero or negative savings rate by displaying a message that the FI target is unreachable under current conditions.
- **FR-010**: System MUST pre-populate Annual Expenses from existing budgeting/cash flow data when available, while allowing the user to override it.
- **FR-011**: All financial calculation logic — including FI Number, Years to FI, compound growth, and the year-by-year trajectory — MUST be implemented as pure functions in a centralized utility file (e.g., `lib/utils/finance.ts`). These functions MUST be covered by Vitest unit tests before any UI component consuming them is built, per the TDD mandate.

### Key Entities *(include if feature involves data)*

- **FI Profile**: Represents a user's financial freedom inputs and configuration. This is the only persisted entity. Contains: Annual Expenses, Savings Rate, Current Age, Current Net Worth, Expected Annual Return Rate, and optional notes or scenario labels. Stored in a simple settings or profiles table.
- **FI Projection**: Represents the calculated outputs for a given FI Profile. **This is purely Derived State — it is calculated in real-time by pure utility functions and is NOT persisted to the database.** Contains: FI Number, Years to FI, Projected FI Age, Progress Percentage, and a Year-by-Year Net Worth Trajectory (array of year/net-worth pairs).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can see their projected FI age within 2 minutes of entering their data.
- **SC-002**: FI Number calculation is mathematically exact to the 4% Rule: `Annual Expenses × 25`.
- **SC-003**: Years to FI calculation is accurate within ±1 year when compared to standard FIRE community formulas for equivalent inputs.
- **SC-004**: 90% of users can understand their FI projection without additional explanation or documentation.
- **SC-005**: The system handles all edge cases (already FI, 0% savings rate, missing data) with clear, actionable messaging.

## Assumptions

- Users have access to their Annual Expenses and Savings Rate data, either from existing cash flow/budgeting features or via manual input.
- The 4% Rule is the accepted baseline for determining the FI Number.
- Expected Annual Return Rate defaults to a conservative value (7% nominal) if the user does not provide one.
- Annual income can be derived from Annual Expenses and Savings Rate: `Annual Income = Annual Expenses / (1 - Savings Rate)`.
- The Years to FI calculation uses standard compound interest with annual contributions, assuming contributions equal annual savings (Annual Income × Savings Rate).
- Users may have multiple FI scenarios, but the v1 implementation supports one active profile per user.
- The module is additive to existing features (cash flow, budgeting, reports) and does not modify their behavior.
