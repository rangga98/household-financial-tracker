# Tasks: Cash Flow Tracker

**Feature**: Cash Flow Tracker | **Generated**: 2026-05-09 | **Plan**: [plan.md](plan.md)

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 28 |
| User Stories | 4 |
| Parallelizable | 8 |
| MVP Scope (US1) | 10 tasks |

## Implementation Strategy

**MVP First**: User Story 1 (Quick Transaction Entry) represents the core value proposition. It should be fully implemented and tested before moving to other stories.

**Incremental Delivery**: Each user story can be independently tested and deployed. Stories are ordered by priority (P1 → P2).

---

## Phase 1: Setup

*Project initialization and dependency installation*

- [x] T001 Initialize Next.js project with TypeScript, Tailwind, ESLint, App Router
- [x] T002 Install Supabase dependencies (@supabase/supabase-js, @supabase/ssr)
- [x] T003 Install UI dependencies (Shadcn/ui, Tremor, Lucide React, Zustand)
- [x] T004 Install testing dependencies (Vitest, React Testing Library, jsdom)
- [x] T005 Configure Shadcn/ui with default theme
- [x] T006 Create .env.local template with Supabase environment variables
- [x] T007 Configure Vitest and create test setup file

---

## Phase 2: Foundational

*Database setup and core infrastructure (blocking prerequisites for all user stories)*

- [x] T008 [P] Create Supabase database schema (households, profiles, categories, transactions tables)
- [x] T009 [P] Enable Row Level Security (RLS) on all tables with household-based policies
- [x] T010 [P] Seed default categories (Fixed: Installments, Electricity, School Fees, Insurance; Variable: Dining Out, Hobbies, Groceries, Transportation)
- [x] T011 Create TypeScript interfaces in src/types/index.ts (Transaction, Category, Profile, Household)
- [x] T012 Create Supabase client in src/lib/supabase/client.ts (browser client)
- [x] T013 Create Supabase server client in src/lib/supabase/server.ts
- [x] T014 Create utility functions in src/lib/utils/currency.ts (formatRp, formatCompactRp)
- [x] T015 Create cn utility in src/lib/utils/cn.ts
- [x] T016 Create balance calculation utility in src/lib/utils/calculations.ts

---

## Phase 3: User Story 1 - Quick Transaction Entry

**Goal**: Enable users to quickly record transactions with minimal fields (Amount, Category, Date, Description)

**Independent Test**: Enter a transaction with amount, category, date, and description, then verify it appears in the transaction list.

**Acceptance Criteria**:
- Prominent "Add Income" and "Add Expense" buttons on dashboard
- Minimal form with Amount, Category, Date, Short Description fields
- Save updates running balance immediately
- Validation errors for empty required fields

### Implementation

- [x] T017 [P] [US1] Create TransactionForm component in src/components/features/cash-flow/TransactionForm.tsx
- [x] T018 [P] [US1] Create CategorySelect component in src/components/features/cash-flow/CategorySelect.tsx
- [x] T019 [US1] Create Server Action createTransaction in src/lib/supabase/actions/transactions.ts
- [x] T020 [US1] Create transaction query functions in src/lib/supabase/queries/transactions.ts
- [x] T021 [US1] Create TransactionList component in src/components/features/cash-flow/TransactionList.tsx
- [x] T022 [US1] Implement validation in TransactionForm (required fields check)
- [x] T023 [US1] Add toast notifications for success/error feedback
- [x] T024 [US1] Write unit tests for currency formatting utilities
- [x] T025 [US1] Write integration tests for transaction creation flow

---

## Phase 4: User Story 2 - Dual-User Account Sync

**Goal**: Support two user accounts (husband/wife) that sync to a single household balance

**Independent Test**: Switch between husband/wife accounts, record transactions, verify all transactions appear in unified household view.

**Acceptance Criteria**:
- Transactions attributed to specific user but contribute to shared balance
- Combined balance visible on dashboard
- Filter transactions by account (husband/wife/both)

### Implementation

- [x] T026 [P] [US2] Create UserSwitcher component in src/components/features/cash-flow/UserSwitcher.tsx
- [x] T027 [P] [US2] Create profile query functions in src/lib/supabase/queries/profiles.ts
- [x] T028 [US2] Create Zustand store in src/hooks/useCashFlow.ts for current user state
- [x] T029 [US2] Update TransactionForm to include user attribution
- [x] T030 [US2] Add account filter to TransactionList
- [x] T031 [US2] Write integration tests for dual-user transaction sync

---

## Phase 5: User Story 4 - Running Balance Calculation

**Goal**: Automatically calculate and display running balance (Beginning Balance + Total In - Total Out)

**Independent Test**: Record income and expense transactions, verify balance updates correctly.

**Acceptance Criteria**:
- Balance increases when income recorded
- Balance decreases when expense recorded
- Balance reflects cumulative result of all transactions
- Negative balance displayed in red

### Implementation

- [x] T032 [P] [US4] Create BalanceDisplay component in src/components/features/cash-flow/BalanceDisplay.tsx using Tremor KPI Card
- [x] T033 [P] [US4] Create balance query function in src/lib/supabase/queries/balance.ts
- [x] T034 [US4] Implement real-time subscription for balance updates
- [x] T035 [US4] Add negative balance styling (red color)
- [x] T036 [US4] Implement historical balance viewing by date
- [x] T037 [US4] Write unit tests for balance calculation logic

---

## Phase 6: User Story 3 - Fixed vs. Variable Categorization

**Goal**: Categorize expenses as Fixed (Mandatory) or Variable (Optional)

**Independent Test**: Create transactions in both categories, verify they are correctly grouped in reports.

**Acceptance Criteria**:
- Categories labeled as Fixed or Variable
- Spending grouped by Fixed vs. Variable in reports

### Implementation

- [x] T038 [P] [US3] Update CategorySelect to show Fixed/Variable labels
- [x] T039 [P] [US3] Create category query functions in src/lib/supabase/queries/categories.ts
- [x] T040 [US3] Add Fixed/Variable filter to TransactionList
- [x] T041 [US3] Create spending breakdown component using Tremor charts
- [x] T042 [US3] Write integration tests for category filtering

---

## Phase 7: Polish & Cross-Cutting Concerns

*Tasks that affect multiple user stories*

- [x] T043 [P] Create CashFlowDashboard component integrating all sub-components
- [x] T044 [P] Update app/page.tsx to render CashFlowDashboard
- [x] T045 Add mobile-responsive layout with FAB for transaction entry
- [x] T046 Implement dark mode support
- [x] T047 Add loading states and skeleton components
- [x] T048 Handle edge cases (future-dated transactions styling, large number formatting)
- [x] T049 End-to-end testing of complete transaction flow
- [x] T050 Performance optimization (debounce, memoization)

---

## Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational) ─────────────────────────────────────────┐
    │                                                         │
    ▼                                                         │
Phase 3 (US1: Quick Entry) ───────┐                           │
    │                              │                           │
    ▼                              │                           │
Phase 4 (US2: Dual-User) ─────────┼───────────────────────────┤
    │                              │                           │
    ▼                              │                           │
Phase 5 (US4: Balance) ───────────┼───────────────────────────┤
    │                              │                           │
    ▼                              ▼                           │
Phase 6 (US3: Categories) ◄───────┴───────────────────────────┘
    │
    ▼
Phase 7 (Polish)
```

---

## Parallel Execution Examples

**Example 1**: T017 and T018 can run in parallel - both are component creation with no dependencies between them.

**Example 2**: T026 and T027 can run in parallel - both create user-related code independently.

**Example 3**: T032 and T033 can run in parallel - balance display and query are independent initially.

**Example 4**: T038 and T039 can run in parallel - category UI and data queries are independent.

**Example 5**: T043 and T044 can run in parallel - dashboard component and page integration are independent.

---

## MVP Scope

**Recommended MVP**: User Story 1 only (Phase 3)

This delivers the core value proposition - frictionless transaction recording. The MVP includes:
- Transaction form with minimal fields
- Transaction list display
- Server actions and queries
- Basic validation and feedback

**Estimated MVP Tasks**: T001-T025 (10 implementation tasks after setup)
