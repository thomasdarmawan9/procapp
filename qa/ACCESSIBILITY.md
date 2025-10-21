# Accessibility Test Notes

> **How to run Axe:** `npm run test:axe` (leverages Playwright + axe-playwright). Ensure app running locally (`npm run dev`).

## WCAG 2.1 AA Checklist Highlights
| Guideline | Pages | Validation Method | Status |
| --- | --- | --- | --- |
| 1.1.1 Non-text Content | Global (icons, avatars, attachments) | Inspect aria-label/alt attributes | Pending |
| 1.3.1 Info and Relationships | Forms (/requisitions/new, /vendors) | Axe + manual labels | Pending |
| 1.4.3 Contrast (Minimum) | Status badges, buttons | Tailwind design tokens + manual | Pending |
| 2.1.1 Keyboard | Navigation, dialogs | Manual tab-through | Pending |
| 2.4.3 Focus Order | Modals, sheet drawers | Manual + Playwright a11y test | Pending |
| 3.3.1 Error Identification | Form errors (Zod) | Manual check that error text linked via `aria-describedby` | Pending |
| 4.1.2 Name/Role/Value | shadcn/ui components | Axe scans + React DevTools | Pending |

## Axe Rules Targeted
- `aria-allowed-attr`
- `aria-required-children`
- `color-contrast`
- `form-field-multiple-labels`
- `label` / `aria-label`
- `scrollable-region-focusable`
- `duplicate-id`

**Goal:** 0 Serious/Critical violations on dashboard, requisition create/detail, approvals inbox, RFQ compare, PO detail, vendors, settings.

### Additional Manual Checks
- Focus trapping in dialogs/sheets.
- Toast announcements have `role="status"` or `aria-live`.
- Locale switch maintains language attributes (`lang`).
- Table semantics: `<th scope="col">` present.
- Keyboard activation for dropdowns (Enter/Space).

## Reporting
- Log accessibility defects in `/qa/DEFECTS/` using severity aligned with impact (e.g., missing labels = Major).
- Capture screenshots with focus indicators visible.
