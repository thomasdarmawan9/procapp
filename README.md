# Core Procurement Management

A mock procurement management platform built with Next.js 14 App Router, React, TypeScript, TailwindCSS, shadcn/ui, TanStack Query, Zod, react-hook-form, and Zustand.

## Features

- Role-based authentication (employee, approver, procurement admin, finance)
- Purchase requisition lifecycle (draft, submit, approve, convert)
- Approval workflow rules with timeline tracking
- RFQ creation and quote comparison, linking to PO drafts
- Vendor directory with CRUD operations and validation
- Purchase order overview with requisition linkage
- Approval inbox with in-place actions
- Dashboard metrics and charts
- i18n-ready (EN/ID) and light/dark mode
- In-memory mock API with seeded data via Next.js route handlers

## Getting Started

```bash
npm install
npm run dev
```

The app seeds demo data and users on first run.

| Role | Email | Notes |
| --- | --- | --- |
| Employee | employee@example.com | Draft & submit requisitions |
| Approver | approver@example.com | Approvals & RFQ creation |
| Procurement Admin | procurement@example.com | Manage vendors & approval rules |
| Finance | finance@example.com | Approval step & PO oversight |

## Using the Application End-to-End

1. **Login & Role Selection**
   - Navigate to `/login`.
   - Choose a role, enter the seeded email, click **Sign In**.
   - Session is stored in a cookie; switch roles by logging out or clearing storage.

2. **Dashboard Overview** (`/dashboard`)
   - Cards summarise open requisitions, pending approvals, RFQs, and POs.
   - Charts highlight spend by category and approval bottlenecks.

3. **Purchase Requisitions**
   - **List View** (`/requisitions`): filter by status, requester, date, or search.
   - **Create Draft** (`/requisitions/new`):
     1. Fill department, cost center, needed-by date (future), optional notes.
     2. Add line items (quantity > 0, unit price ≥ 0). Attachments accept common file types.
     3. Save → requisition stored as **Draft**.
   - **Edit Draft**: open draft, modify items; totals auto-recalculate.
   - **Submit**: click **Submit**, requisition moves to **Submitted** and approval steps generate according to rules.
   - **Negative Flow**: If validation fails (e.g., needed-by in past, empty line items), inline errors prevent save. Attachments >5 MB are rejected (defect if not).

4. **Approval Workflow**
   - **Approver/Finance Inbox** (`/approvals`): shows requisitions awaiting the current role.
   - **Approve**: click requisition → detail view shows timeline → select **Approve**.
   - **Return with Comment**: choose **Return**, a comment is required (current bug allows empty comment; see QA-003).
   - **Rejection / Return Outcome**:
     - Returned requisitions revert to **Draft** and notify requester via timeline comment.
     - Approvals advance through steps; once all approvers sign off, status becomes **Approved**.

5. **Request for Quotation (RFQ)**
   - **Create RFQ** (`/rfqs/new?fromReqId=...`): allowed for approver/procurement admin once requisition is approved.
     1. Select at least one vendor (required) and due date (future).
     2. Saving creates **Draft** RFQ linked to requisition lines.
   - **Send RFQ**: from detail view, click **Send** → status becomes **Sent**.
   - **Receive Quotes**: mock data provides quotes under **Received** status; table highlights best price/lead time.
   - **Negative Paths**:
     - Attempting to create without vendors shows validation error.
     - RFQ send button stays disabled if API fails (known defect QA-002).

6. **Purchase Orders (PO)**
   - **PO Draft Creation**: in RFQ detail, select winning vendor and choose **Create PO Draft** → PO appears under `/pos`.
   - **Issue PO** (`/pos/[id]`): review linked requisitions, click **Issue** to update status to **Issued**. Double-click currently triggers duplicate requests (defect QA-010).

7. **Vendor Management** (`/vendors`)
   - Procurement admin can add, edit, delete vendors.
   - Validations: unique name, email format, rating 1..5 (keyboard increment beyond 5 is a defect QA-004).
   - Delete currently lacks confirmation dialog (defect QA-009).

8. **Approval Rules Settings** (`/settings/approval-rules`)
   - Only procurement admin can access.
   - Add conditions (amount ≥ X, category, cost center) and ordered approver steps.
   - Rules apply when requisitions submitted. Current issue: finance step missing in high-value IT scenario (QA-001).

9. **Locale & Theme**
   - Switch between English and Indonesian via header select; data persists across pages.
   - Locale change inside modals may reset inputs (defect QA-007).
   - Toggle light/dark theme; state persists per user.

10. **Negative Flows & Error Handling Summary**
    - **Validation Errors**: Forms prevent submission until corrected (quantity, due date, vendor requirement).
    - **RBAC**: Unauthorized users redirected to `/dashboard` if accessing restricted routes.
    - **Returns/Rejections**: Returned requisitions revert to Draft with comment visible; user must edit and resubmit.
    - **Network Failures**: React Query surfaces toasts; user may retry (some actions currently lack retry enablement).
11. **Vendor Self-Service Quotes** (`/vendor`)
    - Vendors follow a public link, enter the RFQ ID, and complete the quote form without authentication.
    - Form validates contact info, per-item pricing, and a math captcha to deter bots.
    - Successful submissions appear instantly in the RFQ comparison table; resubmitting with the same email updates the prior quote.
    - If captcha or RFQ ID is invalid, submission is rejected; closed RFQs cannot accept new quotes.

## Testing

```bash
npm run test
```

Vitest covers schema validation and approval rule evaluation. Playwright-based QA assets live under `qa/` (see `qa/PLAYWRIGHT/README.md`).

## Project Structure

- `app/` – Next.js app routes and API handlers
- `components/` – UI primitives, feature components, layouts
- `lib/` – Schemas, domain services, API helpers, in-memory DB
- `stores/` – Zustand stores for auth and preferences
- `tests/` – Vitest unit tests
- `qa/` – QA strategy, manual cases, Playwright automation, reports

## Tooling

- ESLint + Prettier for linting/formatting
- TailwindCSS utilities with shadcn/ui components
- TanStack Query for fetching and caching
- Recharts for dashboard visualizations
- Playwright + axe-playwright for end-to-end and accessibility testing
- Zustand for persisted auth & preferences
