# Finish a factory campaign — verification 5

Verified September 6, 2026 at <https://finite-foundry.sociobot.in>.

## Verdict

**PASS — 0 findings and 0 untested claims.**

- Job: finish a six-chapter factory campaign.
- Audience: factory-game players who want short planning sessions instead of endless resets.
- First action before scrolling: **Try it with sample data**. It says the sample opens chapter two with a complete route and does not change the campaign.
- Implementation reviewed: `5249a8e50593700ab3cb3dae69b5e1acb311692f` (`style: show full demo contract on phones`).
- Documentation checkout: `2a98699a84bc00f4dd8897940c46e9481a31ba68` (`docs: record strict review five`).
- Live implementation match: current built `assets/index-BZRHj_P6.js` SHA-256 `f23056a0956ab57a00ceae0ad9f8424942634b4dde9ac578a5dcb68fb8ee013b` and `assets/style-t3468n0K.css` SHA-256 `063d9c317fbe86bcf36e104cc035ec55ec193c867ac10b57b891f5d6b4530055` exactly equal the live files.

## Engines and gameplay

Playwright 1.58.2 was installed from the pinned package. Firefox 146.0.1 (Playwright build 1509) and WebKit 26.0 (build 2248), plus their documented Linux dependencies, were installed for this review. Chromium was Playwright Chromium 145.0.7632.6 (build 1208).

Fresh desktop and 390 × 844 touch sessions in all three engines showed the h1, audience sentence, sample action, outcome sentence, and an operable contract before scrolling. Each engine completed the deterministic six-chapter demo, dismantled the machine, and reached the real `You finished the foundry` ending. The cross-engine run also confirmed invalid-route feedback, restart to chapter one, reload recovery to a paused shift, touch placement, and audio context creation only after a player gesture. End-screen captures are in `evidence-verification-5/*-desktop-ending.png`; the machine-readable result is `evidence-verification-5/engine-coverage.json`.

Firefox's Playwright driver does not support its `isMobile` option. Its supported 390 × 844 `hasTouch` viewport was used instead, and touch placement passed. This is worker-driver infrastructure, not a product defect. The product does not promise multiplayer or backend service; tenant isolation, process-restart persistence, health, and 429/Retry-After checks do not apply.

## Claims and quality checks

From this clean checkout, `npm ci` completed with 0 vulnerabilities. Every one of the 20 exact commands from `.factory/claims.json` was run separately and passed:

`seeded-contracts`, `deterministic-contracts`, `campaign-ending`, `finite-free-run`, `local-save-pause`, `hidden-tab-pause`, `export-import-roundtrip`, `demo-isolation`, `demo-setup`, `offline-reload`, `sound-setting`, `shift-duration`, `input-modes`, `privacy-surface`, `frame-rate`, `purchase-availability`, `demo-paths`, `simulation-step`, `asset-provenance`, and `source-license`.

`npm test` passed 29/29 and `npm run build` passed, producing `dist/`. The build output has 11.13 KiB gzip initial JavaScript and 6.01 KiB gzip CSS. The live scripted verification passed with no console errors, no cross-origin or data-bearing requests, no failures, and active-shift p95 frame time 16.7 ms against the 20 ms claim.

The one-click `/demo` sample has its persistent **Demo — sample data, nothing is saved** label. It starts as a realistic chapter-two route, Reset demo restores it, Start for real discards the demo namespace, and the real save stayed byte-for-byte unchanged through demo activity. Export/import, damaged-file recovery, hidden-tab pause, offline reload after service-worker control, keyboard controls, settings persistence, reduced motion, and the loss/replan path were covered by the passing claim suite and live run.

`/opt/fleet/lib/verify-url.sh` passed against the live URL: HTTP 200, title, `lang=en`, one h1, main landmark, no missing alt text or unnamed buttons, and no console errors. Playwright Axe coverage in the suite passed with no serious or critical violations across the app routes and designed 404. The standalone `npx @axe-core/cli` could not launch Selenium Chrome because this worker supplies Playwright Chromium rather than a system Chrome binary; this worker limitation is separately recorded and is not an untested product accessibility claim.

Live route titles, legal pages, privacy language, links, service-worker update/offline behavior, focus restoration, visible focus, touch target sizes, and 390 px overflow checks passed. `/definitely-missing` deliberately returns HTTP 404 with the designed recovery page; it is expected behavior, not a finding. Live headers include CSP with `frame-ancestors 'none'`, HSTS, nosniff, strict-origin referrer policy, and restrictive permissions policy.

## Earlier findings

All earlier reports were reviewed: `verification.md`, `verification-2.md`, `verification-3.md`, `verification-4.md`, and `review-1.md` through `review-5.md`.

| Earlier item | Current disposition |
| --- | --- |
| Unavailable payment, paid-progress surface | Closed. The complete campaign is free and all routes expose no checkout, license, payment, ads, energy, loot, or paywall surface. |
| First screen did not show the game | Closed. Desktop and phone sessions show an operable contract in the first viewport. |
| Incomplete claims or demo isolation | Closed. All 20 declared claims passed individually; demo, reset, exit, and request checks pass. |
| Phone targets and overflow | Closed. The suite's 390 px route sweep passes all visible controls and overflow checks. |
| Unknown route returned 200 | Closed. The live missing route returns HTTP 404 and a complete designed page. |
| F-1-1 through F-1-12: save/pause, copy, sample contracts, timing, seed, hidden tab, demo setup, and privacy | Closed by the named passing claim commands and live demo/reload runs. |
| F-1-13 through F-1-20: unsupported or unproved public statements, fixed simulation, art/font provenance, deployment claim, and terms metadata | Closed. Public copy remains claim-backed; source, simulation, provenance, and purchase-availability claims pass. |
| F-1-21 through F-1-32: structure, 404, import recovery, audience and controls copy, storage wording, copy audit, licenses, and control outcomes | Closed. Live navigation and accessibility checks pass; no earlier unlisted promise returned. |
| F-2-1 through F-2-9: phone demo first screen, back/reset isolation, offline wording, privacy scope, import focus, 404 copy, and source license | Closed by the phone, demo-isolation, offline, privacy, import, 404, and source-license checks. |

## Evidence and limits

- `evidence-verification-5/engine-coverage.json` records engine versions and cross-engine results.
- `evidence-verification-5/*-desktop-ending.png` records the real end screen in all engines.
- `evidence-verification-5/loss-recovery.json` records a live quota-missed loss and successful replan.
- `evidence-verification-5/verify-url/verify.json` records the live URL verifier result.
- `evidence-polish-2/live-check.json` was refreshed by the successful live scripted run.

Finding count: **0**. Untested public-claim count: **0**.
