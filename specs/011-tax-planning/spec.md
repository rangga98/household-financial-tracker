# Feature Specification: Tax Management & Compliance Module

**Feature Branch**: `011-tax-planning`  
**Created**: 2026-05-17  
**Status**: Draft  
**Input**: User description: "Tax Management & Compliance Module (Tax Planning) — E-Filing & Tax Reminder: Features for annual tax filing reminders and storing tax deduction records. Vehicle & Property Taxes: Break down annual tax liabilities (Vehicle Registration, Property Tax) into monthly installments so they don't feel like a burden when due."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Annual Vehicle & Property Tax Installment Planner (Priority: P1)

A household member registers an upcoming annual tax obligation — such as a vehicle registration fee (e.g., Pajak Kendaraan Bermotor) or a property tax bill (e.g., PBB) — along with its total amount and due date. The system automatically splits the full amount into equal monthly installments and creates a recurring savings allocation so the household steadily sets aside funds each month. When the due date approaches, the tax feels already "paid" because the budget has been absorbing it incrementally.

**Why this priority**: This is the core pain-point described: large annual bills hitting all at once. Converting them to monthly installments is the highest-value action and the minimum viable capability of this module.

**Independent Test**: Can be fully tested by creating a single vehicle tax record with an amount and annual due date, then verifying the system generates the correct number of monthly allocation amounts summing to the original total, and delivers value as a standalone saving planner.

**Acceptance Scenarios**:

1. **Given** the user has no existing tax records, **When** the user creates a new annual tax entry (type: Vehicle Registration, amount: Rp 1,200,000, due: 2026-12-01), **Then** the system stores the record, calculates a monthly installment of Rp 100,000 (12 months from nearest previous month), and displays the installment schedule.
2. **Given** an existing annual tax entry with 6 months remaining until due, **When** the user views the installment plan, **Then** the system recalculates installments over the remaining 6 months (total ÷ remaining months) so the schedule stays accurate.
3. **Given** a tax entry has passed its due date, **When** the user views all tax obligations, **Then** the entry is marked as "Overdue" and the user is prompted to renew it for the next cycle.
4. **Given** the user wants to track a property tax bill (PBB), **When** they create an entry with type: Property Tax, **Then** the system stores it separately and displays both Vehicle and Property taxes in a unified tax obligation list.

---

### User Story 2 - Annual Tax Filing Reminder & Deduction Records (Priority: P2)

A household member needs to file their annual income tax return (e.g., SPT Tahunan). They can record deductible expenses throughout the year (medical costs, donations, occupational deductions, etc.) and set a filing deadline reminder. As the deadline nears, the app notifies them to complete filing and shows a summary of stored deduction records to streamline preparation.

**Why this priority**: E-filing reminders prevent missed deadlines (which incur penalties) and stored deduction records save time during filing. This is high-value but secondary to the installment planner since it is more about tracking and reminding rather than active cash-flow management.

**Independent Test**: Can be fully tested by creating a tax filing deadline for the current fiscal year, adding two deduction records, then verifying the deadline appears on the reminder list and the deduction total is computed correctly — independently of the installment planner feature.

**Acceptance Scenarios**:

1. **Given** no filing deadline exists, **When** the user sets an annual income tax filing deadline (e.g., March 31, 2027), **Then** the system stores it and displays it in the reminders panel with a countdown in days.
2. **Given** a filing deadline is set, **When** the deadline is 30 days away, **Then** the user receives an in-app notification or visible alert prompting them to prepare for filing.
3. **Given** the user has logged multiple deduction records, **When** they view the deduction summary, **Then** the system totals all deduction amounts grouped by category (e.g., Medical, Donations, Occupational) for the relevant fiscal year.
4. **Given** the user adds a deduction record (category: Medical, amount: Rp 500,000, date: 2026-03-15, description: "Hospital visit"), **When** the record is saved, **Then** it appears in the deduction list with all fields and is included in the category total.
5. **Given** a filing deadline has passed, **When** the user marks it as "Filed", **Then** the reminder is archived and the deduction records for that fiscal year are locked (read-only).

---

### User Story 3 - Tax Obligations Dashboard Overview (Priority: P3)

A household member opens the Tax Management section and sees a unified overview: upcoming tax due dates, total outstanding tax obligations, monthly installment amounts required this month for annual taxes, and any overdue filing reminders — all at a glance without navigating multiple sub-pages.

**Why this priority**: The dashboard gives the module its final polish and improves discoverability, but it depends on Stories 1 and 2 being implemented first and does not independently deliver new data — it aggregates existing records.

**Independent Test**: Can be tested by populating at least one installment plan and one filing reminder, then verifying the dashboard card correctly reflects the total monthly tax installment due and the nearest filing deadline countdown.

**Acceptance Scenarios**:

1. **Given** the user has active installment plans and a filing deadline, **When** they view the tax dashboard, **Then** they see: total tax obligations amount, current month's installment allocation required, number of days until the next filing deadline, and any overdue items highlighted in red.
2. **Given** the user has no tax records at all, **When** they view the tax dashboard, **Then** they see an empty state prompting them to add their first tax obligation.
3. **Given** multiple annual tax entries exist with different due dates, **When** the dashboard loads, **Then** entries are sorted by upcoming due date (soonest first).

---

### Edge Cases

- What happens when the due date is less than 1 month away and the system tries to calculate installments? — System must create at minimum 1 installment equal to the full amount.
- What happens when a tax entry's due date is in a past month? — Entry is marked Overdue; no installment schedule is generated; user is prompted to update the due date.
- What happens if the user enters a tax amount of zero or a negative value? — System rejects the input with a validation error.
- What happens when the household has multiple tax entries of the same type (e.g., 2 vehicles)? — Each vehicle is tracked as a separate record identified by a user-provided label (e.g., "Honda Beat B 1234 XY").
- What happens when the filing deadline date for the same fiscal year is set more than once? — System prevents duplicate filing deadlines for the same fiscal year and tax type; shows an error.
- What happens if deduction records are added after the filing has been marked as "Filed"? — Deduction records are locked; user must unarchive the filing period to edit (or add to the next fiscal year).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create annual tax obligations by recording them as goals of a new type `TAX_OBLIGATION` in the existing goals infrastructure, with fields: type (Vehicle Registration / Property Tax / Custom), label (user-defined name, e.g., "Honda Beat"), total amount, annual due date, and notes. No new database table is introduced.
- **FR-002**: Monthly installment amounts MUST be a derived, never-persisted value computed in real-time as: `remaining_target_amount ÷ remaining_full_months_until_due` (minimum 1 month). No installment table exists; the schedule is always recalculated on render.
- **FR-003**: System MUST display a full installment schedule (each month, its allocated amount, accumulated total) derived at render time from FR-002. The installment calculation logic (including rounding: remainder added to the first month) MUST be isolated in a single pure utility function tested via TDD before any UI is built.
- **FR-004**: System MUST allow users to set an annual income tax filing deadline per fiscal year, identified by tax type (e.g., Annual Income Tax) and fiscal year.
- **FR-005**: System MUST display a countdown (in days) to the nearest upcoming filing deadline on the tax dashboard.
- **FR-006**: System MUST notify the user (in-app alert/badge) when a filing deadline is 30 days or fewer away.
- **FR-007**: System MUST allow users to flag any transaction (existing or new) as tax-deductible by setting an `is_tax_deductible` boolean on the existing `transactions` table record and associating it with a fiscal year. No new deduction table is introduced.
- **FR-008**: System MUST aggregate and display total deduction amounts grouped by category for a selected fiscal year by querying existing transactions where `is_tax_deductible = true` for that fiscal year.
- **FR-009**: System MUST allow users to mark a filing deadline as "Filed", which archives the deadline and sets all associated deduction records to read-only.
- **FR-010**: System MUST mark annual tax entries as "Overdue" when their due date has passed without being renewed.
- **FR-011**: System MUST prevent duplicate filing deadlines for the same tax type and fiscal year.
- **FR-012**: System MUST validate all monetary inputs: amounts must be positive numbers; zero and negative values must be rejected.
- **FR-013**: System MUST display a unified tax obligations dashboard showing: total outstanding obligations, current-month installment total, upcoming deadlines (sorted by soonest), and overdue items.
- **FR-014**: System MUST support multiple annual tax entries of the same type, distinguished by a user-provided label.
- **FR-015**: The Tax Obligations Dashboard MUST use Tremor components (KPI metric cards, stat bars) for all summary data visualizations, consistent with the project UI stack.
- **FR-016**: All data-entry forms (tax obligation creation, filing deadline setting, deduction flagging) MUST use Shadcn/ui form components, consistent with the project UI stack.

### Key Entities *(include if feature involves data)*

- **TaxObligation** *(extends existing `goals` table, no new table)*: Annual tax bills are modelled as goals of a new type `TAX_OBLIGATION`. Reuses all existing goal attributes: id, household_id, target_amount (total tax bill), target_date (annual due date), name (label, e.g., "Honda Beat"), notes, status. A new `goal_type` discriminator value `TAX_OBLIGATION` is added to the existing goals type enum.
- **TaxInstallment** *(derived state — never persisted)*: The monthly allocation is always computed in real-time as `remaining_target_amount ÷ remaining_full_months_until_due` (minimum 1). No table or row is ever created; this is pure calculated output from a utility function.
- **TaxFilingDeadline** *(new table)*: An annual income tax filing event with a target submission date. Key attributes: id, household_id, tax_type, fiscal_year (integer), filing_deadline, status (Pending / Filed), filed_at, created_at, updated_at.
- **TaxDeductionRecord** *(extends existing `transactions` table, no new table)*: Tax-deductible expenses are ordinary transactions with two additional columns: `is_tax_deductible` (boolean, optional, default false) and `fiscal_year` (integer, nullable). Deduction queries filter the existing transactions table on `is_tax_deductible = true`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create an annual tax obligation entry and view the full monthly installment schedule in under 60 seconds from entering the module.
- **SC-002**: The monthly installment calculation is accurate to within Rp 1 rounding tolerance (remainder distributed to the first month).
- **SC-003**: Users receive an in-app filing reminder at least 30 days before the deadline without needing to revisit the module manually.
- **SC-004**: Users can add, view, and total all deduction records for a fiscal year in a single screen without navigating away.
- **SC-005**: The tax obligations dashboard loads and displays all active obligations and deadlines within 2 seconds under normal network conditions.
- **SC-006**: 100% of overdue tax entries are visually distinguished from active entries on all list and dashboard views.
- **SC-007**: Duplicate filing deadlines (same tax type + fiscal year) are rejected with a clear validation message, preventing data integrity issues.

## Assumptions

- Users are Indonesian households; primary tax types are Vehicle Registration (PKB), Property Tax (PBB), and Annual Income Tax (SPT Tahunan), though a "Custom" type is supported for extensibility.
- The fiscal year for income tax follows the calendar year (January–December); due dates for SPT Tahunan default to March 31 of the following year.
- Monthly installments are computed in equal portions; any remainder (from integer rounding) is added to the first installment of the schedule. This logic lives entirely in a single pure utility function and is never stored.
- Tax obligations reuse the existing `goals` table with a new `TAX_OBLIGATION` goal type; no new obligation table is introduced.
- Tax-deductible expenses reuse the existing `transactions` table via an `is_tax_deductible` boolean and `fiscal_year` column; no new deduction table is introduced.
- Installment amounts are informational savings-allocation figures and are not automatically transferred to a dedicated account; integration with sinking funds (Feature 008) is out of scope for this version.
- In-app notifications are implemented as UI badges/alerts within the app; push notifications (mobile OS-level) are out of scope for this version.
- All monetary values are in Indonesian Rupiah (IDR) and stored as `NUMERIC(14,2)` following the project constitution.
- The household multi-user model from the existing architecture applies; all tax data is scoped to `household_id` with Row Level Security.
- Editing a deduction record after filing is marked complete requires an explicit "Unarchive" action; bulk unarchive is out of scope.
- Tax obligation entries support soft-delete (`deleted_at`) following the constitution's audit trail requirement; deleted obligations are excluded from dashboard totals.
