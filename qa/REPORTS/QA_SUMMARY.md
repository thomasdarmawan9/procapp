# QA Summary Report – Sprint 12 (Sample)

> **How to update:** Replace metrics & notes each sprint. Link to evidence (Playwright, Lighthouse, defects).

## 1. Execution Snapshot
| Area | Manual | E2E | Accessibility | Visual | Status |
| --- | --- | --- | --- | --- | --- |
| Auth & RBAC | 6/6 | 3/3 | 1/1 | 1/1 | ✅ |
| Requisitions | 8/10 | 2/3 | 1/1 | 1/1 | ⚠️ (1 major defect open) |
| Approvals | 5/5 | 2/2 | 1/1 | – | ✅ |
| RFQs | 4/6 | 2/2 | 1/1 | 1/1 | ⚠️ (visual diff pending) |
| Purchase Orders | 3/4 | 1/1 | – | 1/1 | ✅ |
| Vendors | 4/4 | 2/2 | – | – | ✅ |
| Settings / Rules | 3/4 | 2/2 | – | – | ⚠️ (rule condition bug) |
| Global (Locale, Perf) | 3/4 | 1/1 | 2/2 | 1/1 | ⚠️ (contrast issue logged) |

## 2. Metrics
- **Manual Cases:** 30 executed / 25 passed / 3 failed / 2 blocked
- **Automation Runs:** Playwright E2E (48 specs) – 46 passed, 2 failed (flaky visual diff, RFQ send)
- **Accessibility:** Axe scans on 6 core pages – 0 serious/critical violations
- **Visual Regression:** Dashboard diff (tolerable), RFQ compare – pending approval
- **Performance:** Lighthouse Perf 82 / Accessibility 92 / Best Practices 88 / SEO 80 (pass)
- **Defects Logged:** 10 (1 Blocker, 3 Critical, 4 Major, 2 Minor)
- **Defect Density:** 10 defects / 34 testable stories ≈ 0.29

## 3. Key Findings
- **B-001:** Approved requisition missing finance step when amount over 100M (rule evaluator bug)
- **B-004:** RFQ send button disabled after first attempt (state not reset)
- **C-006:** Vendor modal allows rating >5 via keyboard (validation gap)
- **UI-009:** Contrast for yellow status badge below WCAG AA (contrast 2.5:1)

## 4. Risks & Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Approval rule evaluator incorrect for combined conditions | High financial compliance risk | Blocker defect, fix + unit tests before release |
| RFQ send flake due to React Query cache | Could block vendor outreach | Add retry + cache invalidation fix | 
| Visual diff on RFQ compare (alignment) | Presentation issues to procurement admin | Await UX confirmation; update baseline after fix |

## 5. Release Decision
- **Status:** 🟡 **Yellow – Conditional**
- **Rationale:** Blocker QA-001 must be resolved; remaining critical defects require fix or rollback of feature toggles. All other areas stable.
- **Exit Criteria:** Fix QA-001 & QA-004, rerun regression, confirm Lighthouse ≥80.

## 6. Next Actions
1. Dev to patch approval evaluator & RFQ send state (ETA 2 days).
2. Automation QA to stabilize visual baseline post fix.
3. Re-run Axe + Lighthouse after UI adjustments.
4. Expand API contract tests for vendors & approvals.

## 7. Attachments
- Playwright HTML report: `test-results/html-report/index.html`
- Axe outputs: `test-results/axe/*.json`
- Lighthouse: `qa/LIGHTHOUSE/dashboard.report.json`
- Defect log: `/qa/DEFECTS/DEFECTS.md`

