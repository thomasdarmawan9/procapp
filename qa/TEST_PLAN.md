# Test Plan – Core Procurement Management

> **How to execute:** Follow this plan per sprint release. Update dates & owners each iteration.

## 1. Objectives
- Validate end-to-end procurement workflows (requisition → approval → RFQ → PO) across supported roles.
- Ensure non-functional targets (accessibility, responsiveness, performance) are met.
- Provide stakeholders with timely quality status and release recommendation.

## 2. Milestones & Schedule
| Milestone | Description | Owner | Target |
| --- | --- | --- | --- |
| TP-01 | Test planning & asset prep | QA Lead | Sprint Day 1 |
| TP-02 | Environment readiness (local CI) | DevOps | Sprint Day 1 |
| TP-03 | Manual smoke executed | QA Analyst | Sprint Day 3 |
| TP-04 | Playwright E2E regression run | Automation QA | Sprint Day 4 |
| TP-05 | Accessibility/Lighthouse checks | QA Lead | Sprint Day 4 |
| TP-06 | Exploratory charters | QA Team | Sprint Day 5 |
| TP-07 | Defect triage & retest | QA Lead + Dev | Sprint Day 6 |
| TP-08 | QA summary & release decision | QA Lead | Sprint Day 7 |

## 3. Roles & Responsibilities
| Role | Responsibilities |
| --- | --- |
| QA Lead | Maintain strategy/plan, coordinate execution, report status, approve releases. |
| Automation QA | Maintain Playwright suite, CI stability, visual regression baselines. |
| Manual QA | Execute manual cases, update status, log defects with evidence. |
| Developers | Provide build quality, fix defects, support test data needs. |
| Product Owner | Prioritize defects, sign off on release decision. |

## 4. Test Deliverables
- Strategy (this repo), plan, manual cases, exploratory charters.
- Automated tests under `qa/PLAYWRIGHT` (E2E, accessibility).
- QA summary report, defect logs (Markdown + JSON).
- Lighthouse instructions.

## 5. Entry / Exit Criteria
### Entry
- Functional stories merged to main branch.
- Unit tests >90% pass.
- Required environments & credentials available.
- No open blocker defects from previous release.

### Exit
- Manual regression: pass rate ≥95%; remaining failures triaged.
- E2E + Axe suites green in CI.
- No open Blocker/Critical defects; ≤2 Major allowed with mitigation.
- Performance budgets met (Lighthouse ≥80 across metrics).
- PO acceptance of QA summary.

## 6. Test Types & Allocation
| Type | Owner | Tooling | Frequency |
| --- | --- | --- | --- |
| Manual Functional | QA Analyst | Zephyr/CSV | Per sprint |
| Automated E2E | Automation QA | Playwright | Nightly + PR |
| Accessibility | QA Lead | `axe-playwright`, manual keyboard | Weekly |
| Visual Regression | Automation QA | Playwright screenshots | Weekly / major UI change |
| Performance | QA Lead | Lighthouse CLI | Per release |
| API Contract | Automation QA | Playwright API tests, Zod schemas | Nightly |
| Exploratory | QA Team | Session charters | Sprint mid-point |

## 7. Test Data Management
- Use seeded users & entities; reset via fixture `seedData()`.
- Attachments: mock files under `qa/fixtures/files/` (<=5 MB).
- Use deterministic requisition IDs for automation to avoid collisions.
- Locale tests toggle between `en` and `id` within same session.

## 8. Tools & Infrastructure
- Node 18+, npm 10+
- Playwright 1.42+
- Axe-core/playwright
- GitHub Actions (CI), Artifacts for traces/screenshots
- Slack channel `#procurement-qa`

## 9. Reporting Cadence
- **Daily Standup:** QA progress & blockers.
- **Twice-weekly QA Sync:** Automation status, defects.
- **Release Readout:** QA summary (QA_SUMMARY.md) + live demo of critical issues.
- Dashboard (future): Playwright + Lighthouse trends.

## 10. Risk & Contingency
- Automation flakiness → maintain retry strategy, investigate root cause within 24h.
- Environment instability → fallback to local run with mock server, log incidents.
- Staff bandwidth → escalate to PO for scope trade-offs.

## 11. Approvals
- QA Lead: _______________________ (Date: ____)
- Product Owner: __________________ (Date: ____)
