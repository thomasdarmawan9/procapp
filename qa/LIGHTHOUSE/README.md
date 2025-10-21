# Lighthouse CI Instructions

> **Prerequisites:** Chrome 121+, Node 18+, Lighthouse CLI (`npm install -g lighthouse` or use `npx`). Ensure app running at `http://localhost:3000`.

## Budgets
- **Performance:** ≥ 80
- **Accessibility:** ≥ 85 (aligns with Axe goal of 0 serious issues)
- **Best Practices:** ≥ 80
- **SEO:** ≥ 80
- **Largest Contentful Paint:** ≤ 3.0 s
- **Total Blocking Time:** ≤ 300 ms

## Quick Run
```bash
npm run dev &
APP_PID=$!
npx lighthouse http://localhost:3000/dashboard \
  --preset=desktop \
  --output=json \
  --output-path=./qa/LIGHTHOUSE/dashboard.report.json \
  --budgets-path=./qa/LIGHTHOUSE/budgets.json
kill $APP_PID
```

## Budgets File Example (`qa/LIGHTHOUSE/budgets.json`)
```json
[
  {
    "path": "/dashboard",
    "resourceSizes": [
      { "resourceType": "total", "budget": 2500 }
    ],
    "timings": [
      { "metric": "interactive", "budget": 4000 }
    ]
  }
]
```

## GitHub Actions Integration (snippet)
```yaml
- name: Lighthouse Audit
  run: |
    npm run dev &
    npx wait-on http://localhost:3000
    npx lhci collect --url=http://localhost:3000/dashboard --numberOfRuns=1
    npx lhci assert --preset=lighthouse:recommended
```

## Reporting
- Store JSON results under `qa/LIGHTHOUSE/reports/`.
- Compare metrics against prior sprint; raise defects if below thresholds.

