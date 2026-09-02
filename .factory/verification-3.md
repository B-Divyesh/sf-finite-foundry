# Independent verification 3 — PASS

Verified September 2, 2026 against candidate commit `92926670792ef6885edcf05bb36ca278e4440d7d` at <https://finite-foundry.sociobot.in>.

## Result

**PASS.** No release-blocking, high, medium, or low defects were found. The deployed home HTML, JavaScript, and CSS matched the locally built candidate byte-for-byte.

## First-read and demo

A cold 1440px live visit showed the game itself: chapter-one contract choices are visible in the first viewport, rather than a menu wall. The page says it is a six-chapter factory campaign, says it is for factory-game players who want short planning sessions instead of endless resets, and makes **Try it with sample data** the first primary action. Its adjacent outcome copy says it opens chapter two with a complete route and does not touch the campaign. This satisfies the plain-language and one-click sandbox requirements.

The cold load had no console/page errors and requested only same-origin HTML, self-hosted fonts, JS, and CSS.

## Required claims gate

Clean setup: `npm ci` completed with 0 reported vulnerabilities. All 19 exact test commands listed in `.factory/claims.json` passed when run against the demo entry point:

| Claim | Result |
| --- | --- |
| `seeded-contracts`, `deterministic-contracts` | PASS |
| `campaign-ending`, `finite-free-run` | PASS |
| `local-save-pause`, `hidden-tab-pause` | PASS |
| `export-import-roundtrip`, `demo-isolation`, `demo-setup` | PASS |
| `offline-reload`, `sound-setting`, `shift-duration` | PASS |
| `input-modes`, `privacy-surface`, `frame-rate` | PASS |
| `purchase-availability`, `demo-paths`, `simulation-step`, `asset-provenance` | PASS |

The complete `npm test` suite subsequently completed with `27/27` passed (`test-results/.last-run.json`: `status: passed`). `npm run build` passed (`tsc --noEmit && vite build`) and produced `dist/`; built initial JS was 32.69 kB raw / 10.84 kB gzip and CSS was 23.19 kB raw / 5.63 kB gzip.

One earlier back-to-back claim invocation observed `ERR_CONNECTION_REFUSED` before `/demo` loaded because Playwright reused a prior test's just-closing local static server. The same exact `sound-setting` command passed on fresh retry, the isolated exact-claim sweep passed, and the full suite passed. This was a runner handoff race, not an application assertion failure.

## Game and live deployment checks

- A deterministic live `/demo?test=1` run selected valid routes across all six chapters, dismantled the machine, and reached **You finished the foundry**.
- A deliberately under-forecast route reached **Quota missed** and exposed **Replan this shift**, confirming loss and recovery.
- Passing claim tests covered restart-to-chapter-one, local save/pause, hidden-tab pause, demo isolation/reset, export/import confirmation, sound persistence, pointer/keyboard/touch placement, both demo URLs, offline reload, and the fixed 100 ms simulation.
- SHA-256 matched exactly between candidate `dist/` and live assets: `index.html` `a297c0cc…da6512`, JS `5f7ea618…73d77`, CSS `68d3895c…ef41d1`.
- No product server endpoints or sign-in exist; therefore no API allowance/rate-limit or Entra check applies.

## Privacy, accessibility, mobile, and delivery

- Cold live request logging and the privacy claim found no cross-origin game-data, analytics, checkout, account, or third-party font/script requests. The static CSP limits `connect-src` to `'self'`.
- Live 390px Axe scans for `/`, `/play`, `/demo`, `/privacy`, `/terms`, and the 404 returned **0 serious/critical** violations on every route.
- Local browser coverage confirmed one `h1`, `main`, language/title metadata, route focus restoration, keyboard route controls, 44px visible targets, no 390px horizontal overflow, designed focus styling, and reduced-motion behavior.
- Live headers include HSTS, CSP with `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and a restrictive permissions policy. Hashed JS uses `max-age=31536000, immutable`; HTML/service worker use `max-age=30, must-revalidate`; unknown routes return HTTP 404.
- The active-shift claim test passed at p95 frame interval ≤20 ms. The service-worker offline-reload claim passed.

## Defects by severity

None.

