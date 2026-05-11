# Implementation Plan: Financial Freedom Module

**Branch**: `007-financial-freedom` | **Date**: 2026-05-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-financial-freedom/spec.md`

## Summary

Predict at what age a user achieves financial freedom using the 4% Rule (`FI Number = Annual Expenses × 25`) and compound-interest-based Years-to-FI calculation. All financial math is extracted into pure, testable utility functions (`lib/utils/finance.ts`). UI uses Tremor for charts and progress indicators, Shadcn/ui for forms. Data is minimal: only input variables stored on the existing `profiles` table; projections are derived state.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**: Next.js 16.2.6 (App Router), Supabase (PostgreSQL), @tremor/react 3.18.7, Shadcn/ui, Tailwind CSS 4, Zustand  
**Storage**: PostgreSQL (Supabase) — FI input fields added to existing `profiles` table via migration  
**Testing**: Vitest + React Testing Library (TDD mandatory — tests before implementation)  
**Target Platform**: Mobile-first (Android/iPhone), responsive to tablet/desktop via Tailwind breakpoints  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: <200ms server response for profile fetch, <100ms client-side projection recalculation  
**Constraints**: Zero-cost deployment (Vercel + Supabase Free Tier), RLS mandatory, no floating-point money storage  
**Scale/Scope**: Single FI profile per user/household, MVP — no multi-scenario support in v1

## Constitution Check

| Rule | Status | Notes |
|------|--------|-------|
| Mobile-First UI | ✅ Pass | Responsive Bento grid; 44x44px touch targets on form inputs |
| Shadcn/ui + Tremor | ✅ Pass | Tremor `AreaChart`/`ProgressBar` for viz; Shadcn `Form`/`Input`/`Slider` for inputs |
| TDD (Vitest + RTL) | ✅ Pass | `finance.test.ts` must be written and passing before `finance.ts` or any UI |
| Financial Precision (NUMERIC) | ✅ Pass | Database uses NUMERIC(14,2); calculations use integer math where possible |
| Supabase + Vercel | ✅ Pass | Zero-cost architecture; Server Components for data fetch |
| YAGNI/KISS | ✅ Pass | No new table — FI fields added to `profiles`. No persisted `fi_projections` table |
| Soft Deletes | ✅ Pass | Inherits profiles table pattern; no hard deletes needed (config update only) |
| UUID Primary Keys | ✅ Pass | Uses existing `profiles.id` UUID |
| RLS | ✅ Pass | Inherits existing profiles table RLS policies |
| Derived State Not Persisted | ✅ Pass | FI Projection is computed in real-time by pure functions |

## Project Structure

### Documentation (this feature)

```text
specs/007-financial-freedom/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── component-contracts.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── financial-freedom/
│   │   └── page.tsx                    # Server Component — fetches profile, renders dashboard
│   └── layout.tsx                      # Existing root layout
│
├── components/
│   ├── ui/                             # Shadcn base components (existing)
│   └── features/
│       └── financial-freedom/
│           ├── FinancialFreedomDashboard.tsx   # Client Component — orchestrates viz + form
│           ├── FinancialFreedomDashboard.test.tsx
│           ├── FIProjectionChart.tsx           # Tremor AreaChart wrapper
│           ├── FIProgressCard.tsx              # Tremor ProgressBar + KPI cards
│           ├── FIInputForm.tsx                 # Shadcn form for editing parameters
│           └── FIInputForm.test.tsx
│
├── lib/
│   ├── utils/
│   │   ├── finance.ts                    # Pure financial calculation functions
│   │   └── finance.test.ts               # Vitest unit tests (RED before GREEN)
│   ├── supabase/
│   │   ├── client.ts                     # Existing browser client
│   │   ├── server.ts                     # Existing server client
│   │   └── queries/
│   │       └── financial-freedom.ts      # getFIProfile, updateFIProfile
│   └── actions/
│       └── financial-freedom.ts          # Next.js Server Actions for CRUD
│
├── hooks/
│   └── useFinancialFreedom.ts            # Zustand store or React state hook
│
└── types/
    └── financial-freedom.ts            # FIProfile, FIProjection, FIYearProjection
```

**Structure Decision**: Single Next.js project following existing conventions. Feature-scoped components under `/components/features/financial-freedom/`. Pure financial math in `/lib/utils/finance.ts` with colocated tests. Database queries in `/lib/supabase/queries/financial-freedom.ts`. Server Actions in `/lib/actions/financial-freedom.ts`.

## Complexity Tracking

> No constitution violations requiring justification.

## Phases

### Phase 0: Research (Completed)

- Decision: FI input fields stored on existing `profiles` table (YAGNI — no new table)
- Decision: Standard FIRE compound-interest formula for Years to FI
- Decision: Tremor `AreaChart` + `ProgressBar` for visualization
- Decision: Pure functions in `lib/utils/finance.ts` with Vitest tests (TDD)

### Phase 1: Data Model & Quickstart (Completed)

- `data-model.md`: Extended `profiles` table with 5 FI columns (`fi_annual_expenses`, `fi_savings_rate`, `fi_current_age`, `fi_current_net_worth`, `fi_expected_return`)
- `quickstart.md`: Migration SQL, file checklist, development workflow, testing commands
- `contracts/component-contracts.md`: Server Action signatures, component prop interfaces
- `research.md`: Storage strategy, calculation formula, trajectory generation, component architecture, pre-population source

### Phase 2: Implementation (Pending via /speckit.tasks)

- Database migration (ALTER TABLE profiles)
- Pure financial calculation utilities (`lib/utils/finance.ts`) with full Vitest coverage
- Server Actions (`lib/actions/financial-freedom.ts`)
- Database queries (`lib/supabase/queries/financial-freedom.ts`)
- TypeScript types (`src/types/financial-freedom.ts`)
- Dashboard components (Tremor charts, Shadcn forms)
- App Router page (`app/financial-freedom/page.tsx`)
- Integration tests for component + Server Action flow

---

**Next Step**: Run `/speckit.tasks` to generate implementation tasks
