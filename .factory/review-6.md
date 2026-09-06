# Finish a factory campaign — review 6

Reviewed September 6, 2026 at <https://finite-foundry.sociobot.in>.

## Verdict

**PASS — 0 findings and 0 untested claims.**

- Job: finish a six-chapter factory campaign.
- Audience: factory-game players who want short planning sessions instead of endless resets.
- First action before scrolling: **Try it with sample data**. It says the sample opens chapter two with a complete route and does not touch the real campaign.
- Implementation reviewed: `5249a8e50593700ab3cb3dae69b5e1acb311692f` (`style: show full demo contract on phones`).
- Documentation checkout before this report: `d9c64c6e86b3181b63d38b4b41e5c2379cfa7e4b` (`docs: record verification five browser coverage`).

The live HTML referenced `assets/index-BZRHj_P6.js` and `assets/style-t3468n0K.css`. Their SHA-256 values, respectively `f23056a0956ab57a00ceae0ad9f8424942634b4dde9ac578a5dcb68fb8ee013b` and `063d9c317fbe86bcf36e104cc035ec55ec193c867ac10b57b891f5d6b4530055`, exactly match a fresh local build of the implementation candidate. Documentation commits after that candidate do not require another product image.

The work-order-referenced external `factory-evidence/finite-foundry-verify-5/qa-report.md` was not mounted in this checkout. Its stated verdict is reproduced in `.factory/verification-5.md`; this review independently performed the checks below rather than relying on that unavailable copy.

## Fresh live browser review

Fresh Chromium desktop (1440 × 900) and phone/touch (390 × 844) contexts opened the live home route before scrolling. Both showed the job, audience, exact first action and result, three plain facts, and an operable contract in the first viewport. They showed the game rather than a menu wall.

The desktop run created a real save, then entered `/demo`. The persistent label **Demo — sample data, nothing is saved** was present. The realistic chapter-two Juniper Kitchen sample was populated with all four stations. **Reset demo** restored that sample. `Start for real` removed the demo save while retaining the real-save bytes unchanged.

The review then exercised a reversed Press → Cutter route and received the live invalid-plan feedback. A valid Cutter → Press plan against the 27-unit contract showed the 2-unit forecast shortage, ran to **Quota missed**, and **Replan this shift** plus brisk pace then reached **Contract complete**. A separate deterministic six-chapter demo completed every shift, dismantled the final stations, and reached the actual **You finished the foundry** end screen.

The phone context had no horizontal overflow. It entered the sample with a touch action, cleared the route, and placed Cutter into the first slot by touch. The one-click sample label remained visible.

Recorded run evidence:

- `.factory/evidence-review-6/live-cold-desktop.png`
- `.factory/evidence-review-6/live-cold-phone.png`
- `.factory/evidence-review-6/live-demo-phone.png`
- `.factory/evidence-review-6/live-ending-desktop.png`
- `.factory/evidence-review-6/live-run.json`

`live-run.json` records all gameplay and phone checks as passing. Its two console messages are the browser's expected failed-resource messages while deliberately navigating the HTTP 404; they are not present on the fresh home load. The separate URL verifier records zero console errors on the live home route.

## Claims, build, and quality gates

From the clean checkout, `npm ci` completed with 0 vulnerabilities. Each of the 20 exact commands in `.factory/claims.json` was run separately and passed:

`seeded-contracts`, `deterministic-contracts`, `campaign-ending`, `finite-free-run`, `local-save-pause`, `hidden-tab-pause`, `export-import-roundtrip`, `demo-isolation`, `demo-setup`, `offline-reload`, `sound-setting`, `shift-duration`, `input-modes`, `privacy-surface`, `frame-rate`, `purchase-availability`, `demo-paths`, `simulation-step`, `asset-provenance`, and `source-license`.

`npm test` passed **29/29**. `npm run build` passed and produced `dist/`. Fresh build output is 11.13 KiB gzip JavaScript and 6.01 KiB gzip CSS.

`/opt/fleet/lib/verify-url.sh https://finite-foundry.sociobot.in .factory/evidence-review-6/verify-url` passed: HTTP 200, 693 ms measurement, correct title and language, one h1, main landmark, no missing image alt text, no unnamed buttons, and no console errors. Live Playwright Axe scans found zero serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`, and the intentional designed 404. The standalone `npx @axe-core/cli` could not start because this worker has no system Chrome binary; the pinned Playwright Chromium Axe integration is the completed accessibility check.

The fresh live route sweep returned 200 for `/`, `/play`, `/demo`, `/privacy`, and `/terms`; `/definitely-missing` deliberately returned 404 with the designed page and Return home action. Live headers provide CSP including `frame-ancestors 'none'`, HSTS, nosniff, strict-origin referrer policy, and payment-disabled permissions policy. The static game has no account, backend, tenant, health, or rate-limited service endpoint, so backend isolation, restart persistence, and 429/Retry-After checks do not apply.

## Earlier finding disposition

All earlier review and verification reports were inspected: `verification.md`, `verification-2.md` through `verification-5.md`, and `review-1.md` through `review-5.md`.

| Earlier items | Current disposition |
| --- | --- |
| Initial verification: unavailable paid surface, first-screen game omission, incomplete claims/demo, phone targets, 200 unknown route | Closed. The campaign is free with no payment surface; the game, CTA, and result are first-screen; all 20 claims pass; touch targets pass; the missing route is a designed 404. |
| F-1-1 through F-1-7: flaky pause proof, CTA/outcome, target size, full-run mechanics, named choices, frame claim, demo storage | Closed. Independent claims and this live run cover pause state, CTA, mobile layout, prohibited mechanics, named contracts, p95 ≤20 ms proof, and byte-for-byte demo isolation. |
| F-1-8 through F-1-23: unlisted or unsupported claims, timing/provenance/payment metadata, skeleton/404/import | Closed. Public copy is manifest-backed; timing, provenance, privacy, and source licence claims pass; legal/payment wording is honest; the landing structure, 404 metadata, and import/restore recovery pass. |
| F-1-24 through F-1-32: audience/control/footer/storage/license copy | Closed. Current first-screen, control, footer, README, legal, and 404 copy use the prior plain-language repairs; no unlisted visitor-facing claim was found. |
| F-2-1 through F-2-9: phone demo proof, Back cleanup, offline/privacy wording, import focus, 404 wording, source licence | Closed. Phone demo evidence, demo-isolation/offline/privacy/source-license claims, import tests, and the designed 404 prove their current behavior. |
| Reviews 3–5 and verifications 2–5 | No open findings to re-open. Their independent PASS checks agree with this live candidate and fresh clean-checkout results. |

Finding count: **0**. Untested public-claim count: **0**.
