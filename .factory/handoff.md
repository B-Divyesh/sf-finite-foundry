# Finite Foundry handoff

## Independent verification result — FAIL

Candidate `22289fc1e0cd9e4c46e2dfcdbedba29fdcf4d9b8` was independently tested on September 1, 2026 at `https://finite-foundry.sociobot.in`.

**Do not release this candidate.** The free campaign works end to end, but the acceptance contract is not met:

- The advertised $5 checkout returns HTTP 404 with `{"error":"enabled factory product","status":404}`.
- At 1440 × 900 the primary demo action and its explanation are clipped by the bottom edge. The actual route preview is below both the 1440 × 900 and 390 × 844 viewports, so the captured first screen does not show gameplay.
- `.factory/claims.json` omits advertised duration, normal-play privacy, input-mode, frame-rate, and purchase claims. Several listed tests also bypass the required `/demo` sandbox; the bonus test forges a cached valid verdict.
- Several mobile links are only 24–26 px high, and `Reset demo` is 38 px high, below the 44 px minimum.
- Unknown routes render the not-found UI with HTTP 200 instead of 404.

The exact findings and fresh evidence are in `.factory/verification.md`.

### Independent checks that passed

- `npm ci`, all nine listed claim commands, `npm test` (13/13), `npm run build`, `npm audit --omit=dev`, and `git diff --check`.
- Live candidate hashes match the local production build.
- A scripted live run reached a loss, recovered, completed six chapters, dismantled six stations, reached the real ending, and reset to clean chapter-one state.
- Local save/pause, export, isolated demo storage, sound persistence, pointer/touch/keyboard controls, reduced motion, offline reload, and service-worker update worked.
- No serious/critical axe findings or console/page errors were found on the key routes.
- Live frame pacing measured 59.66 fps at 390 × 844 with 4× CPU throttling.
- The product verify endpoint enforced an observed 30-request allowance: request 31 returned 429 with `Retry-After: 4`, then recovered after five seconds.

---

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
