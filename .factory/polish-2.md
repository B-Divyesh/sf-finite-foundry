# Perfection-loop polish 2

Completed September 2, 2026 against candidate `1a37f79ff498aa71f716debabf4ef23360c42511` and adversarial review `df07a725ad20d7c9d062dfaeb64f17bd71c3fa3e`.

Production: <https://finite-foundry.sociobot.in>. Evidence is in `.factory/evidence-polish-2/`.

## Review 2 finding closure

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Added a compact risograph proof-strip before secondary file tools. At 390 × 844 it shows the demo notice, chapter, full client and product, all four machines, and the run action. | `the first phone demo viewport…`; `live-demo-mobile.png`; live `/demo`. |
| F-2-2 | Centralized demo cleanup and call it when History Back leaves demo mode. Both demo save and sound keys are cleared; the real save remains byte-identical. | `@claim:demo-isolation`; `live-check.json`; live `/` → `/demo` → Back → `/demo`. |
| F-2-3 | Replaced the duration fact with `Works offline after the first visit`; retained local-storage and free-price facts. | `@claim:offline-reload`; `live-cold-mobile.png`; live `/`. |
| F-2-4 | Narrowed the privacy sentence to campaign and sound-setting data. The test records URL, method, and body during a real demo interaction and permits only bodyless same-origin GETs. | `@claim:privacy-surface`; `live-check.json`; live `/privacy`. |
| F-2-5 | Import completion and cancellation now return focus to the visible `Import campaign record` button. | `@claim:export-import-roundtrip`; `campaign import rejects damaged files…`; live `/demo`. |
| F-2-6 | Replaced the unlisted “one new constraint” statement with `meet the chapter rule`. | README copy audit; `git diff --check`. |
| F-2-7 | Replaced 404 metaphors with `Page not found` and `Return home` in the static and SPA variants. | `unknown paths return…`; `verify.json`; live `/definitely-missing` returns 404. |
| F-2-8 | Removed the unlisted 404 save-integrity sentence. | `unknown paths return…`; live `/definitely-missing`. |
| F-2-9 | Added `source-license` and a tagged test for the MIT grant and README link. Added the standard `MIT License` heading to `LICENSE`. | `@claim:source-license`; repository `LICENSE`; README. |

## Review 1 regression audit

| Finding | Preserved change | Current evidence |
| --- | --- | --- |
| F-1-1 | Persisted time is sampled after closing and reopens paused without elapsed progress. | `@claim:local-save-pause`; 20/20 clean-clone claim commands passed. |
| F-1-2 | The first screen uses `Try it with sample data` and explains its complete route and isolation. | `the first desktop and phone viewport…`; `live-cold-desktop.png`; live `/`. |
| F-1-3 | Compact links have 44 × 44 px minimum targets. | `mobile layouts fit…`; live mobile route sweep and 404. |
| F-1-4 | The six-chapter run rejects ads, energy, loot, checkout, licenses, and paid-progress surfaces in every state. | `@claim:finite-free-run`; live complete run. |
| F-1-5 | All three fixed-seed clients, products, and quotas are asserted. | `@claim:seeded-contracts`; live `/demo`. |
| F-1-6 | The public frame claim and test use a 20 ms p95 bound. | `@claim:frame-rate`; live p95 16.7 ms in `live-check.json`. |
| F-1-7 | Demo flows compare a valid real save byte-for-byte, now including browser Back. | `@claim:demo-isolation`; live Back flow. |
| F-1-8 | Neutral quota-selection guidance remains in place. | `Choose the quota you want to plan for.` on live `/`. |
| F-1-9 | Equal seeds repeat contracts and selected different seeds vary. | `@claim:deterministic-contracts`. |
| F-1-10 | Losing visibility pauses and stabilizes the timer. | `@claim:hidden-tab-pause`. |
| F-1-11 | The sample asserts chapter two, four named slots, and a measured 10× clock. | `@claim:demo-setup`; `live-demo-mobile.png`. |
| F-1-12 | Route crawl rejects account, analytics, checkout, payment, and license surfaces; request payloads are inspected. | `@claim:privacy-surface`; `live-check.json`. |
| F-1-13 | No unsupported Node 20 statement is published. | README audit. |
| F-1-14 | README does not make a compound claim about test internals. | README audit; full suite still passes 29/29. |
| F-1-15 | README does not make an unlisted build-output promise. | README audit; `npm run build` produces `dist/index.html`. |
| F-1-16 | README does not make an unlisted framework claim. | README audit. |
| F-1-17 | Fixed 100 ms steps are listed and tested for equivalent elapsed time. | `@claim:simulation-step`. |
| F-1-18 | Font and artwork provenance remain listed and verified from shipped files. | `@claim:asset-provenance`; live local font loads. |
| F-1-19 | No Azure deployment-platform promise appears in public copy. | README audit. |
| F-1-20 | Terms metadata says optional bonus contracts are unavailable. | `@claim:purchase-availability`; live `/terms`. |
| F-1-21 | `How it works` and `Privacy and limits` follow the playable picker. | `live-cold-mobile.png`; live `/`. |
| F-1-22 | The static 404 retains complete metadata, matching chrome, accessibility, and HTTP 404 status. | `unknown paths return…`; `verify.json`; live `/definitely-missing`. |
| F-1-23 | Export/import validates, previews, confirms, restores, and isolates by mode. | `@claim:export-import-roundtrip`; live `/demo`. |
| F-1-24 | The audience sentence keeps concrete short-session language. | `copy-audit.md`; `live-cold-mobile.png`. |
| F-1-25 | Sound buttons name the next action and retain pressed state. | `@claim:sound-setting`; live route sweep. |
| F-1-26 | The footer says `Plan six factory routes and finish the campaign.` | Live app routes and 404. |
| F-1-27 | `offline accrual` remains absent. | README audit. |
| F-1-28 | README says `a separate demo save`. | README; `@claim:demo-isolation`. |
| F-1-29 | Demo keys and separate sound choices remain explained in player language. | README; `@claim:demo-isolation`; `@claim:sound-setting`. |
| F-1-30 | No audited landing sentence exceeds 22 words. | `.factory/copy-audit.md`. |
| F-1-31 | The font license remains written as `SIL Open Font License`. | README; `@claim:asset-provenance`. |
| F-1-32 | The sample and sound controls both name their result. | First-viewport test; `@claim:sound-setting`; live `/`. |

## Final evidence

- Fresh local clone: `npm ci` passed with zero vulnerabilities; all 20 exact commands in `.factory/claims.json` passed independently.
- Repository suite: `npm test` passed 29/29. `npm run build` produced `dist/`.
- Built initial assets: JavaScript 34.02 KiB raw / 11.13 KiB gzip; CSS 25.36 KiB raw / 6.01 KiB gzip; fonts 58.44 KiB total.
- Production audit: `npm run verify:live` reports no failures, console errors, cross-origin requests, or request bodies; frame p95 is 16.7 ms.
- Accessibility: Playwright Axe found no serious or critical violations on every route and the 404. The worker URL verifier found one `h1`, one `main`, `lang=en`, complete labels, and no errors.
- Offline: `@claim:offline-reload` passed in its own browser context after service-worker control.
- Lighthouse report: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, CLS 0.002, TBT 10 ms, 76 KiB transferred. Lighthouse wrote the complete report before its container Chrome process emitted the known post-report tab-crash exit.
- Deployed bundle matches `dist/`: JS SHA-256 `f23056a0…013b`; CSS SHA-256 `063d9c31…0055`.

No finding from review 1 or review 2 remains open.
