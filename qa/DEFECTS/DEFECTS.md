# Defect Log

## QA-001 – Approval rule fails to insert finance step for high-value IT requisition
- **Severity / Priority:** Blocker / P0
- **Area:** Settings
- **Environment:** Local Chrome 121 / macOS 14.6 / 1280x800
- **Preconditions:** Approval rule "High value requires finance" exists (amount ≥ 100,000,000)
- **Steps:**
  1. Login as employee, create requisition with total 120,000,000 IDR category IT.
  2. Submit requisition.
  3. Inspect approval timeline.
- **Expected:** Timeline includes finance step before procurement admin.
- **Actual:** Finance step missing; requisition auto-approves after approver.
- **Attachments:** screenshots/QA-001.png, traces/QA-001.zip
- **Logs:** console: none; network: POST /api/requisitions/:id/submit 200 (missing finance role).
- **Notes:** Rule evaluator merges rules but dedupes finance incorrectly.
- **Build/Commit:** 8fd1a4c
- **Triage:** Owner=Backend, Root Cause=Normalization bug, Fix Version=v1.0.1, Status=Open

## QA-002 – RFQ send button stuck disabled after network retry
- **Severity / Priority:** Critical / P1
- **Area:** RFQ
- **Environment:** Local Chrome 121 / macOS 14.6 / 1280x800
- **Preconditions:** Draft RFQ exists.
- **Steps:**
  1. Intercept POST /api/rfqs/:id/send to return 500.
  2. Click "Send RFQ".
  3. Remove interception and retry clicking Send.
- **Expected:** Button re-enabled to allow retry.
- **Actual:** Button stays disabled; must refresh page.
- **Attachments:** screenshots/QA-002.png, traces/QA-002.zip
- **Logs:** console error "Failed to send RFQ".
- **Notes:** Mutation pending flag never reset on failure.
- **Build/Commit:** 8fd1a4c
- **Status:** Open

## QA-003 – Approval return allows empty comment
- **Severity / Priority:** Critical / P1
- **Area:** Approvals
- **Environment:** Local Firefox 121 / macOS 14.6 / 1280x800
- **Preconditions:** Submitted requisition available.
- **Steps:**
  1. Approver clicks Return.
  2. Leave comment blank and confirm.
- **Expected:** UI validation requires comment.
- **Actual:** Return succeeds with empty comment.
- **Attachments:** screenshots/QA-003.png
- **Notes:** Business rule mandates audit comment.
- **Status:** Open

## QA-004 – Vendor rating accepts value >5 via keyboard
- **Severity / Priority:** Major / P1
- **Area:** Vendors
- **Environment:** Local Chrome 121 / macOS 14.6 / 768x1024
- **Steps:**
  1. Open Add Vendor.
  2. Focus Rating field, press ArrowUp until 7.
  3. Save.
- **Expected:** Validation blocks rating >5.
- **Actual:** Vendor saved with rating 7.
- **Status:** Open

## QA-005 – Requisition attachments allow 8MB file without warning
- **Severity / Priority:** Major / P1
- **Area:** Requisition
- **Environment:** Local Chrome 121 / macOS 14.6
- **Preconditions:** 8MB file ready.
- **Steps:** Upload file on requisition form.
- **Expected:** Upload rejected >5MB.
- **Actual:** File accepted.
- **Status:** Open

## QA-006 – RFQ comparison highlight contrast insufficient
- **Severity / Priority:** Major / P2
- **Area:** RFQ
- **Environment:** Local Chrome 121 / macOS 14.6
- **Steps:** Open RFQ with quotes.
- **Expected:** Highlighted cell has contrast ≥4.5:1.
- **Actual:** Lime highlight vs white text = 2.8:1.
- **Status:** Open

## QA-007 – Locale switch resets draft vendor modal input
- **Severity / Priority:** Minor / P2
- **Area:** Vendors
- **Environment:** Local Chrome 121 / macOS 14.6
- **Steps:**
  1. Open Add Vendor modal, fill fields.
  2. Switch locale to ID.
- **Expected:** Inputs retain values.
- **Actual:** Fields reset.
- **Status:** Open

## QA-008 – Mobile view horizontal scroll on approvals table
- **Severity / Priority:** Minor / P3
- **Area:** Approvals
- **Environment:** Chrome DevTools Pixel 5
- **Steps:** View /approvals at 360px width.
- **Expected:** Table responsive without horizontal scroll.
- **Actual:** Horizontal scroll appears.
- **Status:** Open

## QA-009 – API DELETE /api/vendors allowed for procurement admin without confirmation
- **Severity / Priority:** Critical / P1
- **Area:** Vendors
- **Environment:** Local Chrome 121
- **Steps:**
  1. On vendors list, inspect network.
  2. Click delete icon.
- **Expected:** Confirmation dialog.
- **Actual:** Immediate deletion without confirmation.
- **Status:** Open

## QA-010 – PO detail Issue button lacks loading state causing double submissions
- **Severity / Priority:** Major / P2
- **Area:** PO
- **Environment:** Local Chrome 121
- **Steps:**
  1. Open PO detail.
  2. Double-click Issue.
- **Expected:** Button disables/spinner.
- **Actual:** Two PATCH requests fired; status toggles incorrectly.
- **Status:** Open

