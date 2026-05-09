# Implementation Plan: Basic Report (The Insight)

**Branch**: `005-basic-report` | **Date**: 2026-05-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-basic-report/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a read-only end-of-month financial report page that derives three key insights from existing transaction data: (1) an expense breakdown pie chart (Tremor DonutChart), (2) a month-over-month expense comparison with directional indicators, and (3) a savings rate with dynamic health badges (Tremor Badge/Callout). All data is aggregated on-the-fly via Supabase queries against the existing `transactions` and `categories` tables — no new database tables or columns are created. The report defaults to the current month and allows month selection.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**: Next.js 16.2.6 (App Router), React 19.2.4, @tremor/react 3.18.7, @supabase/supabase-js 2.105.4  
**Storage**: Supabase (PostgreSQL) — existing `transactions`, `categories` tables  
**Testing**: Vitest 4.1.5, React Testing Library 16.3.2, jsdom  
**Target Platform**: Web (mobile-first responsive, Vercel deployment)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: Report page renders within 2 seconds for up to 500 transactions/month  
**Constraints**: Zero-cost serverless architecture; no new DB tables; all data derived from existing schema  
**Scale/Scope**: Single household, dual-user, monthly transaction volume < 1,000

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Mobile-First & Responsive | PASS | Report layout will use stacked cards on mobile, Bento grid on tablet/desktop. Tremor charts are responsive by default. |
| II. Shadcn + Tremor for UI | PASS | Spec explicitly requires Tremor DonutChart and Badge/Callout. Shadcn Card will wrap report sections. |
| III. TDD Mandatory | PASS | All calculation utilities and report components require `.test.ts` / `.test.tsx` files written first. |
| IV. Financial Precision | PASS | Savings rate and comparison formulas use existing `calculations.ts` utilities. No new monetary arithmetic introduced. |
| V. Serverless/Zero-Cost | PASS | Data fetched via React Server Components + Supabase. No backend service or cron job needed. |
| VI. YAGNI/KISS | PASS | No new DB tables, no `is_scheduled` flag, no caching layer. Pure aggregation queries against existing tables. |
| VII. DB Design Integrity | PASS | No schema changes. Existing `transactions` (NUMERIC(14,2), UUID PKs, RLS, timestamps) already compliant. |

**Gate Result**: ALL PASS. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/005-basic-report/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── app/
│   ├── actions/
│   │   └── report.ts              # Server Action: aggregate report data
│   ├── report/
│   │   └── page.tsx               # Report page (Server Component)
│   └── layout.tsx                 # Root layout (existing)
├── components/
│   ├── features/
│   │   └── report/
│   │       ├── ExpenseBreakdown.tsx      # Tremor DonutChart wrapper
│   │       ├── ExpenseBreakdown.test.tsx
│   │       ├── MonthlyComparison.tsx     # MoM comparison card
│   │       ├── MonthlyComparison.test.tsx
│   │       ├── SavingsRate.tsx           # Tremor Badge/Callout
│   │       ├── SavingsRate.test.tsx
│   │       ├── ReportHeader.tsx          # Month selector + title
│   │       └── ReportHeader.test.tsx
│   └── ui/                        # Shadcn base components (existing)
├── hooks/
│   └── useReport.ts               # Client hook for month selection state
├── lib/
│   ├── supabase/
│   │   └── queries.ts             # Reusable Supabase query builders
│   └── utils/
│       ├── calculations.ts        # Existing — savingsRate formula
│       └── calculations.test.ts   # Existing — extend with report tests
└── test/
    └── setup.ts                   # Vitest test setup (existing)
```

**Structure Decision**: Single Next.js App Router project. Report data is fetched via Server Components and Server Actions. Feature-specific components live under `/components/features/report/` following existing project conventions (cash-flow/, budgeting/, emergency-fund/). Tests are colocated with components. No backend service or API routes required — Supabase queries executed directly in Server Actions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *(none)* | — | — |

---

## Post-Design Constitution Check Re-evaluation

*Re-checked after Phase 1 design completion.*

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. Mobile-First & Responsive | PASS | Report page uses stacked cards (`flex-col` on mobile), 2-column Bento grid on `md:`, 3-column on `lg:`. Tremor charts auto-resize. |
| II. Shadcn + Tremor for UI | PASS | DonutChart, Badge, Callout from Tremor confirmed available. Shadcn Select for month picker. Card wrapper from Shadcn. |
| III. TDD Mandatory | PASS | 5 test files identified in project structure. Test-first workflow enforced by colocation convention. |
| IV. Financial Precision | PASS | Savings rate formula delegated to existing `calculations.ts`. Division-by-zero guard in spec (FR-008). NUMERIC(14,2) already enforced. |
| V. Serverless/Zero-Cost | PASS | Server Components + Server Actions only. No new API routes, no cron jobs, no edge functions. |
| VI. YAGNI/KISS | PASS | Zero new DB tables. Zero new columns. No caching layer. Single responsibility per component. |
| VII. DB Design Integrity | PASS | Confirmed: no `ALTER TABLE` or `CREATE TABLE` required. All queries scoped to `household_id` with RLS. |

**Final Gate Result**: ALL PASS. Ready for Phase 2 task generation (`/speckit.tasks`).
