# Independent verification 4 — PASS

Verified September 2, 2026 against candidate commit `751d26a6b49c321a5e60767605432a486c1ed70c` at <https://finite-foundry.sociobot.in>.

## Result

**PASS.** No release-blocking, high, medium, or low product defects were found. The live HTML, JavaScript, and CSS match the candidate build byte-for-byte.

## Mandatory first-read and demo gate

A cold 1440 × 900 live load shows the game itself: chapter-one contract choices are visible in the first viewport. It is not a menu wall.

- What it does: **“Finish a six-chapter factory campaign.”**
- For whom: **“For factory-game players who want short planning sessions instead of endless resets.”**
- What to click first: **“Try it with sample data.”** The adjacent text says it opens chapter two with a complete route and does not touch the real campaign.

One click opens the isolated sample with the persistent **“Demo — sample data, nothing is saved”** banner, Reset demo, Play full demo, and Start for real. The 390 × 844 demo viewport shows the named contract, all four placed machines, and Run five-minute shift.

Evidence: `evidence-verification-4/live-cold-desktop.png`, `live-cold-mobile.png`, and `live-demo-mobile.png`.

## Required claims gate

`.factory/claims.json` exists. From the clean candidate checkout, `npm ci` completed with zero reported vulnerabilities. Every one of its 20 exact commands passed independently:

| Claim | Result |
| --- | --- |
| `seeded-contracts`, `deterministic-contracts` | PASS |
| `campaign-ending`, `finite-free-run` | PASS |
| `local-save-pause`, `hidden-tab-pause` | PASS |
| `export-import-roundtrip`, `demo-isolation`, `demo-setup` | PASS |
| `offline-reload`, `sound-setting`, `shift-duration` | PASS |
| `input-modes`, `privacy-surface`, `frame-rate` | PASS |
| `purchase-availability`, `demo-paths`, `simulation-step` | PASS |
| `asset-provenance`, `source-license` | PASS |

Each claim ID has exactly one matching test tag. A landing-page and README cross-check found no unlisted visitor-facing claims.

## Clean checkout, tests, and build

- `npm test`: **29/29 passed** in 1.1 minutes.
- `npm run build`: **PASS** (`tsc --noEmit && vite build`), producing `dist/`.
- No separate lint script exists. Type checking is part of the production build.
- `npm audit --omit=dev`: zero vulnerabilities.
- Initial bundles: JavaScript 34.02 KiB raw / 11.13 KiB gzip; CSS 25.36 KiB raw / 6.01 KiB gzip; fonts total 58.44 KiB. All are within contract budgets.

## Candidate and deployment identity

The candidate build and live deployment matched exactly:

| Asset | SHA-256 | Match |
| --- | --- | --- |
| `index.html` | `145a9a5b62b37072a4ad4733187ad63cd9a52775d2fc027427dd656ebd7e2a0d` | yes |
| `assets/index-BZRHj_P6.js` | `f23056a0956ab57a00ceae0ad9f8424942634b4dde9ac578a5dcb68fb8ee013b` | yes |
| `assets/style-t3468n0K.css` | `063d9c317fbe86bcf36e104cc035ec55ec193c867ac10b57b891f5d6b4530055` | yes |

## Game acceptance run

The deterministic live run used the documented demo sandbox and accelerated test clock while preserving production rules:

1. Opened the title/first screen and entered the sample in one click.
2. Started the full demo at chapter one.
3. Selected a contract, built a valid route, ran production, and completed each of six chapters.
4. Dismantled every final station.
5. Reached the real **“You finished the foundry”** end screen with six contracts filled.
6. Selected **Start another campaign**, accepted confirmation, and returned to chapter one with three fresh contract choices.

The run covered active play and the advertised pointer, touch, and keyboard inputs. The end state is captured in `live-scripted-ending.png`.

Challenge and recovery evidence:

- Reversing Press and Cutter produced **Route needs work**, offered **Fix the route**, and exposed no start action.
- A valid lean route against the 27-unit boundary contract forecast short, reached **Quota missed**, and exposed **Replan this shift**.
- Replanning the same route at brisk pace reached **Contract complete**.
- A damaged version-99 JSON import showed a specific error, preserved the save byte-for-byte, and returned focus to Import campaign record after cancellation.
- Passing claim tests also cover pause/resume, hidden-tab pause, closed-page persistence, export/import confirmation, demo reset/isolation, sound persistence, and restart reset.

Live active-shift frame pacing measured a **16.7 ms p95 frame interval** over 120 frames, equivalent to approximately 60 fps and below the claimed 20 ms ceiling.

## Privacy, delivery, and PWA

- The cold load and complete live QA flow produced zero cross-origin requests, zero non-GET requests, and zero request bodies. There were no analytics, accounts, payment forms, third-party fonts/scripts, or campaign-data transmissions.
- Browser headers include CSP with `connect-src 'self'` and `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and a restrictive permissions policy.
- HTML and `sw.js` use `max-age=30, must-revalidate`; hashed assets use `max-age=31536000, immutable`.
- A fresh service-worker context successfully called `registration.update()`, gained a controller, switched offline, and reloaded `/demo` with the sample intact.
- Unknown routes return a designed HTTP 404. All navigational links resolve; the intentional 404 page's fragment-only skip link remains on that page.
- This is a static browser game with no server-side product or unlock endpoint, so API allowance/429 and persistence/concurrency checks do not apply. It has no sign-in, so the Entra authority requirement does not apply.

## Accessibility and responsive QA

- `/`, `/play`, `/demo`, `/privacy`, `/terms`, and the designed 404 have one `h1`, one `main`, correct titles/metadata, and zero Axe serious/critical findings. Mobile `/demo` also has zero serious/critical findings.
- `/opt/fleet/lib/verify-url.sh` reports HTTP 200, `lang="en"`, one `h1`, one `main`, no missing alt text, no unlabeled buttons, and no load errors.
- Keyboard-only play placed a machine, moved between route slots with ArrowRight, and removed one with Delete. The first Tab exposes the skip link with a visible 4 px ochre outline.
- At 390 px there is no horizontal overflow and no visible link, button, or label below 44 × 44 px. Touch placement works.
- At 200% browser zoom the heading, game, and primary run control remain visible.
- Reduced-motion mode computes transitions and animations to `0.01ms` and retains the visible focus state.

## Performance

Fresh mobile Lighthouse results:

| Category/metric | Result |
| --- | --- |
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP / LCP | 1.2 s / 1.3 s |
| CLS | 0.002 |
| TBT | 100 ms |
| Total transfer | 76 KiB |

A mobile Event Timing sample across route-edit interactions measured a maximum 48 ms event duration, below the 200 ms responsiveness budget.

Evidence: `.factory/evidence-verification-4/` (`live-check.json`, `supplemental-qa.json`, `interaction-timing.json`, `lighthouse.json`, screenshots, and `verify-url/`).

## Defects by severity

- Release-blocking: none.
- High: none.
- Medium: none.
- Low: none.
