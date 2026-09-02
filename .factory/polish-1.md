# Perfection-loop polish 1

Completed September 2, 2026 against adversarial review `14459c84d4bbe8cd1b59537b3c2b36b4c674809b`.

Evidence files:

- `.factory/evidence-polish-1/live-cold-desktop.png`
- `.factory/evidence-polish-1/live-cold-mobile.png`
- `.factory/evidence-polish-1/live-demo-ending.png`
- `.factory/evidence-polish-1/live-check.json`
- `.factory/evidence-polish-1/verify.json`
- `.factory/evidence-polish-1/lighthouse.json`

## Finding closure

| Finding | Change | Evidence |
| --- | --- | --- |
| F-1-1 | Closed the active page before sampling persisted state; reopening now proves the exact saved clock is paused and unchanged. | `@claim:local-save-pause`; 19/19 clean-clone claim commands passed. |
| F-1-2 | Restored “Try it with sample data” and the exact two-sentence outcome beside it. | `the first desktop and phone viewport…`; both cold screenshots; live `/`. |
| F-1-3 | Added minimum inline size to compact links and checked width and height on every route and the static 404. | `mobile layouts fit…`; live mobile sweep; `live-cold-mobile.png`. |
| F-1-4 | The six-chapter test now inspects every state for ads, energy, loot, paywall, checkout, and license controls and records all requests. | `@claim:finite-free-run`; live complete run at `/demo?test=1`. |
| F-1-5 | The claim test asserts all three distinct client names, product names, and quotas for the fixed seed. | `@claim:seeded-contracts`. |
| F-1-6 | Tightened the frame claim and p95 threshold from 34 ms to 20 ms. | `@claim:frame-rate`; live p95 16.8 ms in `live-check.json`. |
| F-1-7 | The isolation test creates a valid real save and compares it byte for byte after full-demo, reset, and exit flows. | `@claim:demo-isolation`; repeated on live `/demo` and `/?demo=1`. |
| F-1-8 | Replaced the unproved pace advice with neutral quota-selection guidance. | Copy audit; live `/`. |
| F-1-9 | Added the deterministic-seed claim and checks equal and different seeds. | `@claim:deterministic-contracts`. |
| F-1-10 | Added a visibility-change test that proves an active shift becomes paused and stays stable. | `@claim:hidden-tab-pause`. |
| F-1-11 | Added exact chapter, four-slot route, and 10× clock assertions. | `@claim:demo-setup`; live `/demo`. |
| F-1-12 | Added a route crawl that rejects account, analytics, checkout, payment, and license surfaces and records requests. | `@claim:privacy-surface`; live check reports zero cross-origin requests. |
| F-1-13 | Removed the unverified Node 20 compatibility promise. | README copy audit. |
| F-1-14 | Removed the compound public description of internal test implementation. | README copy audit; `npm test` passed 27/27. |
| F-1-15 | Removed the unlisted build-output promise. | README copy audit; `npm run build` still produced `dist/index.html`. |
| F-1-16 | Removed the unlisted framework claim. | README copy audit. |
| F-1-17 | Added a fixed-step claim and compared 120 × 100 ms steps with one equivalent 12-second step. | `@claim:simulation-step`. |
| F-1-18 | Clarified that generated art is used in the social preview and added font-license and art prompt records. | `@claim:asset-provenance`; `public/assets/FONT-LICENSES.md`; artwork JSON. |
| F-1-19 | Removed the unlisted Azure platform statement from public copy. | README copy audit. |
| F-1-20 | Rewrote the Terms description to state that bonus contracts are unavailable. | `@claim:purchase-availability`; live `/terms` metadata. |
| F-1-21 | Added “How it works” and “Privacy and limits” after the playable contract picker. | Both cold screenshots; live `/`. |
| F-1-22 | Added complete canonical/social/touch metadata, matching wordmark, sound control, and factory footer link to the HTTP 404 page. | `unknown paths return…`; live `/definitely-missing` returned 404; Axe passed. |
| F-1-23 | Added campaign import with schema/product validation, a replacement preview, explicit confirmation, error recovery, and demo-safe storage. | `@claim:export-import-roundtrip`; `campaign import rejects damaged files…`; live import round trip. |
| F-1-24 | Replaced genre jargon with “factory-game players” and a concrete short-session benefit. | Copy audit; both cold screenshots. |
| F-1-25 | Changed the toggle labels to “Turn sound off/on” while retaining `aria-pressed`. | `@claim:sound-setting`; route accessibility suite. |
| F-1-26 | Replaced the footer slogan with “Plan six factory routes and finish the campaign.” | Live app and static 404 screenshots/checks. |
| F-1-27 | Replaced “offline accrual” with “progress while the game is closed.” | README copy audit. |
| F-1-28 | Replaced “isolated sample storage” with “a separate demo save.” | README and demo documentation. |
| F-1-29 | Explained separate demo keys and separate sound choices in player language. | README and privacy copy; `@claim:demo-isolation`; `@claim:sound-setting`. |
| F-1-30 | Removed the 30-word test-description sentence. | `.factory/copy-audit.md` has no sentence over 22 words. |
| F-1-31 | Expanded the license name to “SIL Open Font License.” | README; `public/assets/FONT-LICENSES.md`; `@claim:asset-provenance`. |
| F-1-32 | Both standalone first-screen controls now name their result. | Exact CTA and sound assertions; live cold screenshots. |

## Earlier report closure

The earlier verification failures remain closed: there is no advertised checkout, the first viewport shows an operable contract, all public claims are listed, all claim tests enter through the demo, every mobile target is 44 × 44 px or larger, unknown routes return HTTP 404, and demo data remains isolated.

## Final evidence

- Full local suite: 27/27 passed.
- Fresh-clone manifest run: all 19 exact claim commands passed independently.
- Production browser audit: zero failures, zero console errors, zero cross-origin requests, and a 16.8 ms frame p95.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.2 s; CLS 0.002; TBT 10 ms; 76 KiB transfer.
- Production headers include CSP, HSTS, nosniff, referrer policy, and permissions policy.
