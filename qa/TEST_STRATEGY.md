# Test Strategy – Core Procurement Management

> **How to use:** Read this strategy before building or executing QA assets. Update when product scope or tech stack changes.

## 1. Product & Release Context
- **Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind, shadcn/ui, React Query, Zod, Zustand, mock APIs in `/api/*`.
- **Business Goal:** Provide a procurement cockpit covering requisitions → approvals → RFQs → POs with vendor and rule governance for Indonesian market (en/ID locales).
- **Release Cadence:** Iterative bi-weekly sprints; continuous deployment to staging, monthly production drops.

## 2. Scope
### In Scope
| Area | Details |
| --- | --- |
| Auth & RBAC | Login role selector, cookie persistence, access guards (UI/API). |
| Purchase Requisition | List, filters, create/edit form, validation, attachments, approval timeline, submit/cancel flows. |
| Approvals | Inbox, approve/return w/ comment, audit trail, rule evaluation. |
| RFQ | Creation from requisition, vendor selection, send/receive quotes, comparison, PO draft generation. |
| Purchase Orders | List/detail, linkage to requisitions, status transitions (draft → issued). |
| Vendors | CRUD, validation, active flag, filtering. |
| Settings / Approval Rules | CRUD rules, evaluator outputs, thresholds per amount/category/cost center. |
| Non-functional | Accessibility (WCAG 2.1 AA), responsiveness (360/768/1280), Lighthouse ≥80, localization (en/ID), loading/error/empty states, security basics (RBAC, API guards). |

### Out of Scope / Deferred
- Third-party integrations (ERP, email) – mocked.
- File storage backend (uploads mocked via in-memory URLs).
- Payments, receiving logistics, analytics exports beyond CSV.
- Cross-browser beyond Chromium/WebKit/Firefox latest stable.

## 3. Quality Risks & Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Complex approval rule evaluation | Incorrect approver chain; regulatory impact | Unit tests on evaluator, scenario-based manual tests, API contract checks. |
| RBAC bypass via deep links | Unauthorized actions | Playwright auth specs verifying forbidden routes; API negative tests. |
| Form validation gaps (Zod vs UI) | Data corruption | Manual negative cases, automated validation coverage. |
| Locale switch mid-session | Broken translations / state loss | Exploratory charter, automated smoke toggling locale. |
| React Query caching stale data | Wrong status display | E2E tests verifying real-time updates post actions. |
| Accessibility regressions (shadcn components) | Non-compliance | Axe scans in CI, accessibility checklist. |
| Visual regressions (Tailwind) | Inconsistent UI | Screenshot diffs per release for key pages. |

## 4. Test Types & Depth
- **Static analysis:** ESLint/TypeScript (dev gate).
- **Unit:** Zod schemas, approval evaluator, React hooks (Vitest).
- **Integration:** React Query data fetching w/ mock handlers.
- **E2E/UI:** Playwright across flows (auth, requisitions, approvals, RFQs, vendors, POs, settings).
- **Accessibility:** Axe scans + manual keyboard audits.
- **API Contract:** Schema checks against mock endpoints (supertest/playwright request).
- **Visual:** Screenshot diff for dashboard, requisition detail, RFQ compare.
- **Performance:** Lighthouse CI budgets (≥80 score categories).
- **Exploratory:** Charters targeting boundary, RBAC, resilience.

## 5. Test Environments & Data
| Env | URL | Data Strategy |
| --- | --- | --- |
| Local Dev | `http://localhost:3000` | Auto-seeded mock data via in-memory DB. Fixtures seed deterministic data before E2E. |
| Staging (future) | `https://staging.procurement.local` | Use managed seed script; anonymize sensitive info. |

- **Browsers:** Chromium 120+, Firefox 120+, WebKit 17+.
- **Devices/Viewports:** 360x740, 768x1024, 1280x800.
- **Users:** `employee@example.com`, `approver@example.com`, `procurement@example.com`, `finance@example.com` (mapped to seed roles).
- **Test Data Reset:** `npm run dev` auto resets; Playwright fixture `seedData()` resets in-memory store between tests.

## 6. Entry / Exit Gates
- **Entry:** Feature branch passes lint/unit; QA assets updated; mock APIs stable.
- **Exit (Release Candidate):**
  - Manual suite ≥95% pass; no open blocker/critical defects.
  - E2E + Axe + visual regression green.
  - Lighthouse scores ≥ budget.
  - RBAC spot checks on staging.

## 7. Tooling & Reporting
- **Playwright** for automation, `axe-playwright` for accessibility.
- **Vitest** for unit/contract tests.
- **Lighthouse CI** via CLI.
- **Slack / Jira** for defect triage; weekly QA summary.
- **Allure/HTML** reporter optional for Playwright.

## 8. Continuous Improvement
- Automate approval rule scenario matrix.
- Integrate Lighthouse/Axe in CI pipeline.
- Expand contract tests once real backend arrives.
- Monitor flakiness dashboard for Playwright.
