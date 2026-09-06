# Browser-game review 4 — PASS

Reviewed September 6, 2026 at <https://finite-foundry.sociobot.in>.

## Verdict

**PASS. Zero findings. Zero untested claims.**

This was a fresh cold-player review. No product code was changed. The product implementation reviewed is `5249a8e50593700ab3cb3dae69b5e1acb311692f`; later commits through documentation checkout `b77d0381a75e87491e86d521659ae286689a2de0` are reports, evidence, tests, or product documentation. The current build from that checkout exactly matches the live HTML, JavaScript, and CSS.

## First screen

Fresh desktop (1440 × 900) and phone (390 × 844) browser contexts were opened at `/` before scrolling or inspecting source.

| Check | Visible result on both screens |
| --- | --- |
| Job | `Finish a six-chapter factory campaign` |
| Audience | `For factory-game players who want short planning sessions instead of endless resets.` |
| First action | `Try it with sample data` |
| Result of that action | It opens chapter two with a complete route, and demo changes do not touch the real campaign. |
| First-screen facts | Works offline after the first visit; campaign stays in this browser; complete campaign is free. |

Both cold loads used the route title `Finite Foundry — Finish a factory campaign`, had no console or page errors, and made no cross-origin requests.

## Game runs

Two independent deterministic live runs used fresh browser storage and `/demo?test=1`:

| Device and input | Run evidence | Result |
| --- | --- | --- |
| Desktop, pointer | `.factory/evidence-review-4/live-ending-desktop.png` | Chose contracts, planned all six routes, completed all six shifts, dismantled the machine, and reached `You finished the foundry`. |
| Phone, touch | `.factory/evidence-review-4/live-ending-mobile.png` | Repeated the complete six-chapter run and reached the same end screen. The demo banner remained visible. |

The sample opened in one click with the persistent `Demo — sample data, nothing is saved` label, a named Juniper Kitchen contract, and the complete Cutter → Kiln → Cooling rack → Press route. Reset restores that sample. The exact demo-isolation claim also verified that reset, full-demo, Start for real, and browser Back preserve the real save byte-for-byte and clear demo data.

Normal, invalid, boundary, and recovery paths were exercised live. A reversed Press → Cutter route showed `Route needs work. Put Press after Cutter.` The valid Cutter → Press route at the 27-unit boundary showed `Forecast is 2 units short`, completed as `Quota missed`, then `Replan this shift` plus brisk pace produced `Contract complete`.

The full-run claim also confirms the one-tap new campaign flow returns to chapter one after the end screen. Export/import validation, confirmation, cancel-focus recovery, pause/resume, hidden-tab pause, closed-tab persistence, sound-setting persistence, pointer/touch/keyboard routing, and both demo entry URLs passed in their individual claim tests and the aggregate run.

## Claims and local checks

`npm ci` completed from the clean checkout with zero reported vulnerabilities. Every exact command in `.factory/claims.json` was run separately, and all 20 passed. Each declared ID occurs exactly once as an `@claim:` tag.

| Claims | Result |
| --- | --- |
| seeded-contracts; deterministic-contracts | PASS |
| campaign-ending; finite-free-run | PASS |
| local-save-pause; hidden-tab-pause | PASS |
| export-import-roundtrip; demo-isolation; demo-setup | PASS |
| offline-reload; sound-setting; shift-duration | PASS |
| input-modes; privacy-surface; frame-rate | PASS |
| purchase-availability; demo-paths; simulation-step | PASS |
| asset-provenance; source-license | PASS |

`npm test` passed **29/29**. `npm run build` passed and produced `dist/`. Initial application JavaScript is 34.02 kB raw / 11.13 kB gzip; CSS is 25.36 kB raw / 6.01 kB gzip.

Current public copy on the landing page, README, privacy page, terms page, and 404 was cross-checked against the claims manifest. There are no unlisted visitor-facing claims and no untested declared claims.

## Live checks

- The locally built and live hashes match: `index.html` `145a9a5b…e2a0d`, JavaScript `f23056a0…e013b`, and CSS `063d9c31…3005`.
- The live phone p95 animation-frame interval was 16.7 ms with 4× CPU throttling, within the advertised 20 ms limit.
- A fresh service-worker-controlled live `/demo` reload worked offline. It retained the demo banner and the `Make room for heat` game screen with no errors.
- `verify-url.sh` reported HTTP 200, 588 ms load time, correct title and language, one h1, one main landmark, no images missing alt text, no unlabeled buttons, and no errors. Evidence is in `.factory/evidence-review-4/verify-url/`.
- Live Axe scans at 390 px found zero serious or critical issues on `/`, `/play`, `/demo`, `/privacy`, `/terms`, and `/missing-page`. Each page fit within 390 px. The browser's expected failed-resource console message for the deliberate HTTP 404 was not classified as a defect.
- Internal links to `/`, `/play`, `/demo`, `/privacy`, and `/terms` each returned 200. `/missing-page` returned the designed HTTP 404 with a working return-home path.
- Live response headers include HSTS, `nosniff`, strict-origin referrer policy, restrictive permissions policy, and a CSP with `connect-src 'self'` and `frame-ancestors 'none'`.
- Cold live loads made no cross-origin requests. The exact privacy and demo-isolation tests additionally exercised gameplay, pause, sound, reset, and exit paths and found only same-origin bodyless GET requests. There are no accounts, analytics, checkout, payment form, or third-party fonts/scripts.

This is a static browser game. It has no product backend, account tenant, health endpoint, live allowance endpoint, or rate-limit endpoint. Backend tenant-isolation, restart-persistence, and 429/Retry-After checks are therefore not applicable.

## Earlier findings

All 41 earlier findings were rechecked. The verification reports contained no independent findings to reopen.

| Earlier finding | Current disposition |
| --- | --- |
| F-1-1 | Fixed: local-save pause passed independently and in the 29-test suite. |
| F-1-2 | Fixed: exact sample action and its outcome/isolation text are visible before scrolling. |
| F-1-3 | Fixed: local mobile checks measure visible controls at least 44 × 44 px, including 404. |
| F-1-4 | Fixed: complete-run test checks prohibited paid/manipulative surfaces and request origin. |
| F-1-5 | Fixed: three distinct named contract choices and their quotas are asserted. |
| F-1-6 | Fixed: the claim and test use p95 frame interval at or below 20 ms. |
| F-1-7 | Fixed: real-save bytes are preserved across every demo exit path. |
| F-1-8 | Fixed: unproved pace advice is absent. |
| F-1-9 | Fixed: deterministic-contract claim and tagged core proof exist. |
| F-1-10 | Fixed: hiding the tab pauses and stabilizes the active shift. |
| F-1-11 | Fixed: chapter-two sample, complete route, and 10× clock have a tagged proof. |
| F-1-12 | Fixed: privacy crawl rejects account, analytics, checkout, payment, and license surfaces. |
| F-1-13 | Fixed: unsupported Node compatibility promise is absent. |
| F-1-14 | Fixed: unlisted compound test-description promise is absent. |
| F-1-15 | Fixed: unlisted build-output promise is absent. |
| F-1-16 | Fixed: unlisted framework promise is absent. |
| F-1-17 | Fixed: fixed 100 ms simulation has a tagged proof. |
| F-1-18 | Fixed: font and generated-art provenance are claimed and checked. |
| F-1-19 | Fixed: unlisted deployment-platform promise is absent. |
| F-1-20 | Fixed: Terms metadata correctly says bonus contracts are unavailable. |
| F-1-21 | Fixed: landing includes `How it works` and `Privacy and limits`. |
| F-1-22 | Fixed: the live 404 has full metadata and matching site chrome. |
| F-1-23 | Fixed: export/import provides validation, preview, confirmation, restoration, and demo separation. |
| F-1-24 | Fixed: audience copy is concrete and concise. |
| F-1-25 | Fixed: sound control names its next action. |
| F-1-26 | Fixed: footer describes the campaign outcome plainly. |
| F-1-27 | Fixed: unexplained `offline accrual` wording is absent. |
| F-1-28 | Fixed: demo is described as a separate save. |
| F-1-29 | Fixed: storage behavior is explained in player language. |
| F-1-30 | Fixed: reviewed public sentences satisfy the 22-word limit. |
| F-1-31 | Fixed: SIL Open Font License is written in full. |
| F-1-32 | Fixed: sample and sound controls name their results. |
| F-2-1 | Fixed: first phone demo view shows notice, named sample, complete route, and run action. |
| F-2-2 | Fixed: browser Back clears demo state without changing real data. |
| F-2-3 | Fixed: offline fact appears on the first screen. |
| F-2-4 | Fixed: privacy wording matches the tested campaign and sound-setting boundary. |
| F-2-5 | Fixed: import cancellation restores focus to the visible trigger. |
| F-2-6 | Fixed: unlisted chapter-design claim is absent. |
| F-2-7 | Fixed: 404 uses `Page not found` and `Return home`. |
| F-2-8 | Fixed: 404 has no unlisted save-integrity claim. |
| F-2-9 | Fixed: source-license claim and MIT test exist. |

## Evidence

- `.factory/evidence-review-4/live-cold-desktop.png`
- `.factory/evidence-review-4/live-cold-phone.png`
- `.factory/evidence-review-4/live-ending-desktop.png`
- `.factory/evidence-review-4/live-ending-mobile.png`
- `.factory/evidence-review-4/verify-url/verify.json`
