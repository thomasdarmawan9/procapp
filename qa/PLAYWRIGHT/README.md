# Playwright Test Suite

> **Prerequisites:** Install dependencies `npm install` (includes @playwright/test). Install browsers with `npx playwright install`.

## Commands
- `npm run test:e2e` – Run full regression (chromium desktop).
- `npm run test:e2e -- --project=chromium-mobile` – Run specific project.
- `npm run test:e2e:ui` – Launch Playwright UI mode.
- `npm run test:axe` – Run accessibility subset under `tests/accessibility`.
- `npm run test:trace` – Open latest trace after failures.

## Fixtures & Helpers
- `fixtures/test-fixtures.ts` – Provides `authAs`, `seedData`, `mockApi` utilities.
- `helpers/form-helpers.ts` – Common form interactions & toast assertions.
- `tests/utils/axe.ts` – Axe scan integration (axe-playwright) returning violation report.

## Visual Regression
- Snapshot expectations stored under `qa/PLAYWRIGHT/tests/e2e/__screenshots__/*` (auto-created). Review diffs in `test-results/`.
