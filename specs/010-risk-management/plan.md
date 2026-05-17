# Implementation Plan: Risk Management Module (Protection Layer)

**Branch**: `010-risk-management` | **Date**: 2026-05-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/010-risk-management/spec.md`

## Summary

Enable households to manage their financial protection layer via two sub-features: (1) **Insurance Tracker** — register insurance policies, track total coverage vs. a user-defined protection target, and mark premium payments as paid (recorded as expense transactions); (2) **Health Budgeting** — track out-of-pocket healthcare expenses not covered by insurance or BPJS, reusing the existing `categories.monthly_limit` + `transactions` infrastructure from Simple Budgeting. One new table (`insurance_policies`) is created; all other data flows reuse existing tables. Pure utility functions (`calculateNextPremiumDueDate`, `calculateCoverageGap`, `derivePremiumStatus`) are implemented TDD-first in `src/lib/utils/insurance.ts`. UI uses Tremor `ProgressBar` for coverage adequacy, Shadcn/ui `Badge` for premium status, and Shadcn/ui `Dialog`+`Form` for CRUD.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, no `any`)  
**Primary Dependencies**: Next.js App Router, Supabase (PostgreSQL), @tremor/react, Shadcn/ui, Tailwind CSS 4, react-hook-form, zod  
**Storage**: PostgreSQL (Supabase) — 1 new table (`insurance_policies`); adds `policy_id` to `transactions`; extends `financial_goals.goal_type` CHECK constraint  
**Testing**: Vitest + React Testing Library (TDD mandatory — tests before implementation)  
**Target Platform**: Mobile-first (Android/iPhone), responsive to tablet/desktop via Tailwind breakpoints  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: <200ms server response for insurance dashboard fetch; coverage gap calculation is instantaneous (pure function, no DB)  
**Constraints**: Zero-cost deployment (Vercel + Supabase Free Tier); RLS on `insurance_policies`; NUMERIC(14,2) for all monetary values; soft-delete only for policies and linked transactions  
**Scale/Scope**: Household-level (1–10 policies per household is typical); single protection target per household; 5 healthcare category types

## Constitution Check

| Rule | Status | Notes |
|------|--------|-------|
| Mobile-First UI | ✅ Pass | Bottom Nav entry, responsive Bento grid; 44×44px touch targets on all policy card actions |
| Shadcn/ui + Tremor | ✅ Pass | Tremor `ProgressBar` for coverage adequacy and health budget; Shadcn `Badge` for premium status; Shadcn `Dialog`/`Form` for CRUD |
| TDD (Vitest + RTL) | ✅ Pass | `insurance.test.ts` written first; all components have colocated `.test.tsx` files |
| Financial Precision (NUMERIC) | ✅ Pass | DB uses NUMERIC(14,2); coverage gap computed with integer-safe arithmetic |
| Supabase + Vercel | ✅ Pass | Zero-cost architecture; Server Components for data fetch; Server Actions for mutations |
| YAGNI/KISS | ✅ Pass | 1 new table only; health budgeting reuses existing `categories` + `transactions`; protection target reuses `financial_goals` |
| Soft Deletes | ✅ Pass | `insurance_policies.deleted_at`; linked `transactions.policy_id` preserved on policy deactivation |
| UUID Primary Keys | ✅ Pass | `insurance_policies.id` uses `uuid_generate_v4()` |
| RLS | ✅ Pass | RLS enabled on `insurance_policies`; scoped by `household_id` |
| Derived State Not Persisted | ✅ Pass | Premium status, coverage gap, total coverage — all computed at query/render time; never stored |
| No Background Jobs / Third-Party Notification Services | ✅ Pass | No push/email reminders; in-app status badges only |

## Project Structure

### Documentation (this feature)

```text
specs/010-risk-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── component-contracts.md  # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── risk-management/
│   │   └── page.tsx                              # Server Component — fetches dashboard data
│   └── actions/
│       ├── risk-management.ts                    # Server Actions: createInsurancePolicy, markPremiumPaid, etc.
│       └── risk-management.test.ts
│
├── components/
│   └── features/
│       └── risk-management/
│           ├── RiskManagementDashboard.tsx        # Client Component — tabs: Insurance | Health Budget
│           ├── RiskManagementDashboard.test.tsx
│           ├── InsuranceSummaryCard.tsx           # Tremor ProgressBar for total coverage vs target
│           ├── InsuranceSummaryCard.test.tsx
│           ├── PolicyCard.tsx                     # Per-policy card with premium status Badge
│           ├── PolicyCard.test.tsx
│           ├── PolicyList.tsx                     # List of all active policies
│           ├── PolicyList.test.tsx
│           ├── PolicyForm.tsx                     # Shadcn Dialog + Form for create/edit
│           ├── PolicyForm.test.tsx
│           ├── MarkPaidForm.tsx                   # Mark premium as paid
│           ├── MarkPaidForm.test.tsx
│           ├── ProtectionTargetForm.tsx           # Set/edit protection target
│           ├── ProtectionTargetForm.test.tsx
│           ├── HealthBudgetTab.tsx                # Health budget + per-category ProgressBar
│           └── HealthBudgetTab.test.tsx
│
├── lib/
│   ├── utils/
│   │   ├── insurance.ts                          # calculateNextPremiumDueDate, calculateCoverageGap,
│   │   │                                         #   derivePremiumStatus, getDaysUntilDue
│   │   └── insurance.test.ts                    # Vitest unit tests (RED before GREEN — mandatory)
│   └── supabase/
│       ├── queries/
│       │   └── risk-management.ts               # getInsurancePolicies, getTotalCoverage,
│       │                                         #   getProtectionTarget, getInsuranceDashboardData
│       └── migrations/
│           └── 010-risk-management.sql          # New table + column additions + CHECK extension
│
├── hooks/
│   └── useRiskManagement.ts                     # Client state hook (Zustand or React state)
│
└── types/
    └── risk-management.ts                        # InsurancePolicy, CoverageStatus, PolicyWithStatus, etc.
```

**Structure Decision**: Single Next.js project following existing feature conventions. Feature-scoped components under `components/features/risk-management/`. Pure utility math in `lib/utils/insurance.ts` with colocated tests. Server Actions in `app/actions/risk-management.ts`. DB queries in `lib/supabase/queries/risk-management.ts`. Health Budgeting tab surfaces existing budgeting query infrastructure — no new query file needed for that sub-feature.

## Complexity Tracking

> No constitution violations requiring justification.
>
> The single new table (`insurance_policies`) is justified: insurance policies carry stateful, domain-specific attributes (coverage amount, insurer, payment frequency, next-due date, active lifecycle) that cannot be mapped onto any existing table without semantic corruption. See `research.md` Decision 1 for full rationale.

## Phases

### Phase 0: Research (Completed)

- Decision: `insurance_policies` is the only new table (justified exception to YAGNI — see `research.md`)
- Decision: Premium payments → `expense` transactions with `policy_id` FK (mirrors `goal_id` pattern)
- Decision: Protection target → `financial_goals` row with `goal_type = 'protection_target'` (CHECK constraint extended via migration)
- Decision: Health budgeting → fully reuses `categories.monthly_limit` + `transactions` (zero new schema)
- Decision: Premium status is derived state (never persisted) from `next_due_date` + transaction history
- Decision: `calculateNextPremiumDueDate` and `calculateCoverageGap` are pure utility functions in `insurance.ts`
- Decision: Tremor `ProgressBar` for coverage adequacy; Shadcn `Badge` for premium status
- Decision: No push/email reminders — in-app badges only (Zero-Cost Serverless constraint)

### Phase 1: Design & Contracts (Completed)

- `data-model.md`: Full schema for `insurance_policies` (new), migration SQL, `transactions.policy_id` and `financial_goals` CHECK extension, healthcare category seeding strategy, TypeScript interfaces
- `contracts/component-contracts.md`: Server Action signatures, query function signatures, pure utility function signatures, all component prop interfaces
- `quickstart.md`: Migration steps, TDD workflow, file checklist, key constraint verification tests
- `research.md`: All 9 technical decisions with rationale and rejected alternatives

### Phase 2: Implementation (Pending via /speckit.tasks)

- Database migration `010-risk-management.sql`
- TypeScript types (`src/types/risk-management.ts`)
- Pure utility functions with Vitest tests written first (`src/lib/utils/insurance.ts`)
- DB query functions (`src/lib/supabase/queries/risk-management.ts`)
- Server Actions (`src/app/actions/risk-management.ts`) with integration tests
- Healthcare category seeding logic (lazy seed on first module use)
- Feature components with colocated RTL tests (TDD)
- App Router page (`src/app/risk-management/page.tsx`)

---

**Next Step**: Run `/speckit.tasks` to generate implementation tasks
