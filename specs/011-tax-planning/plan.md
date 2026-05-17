# Implementation Plan: Tax Management & Compliance Module

**Branch**: `011-tax-planning` | **Date**: 2026-05-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/011-tax-planning/spec.md`

## Summary

Enable households to manage two overlapping tax challenges: (1) **Annual Tax Installment Planner** — register annual Vehicle Registration (PKB) and Property Tax (PBB) obligations as goals of type `TAX_OBLIGATION` in the existing `financial_goals` table, then derive a real-time monthly installment schedule via the pure utility function `computeTaxInstallments()`; (2) **E-Filing Reminder & Deductions** — track annual income tax filing deadlines in a new `tax_filing_deadlines` table, flag existing `transactions` as tax-deductible via `is_tax_deductible` + `fiscal_year` columns, and lock deduction editing once filing is marked as filed. Zero new tables for obligations or deduction records (YAGNI). One new table total (`tax_filing_deadlines`). Dashboard uses Tremor KPI cards; all forms use Shadcn/ui Dialog + Form. Pure utility functions tested TDD-first via Vitest.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, no `any`)  
**Primary Dependencies**: Next.js App Router, Supabase (PostgreSQL), @tremor/react, Shadcn/ui, Tailwind CSS 4, react-hook-form, zod  
**Storage**: PostgreSQL (Supabase) — 1 new table (`tax_filing_deadlines`); adds `tax_type` to `financial_goals`; extends `financial_goals.goal_type` CHECK; adds `is_tax_deductible` + `fiscal_year` to `transactions`  
**Testing**: Vitest + React Testing Library (TDD mandatory — tests before implementation)  
**Target Platform**: Mobile-first (Android/iPhone), responsive to tablet/desktop via Tailwind breakpoints  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: <200ms server response for tax dashboard fetch; installment schedule computation is instantaneous (pure function, no DB)  
**Constraints**: Zero-cost deployment (Vercel + Supabase Free Tier); RLS on `tax_filing_deadlines`; NUMERIC(14,2) for all monetary values; soft-delete for tax obligations; no background jobs or push notifications  
**Scale/Scope**: Household-level (2–10 tax obligations typical per household); multiple filing deadlines across fiscal years; deductible transactions drawn from existing transaction history

## Constitution Check

| Rule | Status | Notes |
|------|--------|-------|
| Mobile-First UI | ✅ Pass | Bottom Nav entry, responsive Bento grid; 44×44px touch targets on all obligation card actions |
| Shadcn/ui + Tremor | ✅ Pass | Tremor `Metric` + `BadgeDelta` for KPI cards; Shadcn `Badge` for overdue/urgent status; Shadcn `Dialog`/`Form` for all CRUD |
| TDD (Vitest + RTL) | ✅ Pass | `tax-planning.test.ts` written first; all components have colocated `.test.tsx` files |
| Financial Precision (NUMERIC) | ✅ Pass | DB uses NUMERIC(14,2); installment amounts computed with integer arithmetic (floor + remainder); no floating-point errors |
| Supabase + Vercel | ✅ Pass | Zero-cost architecture; Server Components for data fetch; Server Actions for mutations |
| YAGNI/KISS | ✅ Pass | 1 new table only; tax obligations reuse `financial_goals`; deductions reuse `transactions`; installments are derived state |
| Soft Deletes | ✅ Pass | `financial_goals.deleted_at` for tax obligations; linked `transactions` preserved on obligation soft-delete |
| UUID Primary Keys | ✅ Pass | `tax_filing_deadlines.id` uses `uuid_generate_v4()` |
| RLS | ✅ Pass | RLS enabled on `tax_filing_deadlines`; `financial_goals` and `transactions` inherit existing RLS |
| Derived State Not Persisted | ✅ Pass | Installment schedule, overdue status, days-until-deadline — all computed at query/render time; never stored |
| No Background Jobs / Push Notifications | ✅ Pass | 30-day reminder is an in-app badge derived on page load; no cron/email/push required |

## Project Structure

### Documentation (this feature)

```text
specs/011-tax-planning/
├── plan.md                         # This file
├── research.md                     # Phase 0 output
├── data-model.md                   # Phase 1 output
├── quickstart.md                   # Phase 1 output
├── contracts/
│   └── component-contracts.md     # Phase 1 output
└── tasks.md                        # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── tax-planning/
│   │   └── page.tsx                                    # Server Component — fetches TaxDashboardData
│   └── actions/
│       ├── tax-planning.ts                             # Server Actions (createTaxObligation, etc.)
│       └── tax-planning.test.ts                        # Integration tests (vi.mock Supabase)
│
├── components/
│   └── features/
│       └── tax-planning/
│           ├── TaxPlanningDashboard.tsx                # Client Component — tabs: Obligations | Filing
│           ├── TaxPlanningDashboard.test.tsx
│           ├── TaxObligationSummaryCard.tsx            # Tremor Metric KPI cards
│           ├── TaxObligationSummaryCard.test.tsx
│           ├── TaxObligationCard.tsx                   # Per-obligation card + installment expand
│           ├── TaxObligationCard.test.tsx
│           ├── TaxObligationList.tsx
│           ├── TaxObligationList.test.tsx
│           ├── TaxObligationForm.tsx                   # Shadcn Dialog + Form (create/edit)
│           ├── TaxObligationForm.test.tsx
│           ├── InstallmentScheduleTable.tsx            # Derived schedule table
│           ├── InstallmentScheduleTable.test.tsx
│           ├── FilingDeadlineList.tsx                  # Countdown + urgency alert
│           ├── FilingDeadlineList.test.tsx
│           ├── FilingDeadlineForm.tsx                  # Shadcn Dialog + Form
│           ├── FilingDeadlineForm.test.tsx
│           ├── DeductionList.tsx                       # Deductible transactions + category totals
│           ├── DeductionList.test.tsx
│           ├── FlagDeductionForm.tsx                   # Flag existing transaction as deductible
│           └── FlagDeductionForm.test.tsx
│
├── lib/
│   ├── utils/
│   │   ├── tax-planning.ts                             # computeTaxInstallments, computeRemainingMonths,
│   │   │                                               #   isTaxObligationOverdue, computeDaysUntilDeadline,
│   │   │                                               #   isFilingDeadlineUrgent, buildObligationWithSchedule
│   │   └── tax-planning.test.ts                        # Vitest unit tests (RED before GREEN — mandatory)
│   └── supabase/
│       ├── queries/
│       │   └── tax-planning.ts                         # getTaxObligations, getFilingDeadlines,
│       │                                               #   getDeductibleTransactions, getTaxDashboardData
│       └── migrations/
│           └── 011-tax-planning.sql                    # ALTER goals + transactions; CREATE tax_filing_deadlines
│
├── hooks/
│   └── useTaxPlanning.ts                               # Client state hook
│
└── types/
    └── tax-planning.ts                                  # TaxObligation, TaxFilingDeadline, TaxInstallment, etc.
```

**Structure Decision**: Single Next.js project following existing feature conventions. Feature-scoped components under `components/features/tax-planning/`. Pure utility math in `lib/utils/tax-planning.ts` with colocated tests. Server Actions in `app/actions/tax-planning.ts`. DB queries in `lib/supabase/queries/tax-planning.ts`. No separate backend or mobile project.

## Complexity Tracking

> No constitution violations requiring justification.
>
> The single new table (`tax_filing_deadlines`) is justified: filing deadlines require a `UNIQUE(household_id, tax_type, fiscal_year)` constraint that cannot be enforced on `financial_goals` without semantic corruption. See `research.md` Decision 4 for full rationale.

## Phases

### Phase 0: Research (Completed)

- Decision: Tax obligations → reuse `financial_goals` with `goal_type = 'tax_obligation'` + new `tax_type` column (no new table)
- Decision: `TaxInstallment` → derived state only; `computeTaxInstallments()` pure function; never persisted
- Decision: Tax deduction records → reuse `transactions` with `is_tax_deductible BOOLEAN` + `fiscal_year INTEGER` columns (no new table)
- Decision: `tax_filing_deadlines` → one new table justified by unique constraint + lifecycle state (`pending → filed`)
- Decision: Filing lock enforced at application level (Server Action guard), not DB trigger
- Decision: 30-day reminder derived at query time (page load), in-app badge only — no background jobs
- Decision: Tremor `Metric`/`BadgeDelta` for dashboard KPIs; Shadcn `Dialog`/`Form` for all CRUD (constitution mandate)
- Decision: `computeTaxInstallments` and related utilities TDD-first in `tax-planning.ts` / `tax-planning.test.ts`
- Decision: Overdue status derived at render time from `target_date < today`; no status column persisted

### Phase 1: Design & Contracts (Completed)

- `data-model.md`: Full schema for `tax_filing_deadlines` (new), migration SQL, `financial_goals` + `transactions` ALTER statements, all TypeScript interfaces, derived state signatures
- `contracts/component-contracts.md`: Server Action signatures, query function signatures, pure utility function signatures, all component prop interfaces
- `quickstart.md`: Migration steps, TDD workflow, file checklist, key constraint verification tests
- `research.md`: All 9 technical decisions with rationale and rejected alternatives

### Phase 2: Implementation (Pending via /speckit.tasks)

- Database migration `011-tax-planning.sql`
- TypeScript types (`src/types/tax-planning.ts`)
- Pure utility functions with Vitest tests written first (`src/lib/utils/tax-planning.ts`)
- DB query functions (`src/lib/supabase/queries/tax-planning.ts`)
- Server Actions (`src/app/actions/tax-planning.ts`) with integration tests
- Feature components with colocated RTL tests, TDD order: utility → actions → components
- App Router page (`src/app/tax-planning/page.tsx`)

---

**Next Step**: Run `/speckit.tasks` to generate implementation tasks
