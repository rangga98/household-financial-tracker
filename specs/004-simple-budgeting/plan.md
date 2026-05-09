# Implementation Plan: Simple Budgeting (The Guardrail)

**Branch**: `004-simple-budgeting` | **Date**: 2026-05-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-simple-budgeting/spec.md`

## Summary

Add a lightweight "guardrail" budgeting layer on top of the existing Cash Flow Tracker. A single `monthly_limit` column on `categories` powers three user-facing features: (1) a budget limit editor for the Variable category, (2) a derived Daily Spending Power calculated as `Remaining Budget / Remaining Days`, clamped to 0 when over-budget, and (3) an overbudget visual alert rendered with Shadcn Alert and Tremor ProgressBar when spending exceeds 80% of the limit. All budget metrics are derived from existing `transactions`; no new tables beyond the `categories` schema addition.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Next.js 15 (App Router)
**Primary Dependencies**: React 19, Tailwind CSS 3.4, Shadcn/ui, Tremor, Zustand, Supabase client
**Storage**: Supabase (PostgreSQL) — existing `categories` and `transactions` tables
**Testing**: Vitest + React Testing Library (RTL)
**Target Platform**: Web (mobile-first responsive, Vercel deployment)
**Project Type**: Web application (Next.js App Router + Server Actions)
**Performance Goals**: Dashboard metrics update within 1s of transaction mutation; budget calculations run client-side for instant feedback
**Constraints**: Zero-cost serverless (Vercel + Supabase free tier); React Server Components for data fetching; no floating-point arithmetic for money
**Scale/Scope**: Single household, 2 users, ~100 transactions/month

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Mobile-First & Responsive | PASS | Budget card uses Bento layout; FAB and bottom nav reused from Cash Flow |
| II. High-Fidelity & Data-Driven | PASS | Tremor ProgressBar + Shadcn Alert specified in FR-008; `tabular-nums` for money |
| III. Strict TDD | PASS | Tests written before implementation; `.test.tsx` colocated with components |
| IV. Financial Precision | PASS | `NUMERIC(14,2)` for limit; pure utility functions for DSP calculation |
| V. Serverless & Zero-Cost | PASS | Single schema migration; derived states avoid new tables |
| VI. YAGNI & KISS | PASS | No `alerts` or `monthly_spending` tables; `monthly_limit` added to existing `categories` |
| VII. Database Design | PASS | `UUID` PKs already in place; soft deletes via `is_active`; RLS on `categories` |

*No violations. No Complexity Tracking required.*

## Project Structure

### Documentation (this feature)

```text
specs/004-simple-budgeting/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── (routes)/
│       └── budgeting/           # Budget dashboard page
├── components/
│   ├── features/
│   │   └── budgeting/
│   │       ├── BudgetCard.tsx         # Bento card with ProgressBar + DSP
│   │       ├── BudgetCard.test.tsx
│   │       ├── BudgetLimitForm.tsx    # Input to set/update monthly_limit
│   │       ├── BudgetLimitForm.test.tsx
│   │       ├── DailySpendingPower.tsx # Displays clamped DSP value
│   │       ├── DailySpendingPower.test.tsx
│   │       └── OverbudgetAlert.tsx    # Shadcn Alert wrapper
│   │       └── OverbudgetAlert.test.tsx
│   └── ui/                        # Shadcn/Tremor base components
├── hooks/
│   └── useBudgeting.ts            # Zustand store for budget state
├── lib/
│   ├── supabase/
│   │   ├── migrations/
│   │   │   └── 004-simple-budgeting.sql
│   │   └── queries/
│   │       └── budgeting.ts       # getBudgetMetrics, updateCategoryLimit
│   └── utils/
│       └── budgeting.ts           # calculateDailySpendingPower, getProgressColor
├── types/
│   └── index.ts                   # Extended Category with monthlyLimit
```

**Structure Decision**: Single Next.js project. Feature colocated under `src/components/features/budgeting/`. Database migration in `src/lib/supabase/migrations/004-simple-budgeting.sql`. Query logic in `src/lib/supabase/queries/budgeting.ts`. Pure calculation utilities in `src/lib/utils/budgeting.ts`. Tests colocated per Constitution.

## Complexity Tracking

> No violations. This section is intentionally empty.
