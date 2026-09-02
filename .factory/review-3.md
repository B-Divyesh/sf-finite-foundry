# Adversarial first-read review 3 — PASS

Reviewed September 2, 2026 against repository commit `25d59c5781333a98005e766c3d18c2e8c601b035` and the live site at <https://finite-foundry.sociobot.in>.

## Verdict

**PASS.** There are zero findings: no blocking, major, minor, copy, structure, demo, privacy, or claim-coverage defects remain. All 20 declared claims were run from this clean checkout and passed. The full test suite passed 29/29 and the production build completed successfully.

## Cold first screen

Fresh, unauthenticated Chromium contexts were opened before inspecting implementation. The phone viewport was 390 × 844 and desktop was 1440 × 900.

| Question | Answer visible before scrolling |
| --- | --- |
| What does this do? | `Finish a six-chapter factory campaign.` |
| For whom? | `For factory-game players who want short planning sessions instead of endless resets.` |
| What should I click first? | `Try it with sample data.` The adjacent result says it opens a complete chapter-two route and does not touch the campaign. |

The mobile primary action was a 366 × 45.5 px control at y=526. Its explanation was fully visible. The first contract begins at y=825, so the primary action, outcome, and first selectable option are all visible from the first screen. Desktop shows all of those elements inside its first viewport. Cold load logged no console/page errors and made requests only to `https://finite-foundry.sociobot.in` for the document, application assets, and self-hosted fonts.

## Copy audit

Every landing and README sentence or visitor-facing heading was checked. Word counts use whitespace-separated words; URLs are counted as one link where relevant. No item exceeds 22 words. No banned marketing word, unexplained genre jargon, inconsistent product term, information-free heading, or non-result-naming standalone button was found.

### Landing page

| Text | Words | Result |
| --- | ---: | --- |
| Skip to the game | 4 | Pass |
| Finite Foundry | 2 | Pass — wordmark |
| Play | 1 | Pass — destination link |
| Demo | 1 | Pass — destination link |
| Privacy | 1 | Pass — destination link |
| Turn sound off | 3 | Pass — names the action |
| Chapter 1 of 6 | 4 | Pass |
| Finish a six-chapter factory campaign | 5 | Pass |
| For factory-game players who want short planning sessions instead of endless resets. | 11 | Pass |
| Works offline after the first visit | 6 | Pass |
| Campaign stays in this browser | 5 | Pass |
| Complete campaign is free | 4 | Pass |
| Try it with sample data | 5 | Pass |
| Opens chapter two with a complete route. | 7 | Pass |
| Demo changes never touch your campaign. | 6 | Pass |
| Choose one order | 3 | Pass |
| Available contracts | 2 | Pass |
| Choose the quota you want to plan for. | 8 | Pass |
| Named client, product, and quota (dynamic ticket pattern) | 7 | Pass |
| How it works | 3 | Pass |
| Plan, run, then finish | 4 | Pass |
| Choose a contract | 3 | Pass |
| Pick one of three orders for the current chapter. | 9 | Pass |
| Build the route | 3 | Pass |
| Place each machine while meeting the chapter rule. | 8 | Pass |
| Run the shift | 3 | Pass |
| Meet the quota, clear six chapters, then dismantle the line. | 10 | Pass |
| Privacy and limits | 3 | Pass |
| Your campaign stays on this device | 6 | Pass |
| Play needs no account. | 4 | Pass |
| Progress stops when the game closes, and bonus contracts are currently unavailable. | 12 | Pass |
| Stored in this browser | 4 | Pass |
| Your campaign and sound setting stay in local storage. | 9 | Pass |
| Demo changes use a separate save. | 6 | Pass |
| Read the privacy details | 4 | Pass — result-naming link |
| Plan six factory routes and finish the campaign. | 8 | Pass |
| Terms | 1 | Pass — destination link |
| Built by Param Factory | 4 | Pass — identified external destination |
| Version 1.1.0 · Generated artwork used in the social preview | 8 | Pass |

### README

| Text | Words | Result |
| --- | ---: | --- |
| Finite Foundry | 2 | Pass — document title |
| Plan six factory routes and finish a campaign. | 8 | Pass |
| Finite Foundry is a browser game for players who prefer five-minute simulated shifts and a final ending. | 17 | Pass |
| Each campaign seed produces the same three contract choices per chapter. | 11 | Pass |
| Choose an order, arrange machines to meet the chapter rule, and run a five-minute simulated shift. | 16 | Pass |
| Production pauses when the tab closes or hides. | 8 | Pass |
| The complete six-chapter campaign is free. | 6 | Pass |
| It has no ads, energy limits, loot boxes, paid progress, or progress while the game is closed. | 17 | Pass |
| Bonus contracts are unavailable while operator registration is pending. | 9 | Pass |
| Try the sample campaign | 4 | Pass — section title |
| Open `/demo` or visit the live demo. | 6 | Pass |
| It starts in chapter two with a complete route and a 10× demo clock. | 14 | Pass |
| Choose **Play full demo** to restart at chapter one in a separate demo save. | 14 | Pass |
| The demo stores data under separate demo keys. | 8 | Pass |
| It never reads or writes your real campaign save. | 9 | Pass |
| **Reset demo** restores the sample, and **Start for real** discards it. | 11 | Pass |
| Controls | 1 | Pass — section title |
| Pointer or touch: choose a machine card, then choose a route slot. | 12 | Pass |
| Keyboard: focus a machine card and press Enter. | 8 | Pass |
| Press a number key to place it. | 7 | Pass |
| Route slots: choose a filled slot with no selected machine to clear it. | 13 | Pass |
| Pause: use the visible pause button. | 6 | Pass |
| Hiding the tab also pauses production. | 6 | Pass |
| Sound: use the header button. | 5 | Pass |
| The choice is stored separately for demo and real play. | 10 | Pass |
| Campaign progress saves in the browser. | 6 | Pass |
| Use **Export campaign record** to download a JSON file. | 9 | Pass |
| Use **Import campaign record** to preview and restore that file. | 10 | Pass |
| The game works offline after the first visit. | 8 | Pass |
| Run locally | 2 | Pass — section title |
| The local site opens at `http://localhost:5173`. | 6 | Pass |
| The direct demo entry is `http://localhost:5173/demo`. | 6 | Pass |
| Test and build | 3 | Pass — section title |
| Privacy and payment | 3 | Pass — section title |
| Play needs no account. | 4 | Pass |
| The game has no analytics, checkout, or payment form. | 9 | Pass |
| Progress and sound settings stay in browser storage. | 8 | Pass |
| See Privacy and Terms. | 4 | Pass |
| Artwork and fonts | 3 | Pass — section title |
| The generated risograph artwork is original to Finite Foundry. | 9 | Pass |
| It appears in the social preview. | 6 | Pass |
| The self-hosted fonts use the SIL Open Font License. | 9 | Pass |
| License | 1 | Pass — section title |
| Finite Foundry source code is available under the MIT License. | 10 | Pass |

The terminology is consistent: the whole game is a **campaign**, one timed attempt is a **shift**, machine order is a **route**, a customer target is a **contract**, and sample mode is the **demo**. The live game, privacy page, terms, 404, footer, and dynamic completion/loss/import states were also read. All claim-like statements map to a relevant entry in `.factory/claims.json`; no unlisted visitor claim was found.

## Demo and sandbox

One click on the landing action opens `/demo`. Its first 390 × 844 screen showed:

- the persistent `Demo — sample data, nothing is saved` notice;
- chapter two, a named Juniper Kitchen contract, and the four placed machines: Cutter, Kiln, Cooling rack, Press;
- `Run five-minute shift` at y=528 without scrolling; and
- Reset demo, Play full demo, and Start for real in the persistent banner.

Running the seeded shift immediately changed the timer from 5:00 to 4:58. Reset restored the realistic chapter-two sample. The live interaction made only bodyless same-origin GET requests. Browser testing also confirmed real and demo saves are separate, Reset/Start-for-real/Back clear demo storage without changing the real save, and `/demo` plus `/?demo=1` enter the same isolated sample. The tested offline reload works after service-worker control.

## Claims gate

From this clean checkout, `npm ci` completed with 0 vulnerabilities. Each exact command listed in `.factory/claims.json` passed. Each listed claim ID appears exactly once as an `@claim:` tag across the browser/core tests.

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

`npm test` passed **29/29**. `npm run build` passed and produced `dist/`; the initial JavaScript is 34.02 kB raw / 11.13 kB gzip and CSS is 25.36 kB raw / 6.01 kB gzip.

## Earlier-finding audit

Every earlier finding was rechecked on the deployed site and against the current tests/code.

| Earlier finding | Current result |
| --- | --- |
| F-1-1 | Fixed: persisted pause test passed independently and in the full suite. |
| F-1-2 | Fixed: exact sample action and adjacent result/isolation explanation are visible at both sizes. |
| F-1-3 | Fixed: current mobile suite measures all visible controls at least 44 × 44 px, including 404. |
| F-1-4 | Fixed: complete run asserts prohibited paid/manipulative surfaces and request origins. |
| F-1-5 | Fixed: all three named contracts and quotas are asserted. |
| F-1-6 | Fixed: claim and test use p95 frame interval ≤20 ms. |
| F-1-7 | Fixed: valid real save is compared byte-for-byte across every demo exit, including Back. |
| F-1-8 | Fixed: unproved pace advice was removed. |
| F-1-9 | Fixed: deterministic seed claim and tagged core proof exist. |
| F-1-10 | Fixed: visibility loss pauses and stabilises an active shift. |
| F-1-11 | Fixed: chapter, route, and measured 10× clock have a tagged proof. |
| F-1-12 | Fixed: privacy crawl rejects account, analytics, checkout, payment, and license surfaces. |
| F-1-13 | Fixed: unverified Node compatibility wording is absent. |
| F-1-14 | Fixed: unlisted compound test-description wording is absent. |
| F-1-15 | Fixed: unlisted build-output wording is absent. |
| F-1-16 | Fixed: unlisted framework wording is absent. |
| F-1-17 | Fixed: fixed 100 ms simulation claim has tagged proof. |
| F-1-18 | Fixed: asset provenance is listed and checked from shipped files. |
| F-1-19 | Fixed: unlisted deployment-platform wording is absent. |
| F-1-20 | Fixed: Terms metadata says bonus contracts are unavailable. |
| F-1-21 | Fixed: landing page contains `How it works` and `Privacy and limits`. |
| F-1-22 | Fixed: live HTTP 404 has complete metadata and matching chrome. |
| F-1-23 | Fixed: safe export/import preview, confirmation, restoration, and demo isolation work. |
| F-1-24 | Fixed: audience copy is concrete and concise. |
| F-1-25 | Fixed: sound control names the next action. |
| F-1-26 | Fixed: footer states the campaign outcome plainly. |
| F-1-27 | Fixed: `offline accrual` jargon is absent. |
| F-1-28 | Fixed: demo is described as a separate save. |
| F-1-29 | Fixed: storage behavior is described in player language. |
| F-1-30 | Fixed: no landing/README sentence exceeds 22 words. |
| F-1-31 | Fixed: SIL Open Font License is written in full. |
| F-1-32 | Fixed: sample and sound controls name their results. |
| F-2-1 | Fixed: first phone demo viewport shows notice, named sample, complete route, and run action. |
| F-2-2 | Fixed: browser Back clears demo data and preserves real data. |
| F-2-3 | Fixed: offline fact is one of the three first-screen facts. |
| F-2-4 | Fixed: privacy wording is limited to campaign/sound-setting data, matching its test. |
| F-2-5 | Fixed: import confirmation and cancellation return focus to the visible trigger. |
| F-2-6 | Fixed: unlisted chapter-design sentence is absent. |
| F-2-7 | Fixed: 404 says `Page not found` and `Return home`. |
| F-2-8 | Fixed: 404 save-integrity sentence is absent. |
| F-2-9 | Fixed: source-license claim and MIT test exist. |

## Structure, routing, accessibility, and identity

- `/`, `/play`, `/demo`, `/privacy`, and `/terms` returned 200. An unknown route returned a designed HTTP 404. Every navigational link resolved (the intentional unknown-route skip fragment correctly remained on the 404).
- Checked routes have one h1, one main, `lang="en"`, route-specific title, plain meta description, canonical URL, OG/Twitter metadata, favicon, and apple-touch icon. `robots.txt` and `sitemap.xml` are present.
- Client navigation and browser Back restored the correct title, moved focus to the new h1, announced it through the polite live region, and reset scroll. First Tab reveals the skip link.
- Full-suite Axe checks found zero serious/critical violations on app routes. The live 390 px screen had no horizontal overflow; controls are 44 px or larger. Reduced-motion CSS removes transition/animation duration.
- Live response headers include a CSP with `frame-ancestors 'none'`, `connect-src 'self'`, `nosniff`, referrer policy, permissions policy, and HSTS. No CDN fonts, scripts, analytics, account, payment, or product data endpoints were observed.
- The visual language is the distinct risograph design required by `.factory/design.md`: cream paper, indigo plate, coral/teal ink, registration marks, clipped paper blocks, offset shadows, self-hosted Bowlby/Atkinson type, and the paper-feed motion policy. It does not resemble a generic SaaS template.

## Missed leverage

No missing AI feature is found. The brief is a deterministic routing game; a model-generated solution would undercut its core planning task. The useful implied portability feature—export/import—is implemented with validation, preview, confirmation, and sandbox isolation. No decorative AI surface or provider key is present.

## What would make this perfect

Nothing is currently required to satisfy the stated product and review contract. Keep the existing claim suite, cold phone check, sandbox isolation tests, and route/accessibility crawl in the release process so these verified properties do not regress.
