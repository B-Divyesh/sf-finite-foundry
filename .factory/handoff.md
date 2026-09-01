# Finite Foundry handoff

## What was built

- A complete six-chapter incremental routing campaign with three seeded contract choices per chapter.
- Five-minute simulated production shifts using a deterministic 100 ms fixed step.
- Six escalating constraints: recipe order, cooling, power, fragile-stock spacing, scrap recovery, and the final complete route.
- Forecasts, retryable quota failure, pause/resume, pause on hidden tabs, and no offline accrual.
- A final dismantling interaction, credits ending, exportable JSON record, and one-action campaign restart.
- Keyboard, pointer, and touch input; numbered keyboard placement; 390 px responsive layout; persistent synthesized sound control.
- Local campaign storage plus an isolated `/demo` and `/?demo=1` sandbox with seed `240319`, sample route, reset, and 10× clock.
- Offline reload support through a service worker and a visible offline state.
- A $5 one-time Sociobot checkout and license flow. The free campaign is complete. A valid license adds twelve playable post-ending contracts.
- `/privacy`, `/terms`, SPA not-found handling, standalone `404.html`, route-specific titles, canonical metadata, social preview, sitemap, robots file, CSP, and security headers.
- A product-specific risograph system, self-hosted OFL fonts, and an original generated factory illustration. Provenance and prompt are in `.factory/design.md` and `assets/src/`.

## Run and deploy

```sh
npm install
npm test
npm run build
```

Deployment is static. The exact build command is `npm run build`, and the output root is `dist/`. `dist/index.html` is present after a clean build.

## Verification completed September 1, 2026

- `npm test`: 13 passed in 21.9 seconds.
- Claim suite: scripted six-chapter ending, free run, save/pause/reload, JSON export, demo isolation and same-origin requests, offline reload, sound persistence, seeded contracts, and twelve licensed bonus orders all passed.
- Accessibility: Playwright axe found no serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`, or the SPA 404.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4174/ .factory/evidence`: passed with no console errors, one `h1`, `lang=en`, one main landmark, no missing alt text, and no unlabeled buttons.
- Mobile layout: Playwright at 390 × 844 reported no page-level horizontal overflow.
- Lighthouse 12.8.2 mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse timings: LCP 1.8 s, FCP 1.2 s, TBT 0 ms, CLS 0.034.
- Four-times CPU-throttled 390 × 844 animation sample: 60.0 fps, 16.7 ms p95 frame interval over two seconds.
- Production bundles: JavaScript 36.2 KB raw / 12.0 KB gzip; CSS 21.6 KB raw / 5.4 KB gzip; fonts 58.4 KB total; mobile hero 59.4 KB; desktop hero 179.9 KB.
- `npm audit --omit=dev`: no vulnerabilities.
- `git diff --check`: clean.

## Known deployment dependency

The factory still needs to register the `finite-foundry` product and $5 price with the Sociobot billing service. The app uses the required slug-based checkout and verification URLs and does not hardcode a provider product ID.

No infrastructure, DNS, shared databases, secrets, or resources outside this repository were accessed or changed.
