# Adversarial first-read review 2 — FAIL

Reviewed September 2, 2026 against commit `1a37f79ff498aa71f716debabf4ef23360c42511` and the live site at <https://finite-foundry.sociobot.in>.

## Verdict

**FAIL.** There are nine findings: two blocking, four major, and three minor. All 19 declared claim commands pass from a fresh clone, and the initial demo is realistic and isolated from the real save. The demo still fails its required phone presentation and exit lifecycle, however. Four public claims also lack matching manifest coverage.

## Cold first screen

Fresh browser contexts were opened at 390 × 844 and 1440 × 900. These notes were made before scrolling or reading the implementation.

| Question | Answer from the first screen |
| --- | --- |
| What does this do? | It is a factory-planning game with six chapters and five-minute simulated shifts. |
| For whom? | It says it is for factory-game players who want short planning sessions and an ending instead of repeated resets. |
| What should I click first? | `Try it with sample data`; the adjacent copy says it opens a complete chapter-two route without touching the real campaign. |

All three questions are answerable on both viewports, so the cold-read clarity gate passes. The phone first screen includes the headline, audience sentence, facts, sample action, outcome, and the start of `Available contracts`. The desktop first screen also exposes all three contract choices.

## Findings

### Blocking

#### F-2-1 — The phone demo does not show the product in use on its first screen

- **Quote/location:** live `/demo` at 390 × 844. The visible screen contains `Demo — sample data, nothing is saved`, `Chapter two uses a 10× clock`, three demo controls, `Make room for heat`, campaign file controls, and only the top of the `Juniper Kitchen` contract.
- **Evidence:** the demo banner is 234 px high. `Production route` starts at y=1347, and `Run five-minute shift` starts at y=2889 in an 844 px viewport.
- **Why this fails:** the required post-click screen must already show the product being used with realistic sample data. On a phone, the complete route and the action that demonstrates it are multiple screens below the fold. The banner is not unobtrusive, and file-management controls displace the sample itself.
- **Concrete fix:** make the initial phone demo show the demo notice, chapter, named contract, a compact representation of all four placed machines, and `Run five-minute shift` within 844 px. Keep `Reset demo` and `Start for real` available with 44 × 44 px targets; move export, import, seed, and new-campaign controls below the route or into a secondary menu. Add a 390 × 844 assertion that the route summary and run action are in the viewport.

#### F-2-2 — Browser Back does not discard demo changes

- **Quote/location:** live `/demo`; the banner says `Demo — sample data, nothing is saved`. `.factory/demo.md` says `Start for real` discards the demo, but the demo contract also requires every departure to discard demo state.
- **Evidence:** from a fresh context, open `/`, choose `Try it with sample data`, clear the route, use browser Back, and choose the sample action again. The second visit has zero filled slots instead of the four-machine sample, and `demo:finite-foundry:save` still exists. In code, `navigate()` clears demo keys, while the `popstate` handler only resets memory and renders.
- **Why this fails:** leaving with a standard browser control preserves edited sample state. The next one-click demo no longer opens the promised complete route.
- **Concrete fix:** clear the demo save and demo sound key whenever navigation leaves demo mode, including `popstate`. Add a browser test for home → demo → edit → Back → demo that expects the four seeded slots and also compares the real save byte for byte.

### Major

#### F-2-3 — The required offline fact is missing from the first screen

- **Quote/location:** live `/` facts: `Five-minute simulated shifts`, `Saves in this browser`, and `Complete campaign is free`.
- **Why this fails:** the mandatory first-screen facts are privacy, offline behavior, and price. The page gives duration instead of the tested offline behavior, so a cold visitor cannot discover offline support without reading the README.
- **Concrete fix:** show `Works offline after the first visit` alongside a privacy fact such as `Campaign stays in this browser` and the current free-price fact. Keep the duration in the explanatory sentence or add it as a fourth fact.

#### F-2-4 — The privacy page makes a broader claim than its manifest test

- **Quote/location:** live `/privacy`, under `What leaves this device`: `Nothing is sent during normal play.`
- **Why this fails:** the page necessarily requests same-origin HTML, scripts, styles, fonts, and service-worker files. The listed `privacy-surface` claim promises no cross-origin game-data requests, not that nothing at all is sent. Its test allows all same-origin requests. The public sentence is therefore both unlisted and literally broader than the proof.
- **Concrete fix:** replace it with `Finite Foundry sends no campaign or sound-setting data during play.` Add that exact wording to `privacy-surface`, and make the test inspect request URLs, methods, and bodies throughout play.

#### F-2-5 — Cancelling campaign import moves focus to an invisible input

- **Quote/location:** live `/demo`, damaged-file import, then `Cancel import`; `src/main.ts` focuses `[data-action="import-file"]`, which is clipped to 1 × 1 px.
- **Evidence:** after cancellation the live active element is `INPUT[data-action="import-file"]` with a 1 × 1 px bounding box.
- **Why this fails:** a keyboard user loses visible focus after dismissing the import panel and cannot tell where interaction will resume. This fails the required dialog/focus smoke test even though Axe reports no serious or critical static violation.
- **Concrete fix:** retain a reference to the visible `Import campaign record` trigger and restore focus to it on cancel. Test focus after both invalid-file cancellation and successful import.

#### F-2-6 — The README has an unlisted chapter-design claim

- **Quote/location:** README: `Choose an order, arrange machines around one new constraint, and run a five-minute simulated shift.`
- **Why this fails:** `shift-duration` proves the timer, but no claims entry or tagged test proves that each chapter introduces exactly one new constraint.
- **Concrete fix:** either change the sentence to `Choose an order, arrange machines to meet the chapter rule, and run a five-minute simulated shift.` or add a claim and deterministic test that enumerates the six distinct chapter rules.

### Minor

#### F-2-7 — The 404 headline and action use workshop metaphor

- **Quote/location:** live unknown route: `This route reaches an empty bench` and `Return to the foundry`.
- **Why this fails:** the plain-words rule forbids brand-lore headings and requires actions to name their result. Neither phrase says `page not found` or `home` without interpreting the factory metaphor.
- **Concrete fix:** use `Page not found` and `Return home`.

#### F-2-8 — The 404 makes an unlisted save-integrity claim

- **Quote/location:** live unknown route: `Your saved campaign is unchanged.`
- **Why this fails:** no `claims.json` entry verifies that visiting an unknown URL leaves both real and demo saves unchanged. The existing 404 test checks status, metadata, chrome, and Axe only.
- **Concrete fix:** remove the sentence, or add a tagged claim that seeds both save keys, opens an unknown path, and compares both values byte for byte.

#### F-2-9 — The README license statement is an unlisted claim

- **Quote/location:** README: `Finite Foundry source code is available under the MIT License.`
- **Why this fails:** this is a reliance claim with no `claims.json` entry. `asset-provenance` covers artwork and font licenses only.
- **Concrete fix:** add a `source-license` claim whose test checks that `LICENSE` contains the MIT text and that the README link resolves, or reduce the section to a direct `LICENSE` link without the unsupported sentence.

## Copy audit

Counting rule: whitespace-separated words count once; hyphenated terms, paths, URLs, numerals, and button labels count as one word each. Dynamic contract values are listed from the fresh live context. No sentence exceeds 22 words, and no banned marketing word appears.

### Live landing page

| Text | Words | Result |
| --- | ---: | --- |
| Skip to the game | 4 | Pass |
| FF | 1 | Pass |
| Finite Foundry | 2 | Pass |
| Play | 1 | Pass; navigation label |
| Demo | 1 | Pass; navigation label |
| Privacy | 1 | Pass; navigation label |
| Turn sound off | 3 | Pass |
| Chapter 1 of 6 | 4 | Pass |
| Finish a six-chapter factory campaign | 5 | Pass |
| For factory-game players who want short planning sessions instead of endless resets. | 11 | Pass |
| Five-minute simulated shifts | 3 | F-2-3: displaces the required offline fact |
| Saves in this browser | 4 | Pass |
| Complete campaign is free | 4 | Pass |
| Try it with sample data | 5 | Pass |
| Opens chapter two with a complete route. | 7 | Pass |
| Demo changes never touch your campaign. | 6 | Pass |
| Choose one order | 3 | Pass |
| Available contracts | 2 | Pass |
| Choose the quota you want to plan for. | 8 | Pass |
| Moss Street Hardware | 3 | Dynamic sample; pass |
| Flat brackets | 2 | Dynamic sample; pass |
| 20 units | 2 | Dynamic sample; pass |
| Civic Sign Shop | 3 | Dynamic sample; pass |
| Flat brackets | 2 | Dynamic sample; pass |
| 23 units | 2 | Dynamic sample; pass |
| North Quay Repairs | 3 | Dynamic sample; pass |
| Flat brackets | 2 | Dynamic sample; pass |
| 27 units | 2 | Dynamic sample; pass |
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
| Read the privacy details | 4 | Pass |
| Plan six factory routes and finish the campaign. | 8 | Pass |
| Privacy | 1 | Pass; footer link |
| Terms | 1 | Pass; footer link |
| Built by Param Factory | 4 | Pass; external link is announced |
| Version 1.1.0 · Generated artwork used in the social preview | 8 | Pass |

### README

| Text | Words | Result |
| --- | ---: | --- |
| Finite Foundry | 2 | Pass |
| Plan six factory routes and finish a campaign. | 8 | Pass |
| Finite Foundry is a browser game for players who prefer short planning sessions and a final ending. | 17 | Pass |
| Each campaign seed produces the same three contract choices per chapter. | 11 | Pass |
| Choose an order, arrange machines around one new constraint, and run a five-minute simulated shift. | 15 | F-2-6 |
| Production pauses when the tab closes or hides. | 8 | Pass |
| The complete six-chapter campaign is free. | 6 | Pass |
| It has no ads, energy limits, loot boxes, paid progress, or progress while the game is closed. | 17 | Pass |
| Bonus contracts are unavailable while operator registration is pending. | 9 | Pass |
| Try the sample campaign | 4 | Pass; heading |
| Open `/demo` or visit <https://finite-foundry.sociobot.in/demo>. | 5 | Pass |
| It starts in chapter two with a complete route and a 10× demo clock. | 14 | Pass |
| Choose Play full demo to restart at chapter one in a separate demo save. | 14 | Pass |
| The demo stores data under separate demo keys. | 8 | Pass |
| It never reads or writes your real campaign save. | 9 | Pass |
| Reset demo restores the sample, and Start for real discards it. | 11 | Pass |
| Controls | 1 | Pass; heading |
| Pointer or touch: choose a machine card, then choose a route slot. | 12 | Pass |
| Keyboard: focus a machine card and press Enter. | 8 | Pass |
| Press a number key to place it. | 8 | Pass |
| Route slots: choose a filled slot with no selected machine to clear it. | 13 | Pass |
| Pause: use the visible pause button. | 6 | Pass |
| Hiding the tab also pauses production. | 6 | Pass |
| Sound: use the header button. | 5 | Pass |
| The choice is stored separately for demo and real play. | 10 | Pass |
| Campaign progress saves in the browser. | 6 | Pass |
| Use Export campaign record to download a JSON file. | 9 | Pass |
| Use Import campaign record to preview and restore that file. | 10 | Pass |
| The game works offline after the first visit. | 8 | Pass |
| Run locally | 2 | Pass; heading |
| `npm install` | 2 | Pass; command |
| `npm run dev` | 3 | Pass; command |
| The local site opens at `http://localhost:5173`. | 6 | Pass |
| The direct demo entry is `http://localhost:5173/demo`. | 6 | Pass |
| Test and build | 3 | Pass; heading |
| `npm test` | 2 | Pass; command |
| `npm run build` | 3 | Pass; command |
| Privacy and payment | 3 | Pass; heading |
| Play needs no account. | 4 | Pass |
| The game has no analytics, checkout, or payment form. | 9 | Pass |
| Progress and sound settings stay in browser storage. | 8 | Pass |
| See Privacy and Terms. | 4 | Pass |
| Artwork and fonts | 3 | Pass; heading |
| The generated risograph artwork is original to Finite Foundry. | 9 | Pass |
| It appears in the social preview. | 6 | Pass |
| The self-hosted fonts use the SIL Open Font License. | 9 | Pass |
| License | 1 | Pass; heading |
| Finite Foundry source code is available under the MIT License. | 10 | F-2-9 |

Terminology is consistent: `campaign` is the six-chapter game, `shift` is one timed run, `route` is the machine layout, `contract` is the customer target, `demo` is sample mode, and `campaign record` is the export/import file.

## Demo and sandbox result

- Initial one-click entry passes on a fresh context: `/demo` opens chapter two, seed `240319`, client `Juniper Kitchen`, product `Fired tiles`, four placed machines, and a visible five-minute timer.
- The required banner, `Reset demo`, `Play full demo`, and `Start for real` are present. Reset restores all four route slots.
- A valid `finite-foundry:save` remained byte-for-byte unchanged through full-demo, reset, and Start-for-real flows.
- Start for real removed the demo save. Browser Back did not, which is F-2-2.
- The live request log contained no cross-origin request. A fresh service-worker context reloaded `/demo` offline.
- The sample content is realistic, but its route and run action are not visible in the first phone screen; see F-2-1.

## Claims execution

Every command below was run exactly from a fresh local clone after `npm ci`.

| Claim | Result |
| --- | --- |
| `seeded-contracts` | PASS |
| `deterministic-contracts` | PASS |
| `campaign-ending` | PASS |
| `finite-free-run` | PASS |
| `local-save-pause` | PASS |
| `hidden-tab-pause` | PASS |
| `export-import-roundtrip` | PASS |
| `demo-isolation` | PASS |
| `demo-setup` | PASS |
| `offline-reload` | PASS |
| `sound-setting` | PASS |
| `shift-duration` | PASS |
| `input-modes` | PASS |
| `privacy-surface` | PASS |
| `frame-rate` | PASS |
| `purchase-availability` | PASS |
| `demo-paths` | PASS |
| `simulation-step` | PASS |
| `asset-provenance` | PASS |

The declared tests pass, but F-2-4, F-2-6, F-2-8, and F-2-9 identify public wording or behavior outside the current manifest coverage. F-2-2 also identifies an exit path omitted by the existing demo test.

## Earlier finding audit

Every finding in `.factory/review-1.md` was checked against the live site and current code.

| Earlier finding | Result in this round |
| --- | --- |
| F-1-1 | Fixed: `local-save-pause` passed independently and in the full suite. |
| F-1-2 | Fixed: exact sample action and both outcome sentences are visible in both landing viewports. |
| F-1-3 | Fixed: no visible target below 44 × 44 px on any checked phone route. |
| F-1-4 | Fixed: the full-run claim test covers six chapters, paid-mechanic selectors, links, and requests. |
| F-1-5 | Fixed: all three client names, products, and quotas are asserted. |
| F-1-6 | Fixed: the claim and test use a 20 ms p95 bound. |
| F-1-7 | Fixed for real-save isolation: a valid real save remained byte-for-byte unchanged. The new demo-exit defect is F-2-2. |
| F-1-8 | Fixed: neutral quota-selection copy replaced the pace claim. |
| F-1-9 | Fixed: deterministic contracts have a manifest entry and tagged core test. |
| F-1-10 | Fixed: hidden-tab pause has a tagged test. |
| F-1-11 | Fixed: chapter, four slots, and 10× clock are asserted. |
| F-1-12 | Fixed for the quoted account/analytics surface. The broader privacy-page sentence is new F-2-4. |
| F-1-13 | Fixed: the unverified Node 20 statement is absent. |
| F-1-14 | Fixed: the long compound test-description sentence is absent. |
| F-1-15 | Fixed: the unlisted `dist/index.html` promise is absent. |
| F-1-16 | Fixed: the unlisted framework claim is absent. |
| F-1-17 | Fixed: the 100 ms step has a manifest entry and tagged test. |
| F-1-18 | Fixed: provenance is listed; the local font, license record, source record, and social image are checked. |
| F-1-19 | Fixed: the public Azure deployment claim is absent. |
| F-1-20 | Fixed: Terms metadata says bonus contracts are unavailable. |
| F-1-21 | Fixed: `How it works` and `Privacy and limits` are present after the live picker. |
| F-1-22 | Fixed for metadata and chrome: the live unknown route returns 404 with canonical, social metadata, touch icon, matching header/footer, and no serious Axe issue. New copy defects are F-2-7 and F-2-8. |
| F-1-23 | Fixed: export, validation, preview, confirmation, and restore work. The new focus defect is F-2-5. |
| F-1-24 | Fixed: the earlier requested audience wording is present. |
| F-1-25 | Fixed: sound controls name the result. |
| F-1-26 | Fixed: the footer uses the campaign wording. |
| F-1-27 | Fixed: `offline accrual` is absent. |
| F-1-28 | Fixed: the README says `separate demo save`. |
| F-1-29 | Fixed: demo and sound storage are explained in player-facing terms. |
| F-1-30 | Fixed: no landing or README sentence exceeds 22 words. |
| F-1-31 | Fixed: the license name is expanded. |
| F-1-32 | Fixed: the sample and sound controls name their results. |

## Structure, accessibility, and visual identity

Confirmed:

- `/`, `/play`, `/demo`, `/privacy`, and `/terms` return 200. Unknown paths return the designed static page with HTTP 404.
- Every checked route has the required title pattern, one `h1`, one `main`, description, canonical, Open Graph metadata, favicon, and consistent header/footer.
- Back and forward navigation restore route title and focus the new `h1`.
- Every discovered link returned 200, excluding the deliberately tested unknown URL, which returned 404.
- No phone route overflowed horizontally, and all visible controls measured at least 44 × 44 px.
- Playwright Axe found no serious or critical issue on any route. The worker URL verifier reported no load error, missing alt text, or unlabeled button.
- Reduced-motion rules are present. The tactile risograph paper, block type, registration marks, offset controls, and ticket layout are distinct rather than a generic SaaS template.
- Production headers include CSP, HSTS, nosniff, referrer policy, and permissions policy.

Failures are F-2-3, F-2-5, F-2-7, and F-2-8.

## Missed leverage

No additional AI feature is justified. The core job is deterministic route planning, and model output would not remove a necessary player task. Export and safe import already cover the obvious local-first portability need. No provider key, model request, or decorative AI surface is present.

## Verification summary

- Fresh-clone install: PASS; 0 vulnerabilities.
- Exact manifest commands: 19/19 PASS.
- `npm test`: PASS; 27/27.
- `npm run build`: PASS; `dist/index.html` produced; initial JavaScript is 32.69 KB raw and 10.84 KB gzip.
- Worker live verifier: PASS; load 662 ms, one `h1`, one `main`, no console or basic accessibility errors.
- Live route/Axe audit: no serious or critical findings; the only console error was the expected resource error for the deliberate 404 request.
- Live link crawl: all discovered links returned 200.
- Live demo requests: same-origin only; offline reload passed.
- `git diff --check`: PASS before report creation.

## What would make this perfect

Put the complete sample route and run action in the first 390 × 844 demo viewport; discard demo state on every exit, including browser Back; restore import focus to the visible trigger; add the offline first-screen fact; narrow the privacy wording; list or remove every unlisted claim; and replace the 404 metaphors. Then rerun all 19 claim commands, the full suite, the live mobile demo, the browser-Back scenario, and the complete route crawl. The acceptance target remains zero findings and zero untested claims.
