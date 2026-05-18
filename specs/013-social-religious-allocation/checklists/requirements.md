# Specification Quality Checklist: Social & Religious Allocation Module (Giving)

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-05-18
**Feature**: [spec.md](../spec.md)

## Content Quality

- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

## Requirement Completeness

- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Success criteria are technology-agnostic (no implementation details)
- [ ] All acceptance scenarios are defined
- [ ] Edge cases are identified
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

## Feature Readiness

- [ ] All functional requirements have clear acceptance criteria
- [ ] Key entities are defined with sufficient attributes
- [ ] Calculator formulas are explicitly stated (Zakat Maal: 2.5% above nisab; Zakat Fitrah: members × sha' × food price)
- [ ] Automation trigger (income transaction recorded) is clearly specified
- [ ] Giving categories are enumerated (Zakat, Donation, Compassion Fund)
- [ ] Compassion Fund balance and disbursement flows are described
- [ ] Historical data preservation on setting change/disable is confirmed

## Architecture Compliance (Single-Ledger & YAGNI)

- [ ] No new `GivingTransaction` table introduced — existing `transactions` table reused (FR-004, FR-005, FR-006)
- [ ] No separate `GivingAllocationRule` table — allocation config stored as static columns in profile/household (FR-003)
- [ ] Auto-earmark recorded as `type = 'transfer'` with `goal_id` pointing to Giving Virtual Bucket
- [ ] Compassion Fund disbursement recorded as `type = 'expense'` with `goal_id`
- [ ] Giving Virtual Buckets reuse existing `goals` concept (no new bucket table)
- [ ] `GivingSummary` is a computed aggregate only — not persisted

## UI & TDD Compliance

- [ ] Giving Summary dashboard explicitly requires Tremor components (`DonutChart`, `BarChart`, or `CategoryBar`) — FR-007
- [ ] Zakat Maal calculation is a pure utility function testable via Vitest — FR-011
- [ ] Zakat Fitrah calculation is a pure utility function testable via Vitest — FR-011
- [ ] No ad-hoc CSS-only charts permitted — FR-007
- [ ] Edge cases for zero-income periods and below-nisab scenarios are addressed

## Notes

- Check items off as completed: `[x]`
- Add comments or findings inline
- Link to relevant resources or documentation
- Items are numbered sequentially for easy reference
