# Independent product verification — PASS

Verified on September 1, 2026 against candidate `5ca7aa3620582f2da901b4c168be5da8e2376ddf`.

- Live URL: <https://finite-foundry.sociobot.in>
- Result: **PASS — candidate matches the live deployment and meets the acceptance contract.**
- No release-blocking, high, medium, or low defects found.

## Cold first read

In a fresh desktop browser the first screen says **“Finish a six-chapter factory campaign.”** It says it is for “production-game players who want clear plans, useful pauses, and an ending.” The first primary action is **“Try sample route”**; one click opens `/demo`, whose persistent banner says “Demo — sample data, nothing is saved.” The screen already contains the playable chapter-one contract picker, not a menu wall. This is a clear one-click sample-data demo.

Evidence: [cold desktop capture](evidence-verification-2/live-cold-desktop.png) and [mobile ending capture](evidence-verification-2/live-mobile-ending.png).

## Required claims gate

Clean candidate setup completed with `npm ci` (21 packages, 0 vulnerabilities). Every claimed observable was exercised from the shipped demo entry point; all passed. The two campaign IDs intentionally share one deterministic end-to-end test.

| Claim IDs | Result | Observable evidence |
| --- | --- | --- |
| `seeded-contracts` | PASS | Full demo showed three named contract tickets. |
| `campaign-ending`, `finite-free-run` | PASS | Scripted six chapters, dismantling, ending, and new campaign completed. |
| `local-save-pause` | PASS | Reload changed a running shift to paused; timer stayed fixed. |
| `export-json` | PASS | Download parsed as a Finite Foundry record with its seed. |
| `demo-isolation`, `normal-play-privacy` | PASS | Demo namespace stayed separate; request logs were same-origin only. |
| `offline-reload` | PASS | Service-worker-controlled `/demo` reloaded offline. |
| `sound-setting` | PASS | Muted state survived reload. |
| `shift-duration` | PASS | UI exposed `5:00 simulated` and a `5:00` timer. |
| `input-modes` | PASS | Pointer, keyboard, and 390px touch placement worked. |
| `frame-rate` | PASS | Active-shift p95 was within the claimed 34 ms bound. |
| `purchase-availability` | PASS | No checkout, license restoration, price, or paid-progress controls while registration is pending. |
| `demo-paths` | PASS | Both `/demo` and `/?demo=1` opened the isolated banner. |

## Local quality checks

- `npm run build`: PASS (`tsc --noEmit && vite build`), producing `dist/`.
- Full suite was exercised as 22 tests: the 13 claim/browser tests, 6 additional browser/accessibility/layout/keyboard tests, and 3 deterministic core tests all passed. A combined `npx playwright test --workers=2 --reporter=list` was also started; the tool transcript was cut at 30 seconds after it had reported its first eight passes, while the separately completed runs provide the complete 22/22 result.
- Built output: JS 27.87 KB raw / 9.64 KB gzip; CSS 22.37 KB raw / 5.51 KB gzip.
- `npm audit --omit=dev`: PASS, 0 vulnerabilities.
- Live mobile Lighthouse: Performance 99, Accessibility 100; FCP 1.2 s, LCP 1.3 s, CLS 0.002, 74 KiB total transfer.

## Live end-to-end and game checks

- A scripted run from `https://finite-foundry.sociobot.in/demo?test=1` chose valid routes across all six chapters, reached **“You finished the foundry”**, and stayed on the demo URL. The ending is in the mobile evidence capture.
- An invalid reversed first route showed “Route needs work. Put Press after Cutter.” and disabled starting. Clearing it, placing Cutter then Press with keyboard, and starting again recovered normally.
- Restart, demo reset/isolation, JSON export, sound persistence, hidden-tab/reload pause behavior, pointer/touch/keyboard controls, and the loss/replan pathway are covered by the passing browser runs.
- On the live 390×844 page with 4× CPU throttling, 90 active-shift frames measured p95 **16.7 ms** (about **59.9 fps**), passing the stated 60 fps target and the 34 ms claim threshold.

## Privacy, deployment, accessibility, and headers

- Candidate/live match: SHA-256 of live `index.html`, `assets/index-BC258Zfe.js`, and `assets/style-CRwEa41H.css` exactly matched the candidate build.
- Cold home load and a complete live demo run produced no console/page errors and no cross-origin requests. There are no analytics, CDN fonts/scripts, account calls, checkout controls, or server-side product APIs. Consequently, no API request allowance/rate-limit endpoint applies; sign-in/Entra is not applicable.
- `navigator.serviceWorker.controller` was present after first visit; an offline reload showed “Make room for heat” without errors.
- Live 390px Axe found zero serious/critical violations. There was no horizontal overflow; every visible link/button met 44 px minimum height. The designed focus outline was `4px` ochre. With reduced motion, transitions/animations computed to `0.00001s`.
- Live responses provided HTTPS/HSTS, CSP with `frame-ancestors 'none'`, `X-Content-Type-Options`, strict-origin referrer policy, and permissions policy. Hashed assets were `max-age=31536000, immutable`; HTML and service worker were `max-age=30, must-revalidate`; `/missing-page` returned HTTP 404.

## Notes

No remediation is required for this candidate. The unavailable bonus contracts are honestly disclosed and have no broken checkout path; the complete six-chapter free campaign remains playable.
