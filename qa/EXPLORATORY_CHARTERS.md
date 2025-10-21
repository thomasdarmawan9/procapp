# Exploratory Testing Charters

> **How to use:** Pick a charter, timebox the session, capture notes/defects. Apply heuristics listed.

## Charter 1 – Break the Requisition Form
- **Timebox:** 60 minutes
- **Mission:** Stress the requisition creation/edit experience.
- **Heuristics:** RCRCRC (Recent, Core, Risky, Configuration, Regression, Constraints), Boundary Testing
- **Focus Areas:**
  - Rapidly adding/removing 20+ line items
  - Extreme numeric values (qty, price), currency variations
  - Large attachments (4.9 MB vs 5.1 MB, unsupported MIME)
  - Switching locales mid-entry, then toggling dark mode
  - Autosave or data loss on navigation/back
- **Notes Template:** Input matrix, UI feedback, console/network errors.

## Charter 2 – RBAC Anomalies
- **Timebox:** 45 minutes
- **Mission:** Expose authorization leaks across roles.
- **Heuristics:** SFDIPOT (Structure, Function, Data, Interfaces, Platform, Operations, Time), CRUD
- **Focus Areas:**
  - Direct navigation via URL deep links for restricted pages
  - API calls using fetch from lower-privilege roles
  - Session switching without logout; cookie tampering
  - Concurrent tabs with different roles
  - Visibility of action buttons (approve, edit, settings)

## Charter 3 – Network Chaos & Offline
- **Timebox:** 40 minutes
- **Mission:** Observe resilience under adverse network conditions.
- **Heuristics:** FEW HICCUPPS (Fast, Error-prone, Workflow, Hard to use...), Resilience
- **Focus Areas:**
  - Throttled 3G vs offline toggles
  - API 500/404 injected via devtools/mock service worker
  - Retry messaging, skeletons, stale cache display
  - Form submission while connection drops

## Charter 4 – Locale Switch Marathon
- **Timebox:** 35 minutes
- **Mission:** Validate localization toggling & data integrity.
- **Heuristics:** i18n, State Transition, Data Consistency
- **Focus Areas:**
  - Switch EN ↔ ID during form entry, approval actions
  - Verify currency/date formatting per locale
  - Placeholder keys unresolved
  - Mixed-language error messages
  - Persisted locale in Zustand store across reloads

## Charter 5 – Quote Comparison UX Extremes
- **Timebox:** 50 minutes
- **Mission:** Challenge RFQ comparison with edge data.
- **Heuristics:** Comparative Testing, High Data Volume
- **Focus Areas:**
  - Vendors with 60+ char names, multiline terms
  - Quotes with identical totals/lead times (tie scenarios)
  - Large item matrices (15+ items) verifying sticky headers
  - Accessibility of highlighted cells (contrast, ARIA)
  - Creating PO after modifications to quote data

