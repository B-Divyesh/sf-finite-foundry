# Finish a six-chapter factory campaign — Review 5

Reviewed September 6, 2026 at <https://finite-foundry.sociobot.in>.

## Verdict

**PASS. Zero findings. Zero untested claims.**

Implementation candidate: `5249a8e50593700ab3cb3dae69b5e1acb311692f` (`style: show full demo contract on phones`). Documentation checkout: `bd24ed3d3573e1f3bb7c0f97a63eb2b526597acb`. The commits after the candidate only add reports and evidence. Live JavaScript and CSS SHA-256 values matched the candidate build exactly:

| Asset | SHA-256 |
| --- | --- |
| `index-BZRHj_P6.js` | `f23056a0956ab57a00ceae0ad9f8424942634b4dde9ac578a5dcb68fb8ee013b` |
| `style-t3468n0K.css` | `063d9c317fbe86bcf36e104cc035ec55ec193c867ac10b57b891f5d6b4530055` |

## First screen

Fresh, separate desktop (1440 × 900) and phone (390 × 844 touch) browser contexts opened `/` before scrolling.

| Question | What the first screen said |
| --- | --- |
| Job | “Finish a six-chapter factory campaign.” |
| Audience | “For factory-game players who want short planning sessions instead of endless resets.” |
| First action | “Try it with sample data.” It says it opens chapter two with a complete route and does not touch the campaign. |

The first screen also showed the three facts (offline after first visit, local campaign, free campaign) and an operable contract on both sizes. This meets the game-first and plain-words requirements.

## Game and demo checks

- The persistent banner was visible: “Demo — sample data, nothing is saved.” Reset demo restored the named chapter-two sample: Juniper Kitchen, Cutter, Kiln, Cooling rack, and Press.
- The demo and query entry (`/demo`, `/?demo=1`) were isolated from `finite-foundry:save`; reset, full-demo, Start for real, and browser Back left the real save byte-for-byte unchanged and removed demo keys on exit.
- A fresh desktop run checked an empty invalid route (clear recovery guidance with no start action), then a valid lean route against a 27-unit quota. It reached the actual `Quota missed` end screen. Replanning at brisk pace reached `Contract complete`.
- A fresh touch phone run entered Play full demo, chose contracts, placed every route by touch, ran all six shifts, dismantled the line, and reached `You finished the foundry`. End-screen evidence: `.factory/evidence-review-5/live-ending-phone.png`.
- A separate desktop scripted run completed the same deterministic campaign to its ending. The active-shift live p95 frame interval was 16.7 ms, within the published 20 ms bound.
- Pointer, touch, keyboard placement, Arrow-key slot movement, visible route-heading focus after navigation with reduced motion, pause/hidden-tab behavior, sound persistence, import/export preview/recovery, and offline reload all passed through the claim suite or live checks.
- There is no multiplayer or backend in the brief, so tenant, restart, health, and request-limit checks do not apply.

Live interaction results are in `.factory/evidence-review-5/desktop-recovery.json` and `.factory/evidence-review-5/accessibility-interaction.json`.

## Commands and claims

This clean checkout ran `npm ci` (0 vulnerabilities), `npm test`, and `npm run build`.

- `npm test`: PASS, 29/29.
- `npm run build`: PASS; `dist/` was produced. Built initial JavaScript is 11.13 KiB gzip and CSS is 6.01 KiB gzip.
- All 20 exact commands declared in `.factory/claims.json` passed independently. Every manifest id has exactly one `@claim:<id>` tag.

The 20 tested claims are seeded contracts, deterministic contracts, campaign ending, finite free run, local save pause, hidden-tab pause, export/import, demo isolation, demo setup, offline reload, sound setting, shift duration, input modes, privacy surface, frame rate, purchase availability, demo paths, simulation step, asset provenance, and source license.

The public landing copy, README, legal pages, and footer were checked against this manifest. No additional visitor-reliant claim was found.

## Site, accessibility, privacy, and routes

- `/`, `/play`, `/demo`, `/privacy`, and `/terms` returned their expected titles, one `h1`, one `main`, language metadata, canonical metadata, and legal content.
- The required URL verifier passed live: 657 ms load measurement, no console errors, `lang=en`, one `h1`, `main`, and no missing image alt attributes or unnamed buttons.
- Live Playwright Axe scans on every app route and the designed 404 found no serious or critical violation. The standalone Axe CLI was attempted but could not create Chrome in this worker; the permitted Playwright Axe integration completed the same live coverage successfully.
- The 390 px route sweep found no horizontal overflow and no visible target smaller than 44 × 44 px. Keyboard and reduced-motion checks passed.
- Live request recording during the game found no console errors, no cross-origin requests, and no non-GET or request-body traffic. There are no accounts, analytics, checkout, payment, or license controls during play.
- Offline reload worked after first visit in a fresh service-worker context. The service worker was controlled before the context went offline.
- The privacy and terms pages describe local storage, export/import, deletion, no account, and unavailable bonus contracts. Sound and game saves remain browser-local.
- The deliberate HTTP 404 returned status 404, not a broken app page. It has a plain heading, Return home action, metadata, consistent chrome, and no errors. Security headers include CSP, HSTS, nosniff, referrer policy, and a payment-disabled permissions policy.

## Earlier finding disposition

All previous reports were read: `verification.md`, `verification-2.md`, `verification-3.md`, `verification-4.md`, `review-1.md`, `review-2.md`, `review-3.md`, and `review-4.md`. Reviews 3 and 4 and verifications 2 through 4 had no open findings. The earlier defects remain closed as follows.

| Earlier finding | Current disposition and evidence |
| --- | --- |
| Verification: unavailable purchase | Closed. No checkout, payment, license, or paid-progress surface; `finite-free-run`, `purchase-availability`, and live request/crawl checks pass. |
| Verification: incomplete first screen | Closed. Both fresh viewports showed the game, contract, sample CTA, outcome, and plain facts before scrolling. |
| Verification: incomplete claims/demo entry | Closed. 20 manifest entries have one tagged demo-safe test each; all exact commands pass. |
| Verification: phone targets | Closed. Live 390 px route sweep found every visible target at least 44 × 44 px. |
| Verification: HTTP 200 unknown route | Closed. `/definitely-missing` returned the intentional designed HTTP 404. |
| F-1-1 | Closed. `local-save-pause` passed independently; closed game state remains paused without elapsed progress. |
| F-1-2 | Closed. Exact sample CTA and its outcome sentence are in both first viewports. |
| F-1-3 | Closed. Phone target sweep passes all app routes and 404. |
| F-1-4 | Closed. Full six-chapter run rejects ads, energy, loot, checkout, licenses, and paid progress. |
| F-1-5 | Closed. `seeded-contracts` asserts three distinct named clients, products, and quotas. |
| F-1-6 | Closed. The claim and test use p95 ≤20 ms; live result was 16.7 ms. |
| F-1-7 | Closed. Valid real-save bytes survive all demo exit paths. |
| F-1-8 | Closed. The unproved pace advice is absent; quota selection wording is neutral. |
| F-1-9 | Closed. Equal seed and selected different-seed checks pass. |
| F-1-10 | Closed. Hidden-tab pause claim and test pass. |
| F-1-11 | Closed. Chapter two, four named sample machines, and 10× demo timing are asserted. |
| F-1-12 | Closed. Privacy crawl rejects account, analytics, payment, and data-bearing requests. |
| F-1-13 | Closed. No unsupported Node 20 compatibility claim remains. |
| F-1-14 | Closed. No public compound statement promises internal test mechanics. |
| F-1-15 | Closed. No public build-output promise remains. |
| F-1-16 | Closed. No untested runtime-framework promise remains. |
| F-1-17 | Closed. Fixed 100 ms simulation-step claim is listed and tested. |
| F-1-18 | Closed. Local font license and generated-art provenance are listed and tested. |
| F-1-19 | Closed. No deployment-platform promise remains in public copy. |
| F-1-20 | Closed. Terms metadata says bonus contracts are unavailable. |
| F-1-21 | Closed. Landing includes How it works and Privacy and limits after the playable content. |
| F-1-22 | Closed. The static 404 has metadata, consistent chrome, a factory link, and passes Axe. |
| F-1-23 | Closed. Export, preview, confirmation, restore, damaged-file error, and focus recovery pass. |
| F-1-24 | Closed. Audience copy uses concrete factory-game and short-session language. |
| F-1-25 | Closed. Sound controls name the next action and retain pressed state. |
| F-1-26 | Closed. Footer says the product-specific campaign sentence. |
| F-1-27 | Closed. “offline accrual” is absent; closure behavior is written plainly. |
| F-1-28 | Closed. Demo copy says separate demo save rather than implementation jargon. |
| F-1-29 | Closed. Separate demo and sound storage are explained in player language. |
| F-1-30 | Closed. The copy audit records no landing sentence above 22 words. |
| F-1-31 | Closed. The SIL Open Font License is named in public documentation. |
| F-1-32 | Closed. Sample and sound controls state their result. |
| F-2-1 | Closed. Phone demo first viewport shows notice, chapter, contract, four-machine proof strip, and run action. |
| F-2-2 | Closed. Browser Back clears demo save and sound keys while retaining real save bytes. |
| F-2-3 | Closed. “Works offline after the first visit” is a first-screen fact. |
| F-2-4 | Closed. Privacy language is limited to campaign and sound-setting data and tested request behavior. |
| F-2-5 | Closed. Import cancel and completion return focus to the visible import button. |
| F-2-6 | Closed. The unlisted chapter-design sentence is absent. |
| F-2-7 | Closed. 404 says “Page not found” and “Return home.” |
| F-2-8 | Closed. The unlisted 404 save-integrity statement is absent. |
| F-2-9 | Closed. MIT source-license claim is listed and tested. |

## Evidence

- `.factory/evidence-review-5/live-check.json`: live route, privacy, offline, frame, phone-layout, and desktop-ending checks.
- `.factory/evidence-review-5/live-ending-phone.png`: fresh 390 px touch campaign ending.
- `.factory/evidence-review-5/desktop-recovery.json`: invalid-plan, loss, and replan-to-win checks.
- `.factory/evidence-review-5/accessibility-interaction.json`: keyboard, focus, and reduced-motion checks.

No product code was changed for this review.
