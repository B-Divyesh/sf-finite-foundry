# Adversarial first-read review 1 — FAIL

Reviewed September 2, 2026 against commit `46d3b52f5aa28f1508b13d57ff201f8e1a1e2aa9` and the live site at <https://finite-foundry.sociobot.in>.

## Verdict

**FAIL.** There are 32 findings. Seven are blocking. The live game is clear enough to start and the demo is substantive, but one required claim command failed, several claims are not actually proved by their tagged tests, two earlier repairs are incomplete, and the public copy contains unlisted claims.

## Cold first screen

Fresh browser contexts were used at 390 × 844 and 1440 × 900 before the implementation was read.

| Question | Answer from the first screen |
| --- | --- |
| What does this do? | It is a six-chapter factory game where the player chooses contracts and plans production routes. |
| For whom? | It says it is for production-game players who want planning, pauses, and an ending. |
| What should I click first? | `Try sample route` is the primary sample action. A contract ticket is also already operable. |

All three questions can be answered, so the cold-read clarity gate itself passes. On both viewports the headline, audience sentence, three facts, sample action, and at least part of an operable contract are visible. There were no console errors on `/`.

The sample action still regresses a prior first-screen requirement: the adjacent explanation was deleted and the mandated label was changed. See F-1-2.

## Findings

### Blocking

#### F-1-1 — A required claim command fails intermittently

- **Quote/location:** `.factory/claims.json`, `local-save-pause`: `npm test -- --grep @claim:local-save-pause`.
- **Evidence:** One clean exact run failed with `Expected: >= 289; Received: 287` at `tests/claims.spec.ts:73`. Three immediate exact retries passed, and the later full suite passed 22/22.
- **Why this fails:** The claims gate says any failing claim test is blocking. The test compares a display value with a save value while a 10× clock continues during reload; its one-second tolerance is smaller than the observed timing skew. A flaky proof is not proof.
- **Concrete fix:** Start the shift, wait for a known persisted tick, close the page, wait, reopen `/demo`, and compare the persisted `remainingMs` before and after the closed interval. Assert that the reopened shift is paused and stable. Avoid comparing independently sampled UI and storage clocks.

#### F-1-2 — The earlier first-screen action repair is incomplete

- **Quote/location:** live `/`, button `Try sample route`; there is no adjacent outcome sentence.
- **History:** The earlier high finding required the primary sample action and its explanation to be visible. The repair moved gameplay into view but removed the explanation and changed `Try it with sample data` to `Try sample route`.
- **Why this fails:** A new visitor is not told that the click opens a ready chapter-two route or that demo changes cannot affect a real campaign. This is a half-fix of an earlier finding and therefore blocking under the work order.
- **Concrete fix:** Use `Try it with sample data`. Add beside it: `Opens chapter two with a complete route. Demo changes never touch your campaign.` Keep both visible at 390 × 844 and 1440 × 900.

#### F-1-3 — The earlier touch-target repair is incomplete

- **Quote/location:** live 390 px layouts. `/`, `/play`, `/demo`, `/privacy`, and `/terms` render `Play` at 34 × 44 px and footer `Terms` at 40 × 44 px. The static 404 renders `Play` at 30 × 44 px and `Demo` at 43 × 44 px.
- **History:** The previous finding said phone targets were below the required 44 px minimum. The repair test checks height only.
- **Why this fails:** The accessibility baseline requires targets to be at least 44 × 44 px, not merely 44 px tall. Narrow targets remain harder to use by touch.
- **Concrete fix:** Give every compact link a minimum inline size of 44 px, then make the automated target test assert both `width >= 44` and `height >= 44` on every route, including the static 404.

#### F-1-4 — `finite-free-run` does not test most of its claim

- **Quote/location:** claim: `The full campaign has no prestige reset, ads, energy limits, loot boxes, or paid progress.`
- **Evidence:** The tagged test completes and restarts the campaign. It does not assert the absence of ads, energy, loot, paid-progress controls, or network calls throughout the run.
- **Why this fails:** A successful free run can coexist with every prohibited mechanic in the sentence. Most of the public promise remains untested.
- **Concrete fix:** During the complete demo run, log all requests and inspect every rendered state for paid, ad, energy, loot, checkout, and license controls. Split the compound claim if the guarantees need separate tests.

#### F-1-5 — `seeded-contracts` does not prove that choices are named

- **Quote/location:** claim: `A full demo campaign offers three named contract choices.`
- **Evidence:** The tagged test counts three `[data-contract]` elements and checks only that the first contains `units`.
- **Why this fails:** `units` is not a contract name, and contracts two and three are not inspected.
- **Concrete fix:** Assert three non-empty, distinct client names and product names for the fixed seed, plus the expected quota on every ticket.

#### F-1-6 — The frame-rate test permits about 30 fps while claiming 60 fps

- **Quote/location:** claim: `The game targets 60 frames per second during an active shift.` Test: p95 frame interval `<= 34 ms`.
- **Why this fails:** A 34 ms frame interval is about 29.4 fps. The test can pass at roughly half the claimed rate.
- **Concrete fix:** Either claim the measurable bound, such as `p95 frame interval stays at or below 34 ms`, or use a threshold near 16.7 ms with a documented allowance that still represents a 60 fps target.

#### F-1-7 — The demo-isolation test does not protect the real save key

- **Quote/location:** claim: `The demo uses separate sample storage and sends no game data to another origin.` Test writes `finite-foundry:marker`, not `finite-foundry:save`.
- **Why this fails:** Preserving an unrelated marker does not prove the real campaign save is never read or overwritten.
- **Concrete fix:** Create a valid real campaign in `finite-foundry:save`, record the full value, exercise demo play, Reset demo, Play full demo, and Start for real, then assert the real value is byte-for-byte unchanged. Keep the existing request log. The live implementation passed this stronger manual check.

### Major

#### F-1-8 — The landing page makes an unlisted pace claim

- **Quote/location:** live `/`: `Lower quotas leave more room for a slower pace.`
- **Why this fails:** This is actionable game advice, but no claims entry proves that a lower quota is achievable at a slower pace.
- **Concrete fix:** Add a claim and deterministic core/browser test comparing forecast and quota at each pace, or replace the sentence with neutral selection guidance.

#### F-1-9 — Deterministic contract generation is an unlisted claim

- **Quote/location:** README: `Each chapter gives you three deterministic contracts.`
- **Why this fails:** `seeded-contracts` promises three named choices, not repeatability for the same seed. An untagged core test exists, but the public claim has no manifest entry.
- **Concrete fix:** Add a `deterministic-contracts` claim linked to the core test and assert equal output for equal seeds and variation across selected different seeds. Rewrite the copy as `Each campaign seed produces the same three contract choices per chapter.`

#### F-1-10 — Hidden-tab pausing is an unlisted claim

- **Quote/location:** README: `Production pauses when the tab closes or hides.` and `Hiding the tab also pauses production.`
- **Why this fails:** `local-save-pause` covers reload/closed behavior only. It never changes page visibility.
- **Concrete fix:** Add one claim entry and a browser test that backgrounds the page, waits, restores it, and verifies the timer did not advance.

#### F-1-11 — The seeded demo's complete route and 10× clock are unlisted

- **Quote/location:** README: `It starts in chapter two with a complete route and a 10× demo clock.`
- **Why this fails:** This quantitative demo promise has no claims entry. `shift-duration` checks the displayed five-minute duration, not the 10× wall-clock behavior or complete route.
- **Concrete fix:** Add a claim that asserts chapter two, all four expected route slots, and approximately ten seconds of simulated countdown per wall-clock second.

#### F-1-12 — Account and analytics claims are not fully listed or tested

- **Quote/location:** README: `Normal play has no account...` and `The game has no analytics, checkout, or payment form while bonus contracts are unavailable.`
- **Why this fails:** `normal-play-privacy` only rejects cross-origin requests. It does not rule out same-origin analytics or account UI. `purchase-availability` covers checkout/license controls on Terms, not every route.
- **Concrete fix:** Add a privacy-surface claim that crawls all routes, records requests, and asserts no account, analytics, checkout, payment, or license controls/endpoints.

#### F-1-13 — Node.js 20 compatibility is unlisted and unverified

- **Quote/location:** README: `Requirements: Node.js 20 or newer.`
- **Why this fails:** This is a compatibility promise. This review ran Node 22.23.2; there is no Node 20 matrix or claims entry.
- **Concrete fix:** Test install, build, and browser tests under Node 20 in CI and list the claim, or change the requirement to the version actually tested.

#### F-1-14 — The documented `npm test` scope is an unlisted compound claim

- **Quote/location:** README: ``npm test` builds the production app, starts a local preview, runs deterministic core checks, completes a scripted campaign, checks the demo sandbox, tests offline reload, and runs serious/critical accessibility checks.`
- **Why this fails:** This is both unlisted and 30 words long. The current command did perform these tasks, but the claims manifest does not track the public promise.
- **Concrete fix:** Either remove operational test implementation details from public claims scope or add a manifest test that runs the command and checks its named suites. Split the copy into: ``npm test` builds the app and starts a local preview. It runs core, campaign, demo, offline, and accessibility checks.`

#### F-1-15 — The build-output promise is unlisted

- **Quote/location:** README: `It writes the static product to dist/, with dist/index.html at the root.`
- **Why this fails:** The statement is testable and currently true, but has no claim entry.
- **Concrete fix:** Add a build-artifact claim that runs `npm run build` in a clean checkout and asserts `dist/index.html`, or remove the promise. This review confirmed the file exists.

#### F-1-16 — The framework claim is unlisted

- **Quote/location:** README: `Vite and vanilla TypeScript, with no runtime framework.`
- **Why this fails:** `No runtime framework` is a dependency/runtime claim with no manifest entry.
- **Concrete fix:** Add a static dependency/bundle check or remove the line from public copy.

#### F-1-17 — The 100 ms simulation claim is unlisted

- **Quote/location:** README: `Seeded contract generation and a fixed 100 ms simulation step.`
- **Why this fails:** This quantitative behavior is absent from the manifest.
- **Concrete fix:** Add a tagged deterministic-core test that advances the engine in 100 ms increments and asserts the same outcome across equivalent elapsed time.

#### F-1-18 — Font and artwork provenance claims are unlisted

- **Quote/location:** README: `Self-hosted OFL fonts and original generated risograph artwork.` Footer: `Original generated artwork`.
- **Why this fails:** These public provenance/privacy claims are not in `claims.json`. The generated artwork is used for social metadata but is not visible in the current page UI.
- **Concrete fix:** Add an asset-provenance check for local font URLs, license files, prompt/source metadata, and the referenced social image. Clarify the footer as `Original generated artwork used in the social preview` unless artwork is restored to the page.

#### F-1-19 — The Azure deployment claim is unlisted

- **Quote/location:** README: `Static Azure deployment configured by public/staticwebapp.config.json.`
- **Why this fails:** This is a deploy-platform claim without a manifest entry.
- **Concrete fix:** Add a static configuration check and a live-header/routing smoke test, or remove the platform detail from public copy.

#### F-1-20 — Terms metadata advertises buying an unavailable product

- **Quote/location:** live `/terms` meta description: `Terms for playing Finite Foundry and buying the optional contract set.` Body copy: `Bonus contracts are unavailable while operator registration is pending.`
- **Why this fails:** Search and link previews can promise a purchase path that the page explicitly says does not exist.
- **Concrete fix:** Change the meta description to `Terms for playing Finite Foundry while optional bonus contracts are unavailable.` Add it to the purchase-availability test.

#### F-1-21 — The landing page omits two required skeleton sections

- **Quote/location:** live `/` moves from the first screen and `Available contracts` directly to the footer.
- **Why this fails:** The site-structure contract requires `How it works` and a plain `What it does not do / privacy` section. A first-time visitor has to open other routes or the README to learn the three-step loop and local-only boundary.
- **Concrete fix:** Add a three-step `How it works` section after the playable picker and a `Privacy and limits` section covering local saves, no offline progress, no account, and unavailable bonus contracts.

#### F-1-22 — The real 404 has incomplete metadata and inconsistent site chrome

- **Quote/location:** live `/missing-page`, HTTP 404. It has no canonical link, Open Graph tags, Twitter card, or apple-touch icon. Its wordmark is `FF · Finite Foundry` instead of `FF Finite Foundry`; it omits the sound control and the `Built by Param Factory` footer link.
- **Why this fails:** The page is designed and returns the correct status, but it does not meet the metadata or consistent-header/footer contract.
- **Concrete fix:** Add canonical, OG/Twitter, and apple-touch metadata to `public/404.html`; reuse the same wordmark and footer links. If sound cannot work on the static page, omit that utility consistently or provide a functional static equivalent.

#### F-1-23 — Exported campaigns cannot be restored

- **Quote/location:** README says `export records you want to keep`, while the UI only offers `Export save`.
- **Why this fails:** A player can preserve a readable record but cannot restore progress after clearing browser storage or moving devices. Import is the obvious missing counterpart to the brief's local-save/export requirement.
- **Concrete fix:** Add `Import campaign record`, validate product/version/schema, preview what will be replaced, require confirmation, keep demo imports under `demo:`, and add sandboxed import/export round-trip claims.

### Minor copy findings

#### F-1-24 — The audience sentence uses genre jargon and vague benefit words

- **Quote/location:** landing: `For production-game players who want clear plans, useful pauses, and an ending.` README: `incremental-game players` and `no prestige loop`.
- **Why this fails:** A cold visitor may not know `production-game`, `incremental-game`, or `prestige loop`; `clear` and `useful` do not explain the session.
- **Concrete fix:** Landing: `For factory-game players who want short planning sessions instead of endless resets.` README: `Finite Foundry is a browser game for players who want short planning sessions, a final ending, and no repeated reset loop.`

#### F-1-25 — The sound button names state, not the click result

- **Quote/location:** all app routes: `Sound on` / `Sound off`.
- **Why this fails:** `Sound on` can mean either current state or the action that will occur.
- **Concrete fix:** Label the action `Turn sound off` when sound is on and `Turn sound on` when it is off. Keep `aria-pressed` for state.

#### F-1-26 — The footer uses an ambiguous slogan

- **Quote/location:** `Plan six routes. Finish the machine.`
- **Why this fails:** `Finish the machine` does not say whether the player builds, runs, or dismantles it, and it conflicts with the consistent term `campaign`.
- **Concrete fix:** `Plan six factory routes and finish the campaign.`

#### F-1-27 — `offline accrual` is unexplained jargon

- **Quote/location:** README: `It has no ads, energy limits, loot boxes, paid progress, or offline accrual.`
- **Why this fails:** A visitor should not need genre vocabulary to understand whether the game changes while closed.
- **Concrete fix:** `It has no ads, energy limits, loot boxes, paid progress, or progress while the game is closed.`

#### F-1-28 — `isolated sample storage` is implementation language

- **Quote/location:** README: `inside the same isolated sample storage`.
- **Why this fails:** The useful fact is that demo changes stay separate from the real campaign.
- **Concrete fix:** `Choose Play full demo to restart at chapter one in a separate demo save.`

#### F-1-29 — `local-storage keys` and `storage namespace` are unexplained

- **Quote/location:** README: `The demo uses demo: local-storage keys...` and `The sound choice persists in the current storage namespace.`
- **Why this fails:** These terms describe implementation rather than the outcome a player needs.
- **Concrete fix:** `The demo stores data under separate demo keys. It never reads or writes your real campaign save.` and `The sound choice is stored separately for demo and real play.`

#### F-1-30 — One README sentence exceeds 22 words

- **Quote/location:** the `npm test` sentence under `Test and build`, 30 words.
- **Why this fails:** It exceeds the plain-words hard cap and packs seven actions into one sentence.
- **Concrete fix:** ``npm test` builds the app and starts a local preview. It runs core, campaign, demo, offline, and accessibility checks.`

#### F-1-31 — `OFL` is an unexplained acronym

- **Quote/location:** README: `Self-hosted OFL fonts and original generated risograph artwork.`
- **Why this fails:** Readers should not have to infer the font license name.
- **Concrete fix:** `The self-hosted fonts use the SIL Open Font License. The risograph artwork is original.`

#### F-1-32 — The sample CTA and sound control are the only non-result-naming first-screen controls

- **Quote/location:** `Try sample route` does not name the sandbox outcome; `Sound on` does not name the action. Contract tickets name values rather than actions but are introduced by `Choose one order`, so they remain understandable option controls.
- **Why this fails:** The two standalone controls require inference.
- **Concrete fix:** Apply the F-1-2 and F-1-25 rewrites. No contract-ticket rewrite is required.

## Demo and sandbox result

The demo behavior itself passes:

- One click from the landing page opened `/demo` with chapter two, seed `240319`, Juniper Kitchen, four placed machines, a 25/20 forecast, and a visible 5:00 simulated timer.
- The persistent banner said `Demo — sample data, nothing is saved` and offered Reset demo, Play full demo, and Start for real.
- Reset restored the seeded route.
- A valid real `finite-foundry:save` value remained byte-for-byte unchanged after Reset demo and Start for real.
- Start for real deleted `demo:finite-foundry:save` without copying sample data.
- A live request log contained only `https://finite-foundry.sociobot.in`.
- In a fresh service-worker context, `/demo` reloaded offline with the demo banner and `Make room for heat`; there were no console errors.

The label/explanation defect is recorded separately as F-1-2; it does not make the loaded sample itself weak.

## Claims execution

Every `test` command in `.factory/claims.json` was run exactly after `npm ci`.

| Claim ID | Exact-command result |
| --- | --- |
| `seeded-contracts` | PASS |
| `campaign-ending` | PASS |
| `finite-free-run` | PASS |
| `local-save-pause` | **FAIL** once; three exact retries passed |
| `export-json` | PASS |
| `demo-isolation` | PASS |
| `offline-reload` | PASS |
| `sound-setting` | PASS |
| `shift-duration` | PASS |
| `input-modes` | PASS |
| `normal-play-privacy` | PASS |
| `frame-rate` | PASS, but the assertion does not prove its wording; see F-1-6 |
| `purchase-availability` | PASS |
| `demo-paths` | PASS |

The complete `npm test` run later passed 22/22 in 28.0 seconds. That does not erase the earlier exact-command failure.

## Copy audit

Counting rule: hyphenated terms, paths, URLs, versions, and button labels count as one word each. Headings, labels, navigation, and dynamic ticket data are included even when they are fragments.

### Live landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to the game | 4 | pass |
| FF | 1 | pass |
| Finite Foundry | 2 | pass |
| Play | 1 | pass |
| Demo | 1 | pass |
| Privacy | 1 | pass |
| Sound on | 2 | F-1-25, F-1-32 |
| Chapter 1 of 6 | 4 | pass |
| Finish a six-chapter factory campaign | 5 | pass |
| For production-game players who want clear plans, useful pauses, and an ending. | 11 | F-1-24 |
| Five-minute simulated shifts | 3 | listed claim |
| Saves in this browser | 4 | listed claim |
| Complete campaign is free | 4 | listed claim |
| Try sample route | 3 | F-1-2, F-1-32 |
| Choose one order | 3 | pass |
| Available contracts | 2 | pass |
| Lower quotas leave more room for a slower pace. | 9 | F-1-8 |
| Civic Sign Shop | 3 | dynamic sample data; pass |
| Canal Lock Works | 3 | dynamic sample data; pass |
| Hilltop Radio Club | 3 | dynamic sample data; pass |
| Moss Street Hardware | 3 | dynamic sample data; pass |
| North Quay Repairs | 3 | dynamic sample data; pass |
| Flat brackets | 2 | repeated ticket value; pass |
| 20 units / 23 units / 27 units | 2 each | repeated ticket values; pass |
| Plan six routes. | 3 | F-1-26 |
| Finish the machine. | 3 | F-1-26 |
| Terms | 1 | pass |
| Built by Param Factory | 4 | pass |
| external site | 2 | pass |
| Version 1.0.0 · Original generated artwork | 5 | F-1-18 |

The two cold contexts produced different seed-based ticket combinations; all observed ticket text is represented above.

### README

| # | Sentence or heading | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Finite Foundry | 2 | pass |
| 2 | Plan six factory routes and finish a campaign. | 8 | listed claim |
| 3 | Finite Foundry is a browser game for incremental-game players who want useful planning breaks, a clear ending, and no prestige loop. | 21 | F-1-24 |
| 4 | Each chapter gives you three deterministic contracts. | 7 | F-1-9; jargon rewrite supplied |
| 5 | Choose an order, arrange machines around one new constraint, and run a five-minute simulated shift. | 15 | listed game-flow claims |
| 6 | Production pauses when the tab closes or hides. | 8 | F-1-10 |
| 7 | The intended session is six timed shifts plus untimed planning. | 10 | covered by campaign and duration claims |
| 8 | The complete six-chapter campaign is free. | 6 | listed claim |
| 9 | It has no ads, energy limits, loot boxes, paid progress, or offline accrual. | 13 | F-1-4, F-1-27 |
| 10 | Bonus contracts are unavailable while operator registration is pending. | 9 | listed claim |
| 11 | Try the sample campaign | 4 | clear heading |
| 12 | Open /demo or visit https://finite-foundry.sociobot.in/demo. | 5 | pass |
| 13 | It starts in chapter two with a complete route and a 10× demo clock. | 14 | F-1-11 |
| 14 | Choose Play full demo to restart at chapter one inside the same isolated sample storage. | 15 | F-1-28 |
| 15 | The demo uses demo: local-storage keys and never reads or writes the real campaign save. | 15 | F-1-7, F-1-29 |
| 16 | Controls | 1 | clear heading |
| 17 | Pointer or touch: choose a machine card, then choose a route slot. | 12 | listed claim |
| 18 | Keyboard: Tab to a machine card and press Enter. | 9 | listed claim |
| 19 | Press a number key to place it in that slot. | 10 | listed claim |
| 20 | Route slots: choose a filled slot with no selected machine to clear it. | 13 | pass |
| 21 | Pause: use the visible pause button. | 6 | pass |
| 22 | Hiding the tab also pauses production. | 6 | F-1-10 |
| 23 | Sound: use the header button. | 5 | pass |
| 24 | The sound choice persists in the current storage namespace. | 9 | F-1-29 |
| 25 | Campaign progress saves in the browser. | 6 | listed claim |
| 26 | The game makes no offline progress. | 6 | listed claim |
| 27 | Use Export save to download a readable JSON record at any time. | 12 | listed claim |
| 28 | The game works offline after the first visit. | 8 | listed claim |
| 29 | Run locally | 2 | clear heading |
| 30 | Requirements: Node.js 20 or newer. | 5 | F-1-13 |
| 31 | The local site opens at http://localhost:5173. | 6 | verified; pass |
| 32 | The direct demo entry is http://localhost:5173/demo. | 6 | verified; pass |
| 33 | Test and build | 3 | clear heading |
| 34 | npm test builds the production app, starts a local preview, runs deterministic core checks, completes a scripted campaign, checks the demo sandbox, tests offline reload, and runs serious/critical accessibility checks. | 30 | F-1-14, F-1-30 |
| 35 | npm run build is the deployment command. | 7 | verified; pass |
| 36 | It writes the static product to dist/, with dist/index.html at the root. | 12 | F-1-15 |
| 37 | Privacy and payment | 3 | clear heading |
| 38 | Normal play has no account and sends no game data to another origin. | 13 | F-1-12 |
| 39 | Progress and sound settings use local storage. | 7 | listed persistence claims |
| 40 | The game has no analytics, checkout, or payment form while bonus contracts are unavailable. | 14 | F-1-12 |
| 41 | See /privacy and /terms. | 4 | pass |
| 42 | Technical notes | 2 | clear heading |
| 43 | Vite and vanilla TypeScript, with no runtime framework. | 8 | F-1-16 |
| 44 | Seeded contract generation and a fixed 100 ms simulation step. | 10 | F-1-9, F-1-17 |
| 45 | Service worker shell cache for offline reloads. | 7 | offline claim listed; technical jargon is unnecessary |
| 46 | Self-hosted OFL fonts and original generated risograph artwork. | 8 | F-1-18, F-1-31 |
| 47 | Static Azure deployment configured by public/staticwebapp.config.json. | 6 | F-1-19 |
| 48 | License | 1 | clear heading |
| 49 | MIT. | 1 | pass |
| 50 | See LICENSE. | 2 | pass |

No other sentence exceeds 22 words. None contains a word from the attached banned-word list.

## Structure, routing, and accessibility checks

Confirmed passes:

- `/`, `/play`, `/demo`, `/privacy`, and `/terms` return 200; an unknown route returns the designed page with HTTP 404.
- Each app route has one `h1`, one `main`, `lang="en"`, a route title, description, and canonical URL.
- App-route titles follow the required patterns and remain under 60 characters.
- Back and forward navigation restore the route, scroll to the top, focus the new `h1`, and update the polite announcer.
- Every discovered internal link returned its expected status; the external Param Factory link returned 200.
- Home, demo, privacy, and terms headers and footers are consistent.
- The live home verifier reported no console errors, missing alt text, or unlabeled buttons.
- The full Axe-integrated test reported no serious or critical violations on the app routes.
- No horizontal overflow was present at 390 px.
- The risograph paper, block type, offset shadows, and contract tickets form a distinct product-specific identity rather than a generic SaaS layout.
- Reduced-motion CSS removes transitions and animations.

Failures are F-1-3, F-1-21, and F-1-22.

## Earlier finding audit

No `.factory/review-*.md` or `.factory/polish-*.md` existed before this review. All historical versions of `.factory/handoff.md`, plus both verification reports, were checked.

| Earlier finding | Live and code result |
| --- | --- |
| Broken advertised $5 checkout | **Fixed.** Checkout/license controls are removed; Terms states bonus contracts are unavailable. |
| First viewport did not show gameplay | **Partly fixed.** A contract is operable in both viewports, but the sample outcome explanation was deleted. Blocking again as F-1-2. |
| Claims manifest incomplete / tests bypassed demo | **Partly fixed.** All current tests start from demo as documented, but one exact command failed and coverage gaps remain. F-1-1 and F-1-4 through F-1-19. |
| Phone targets below 44 px | **Partly fixed.** Heights reach 44 px; several widths do not. Blocking again as F-1-3. |
| Unknown routes returned HTTP 200 | **Fixed.** `/missing-page` returns HTTP 404 with the designed page. |
| Demo full campaign and storage isolation | **Fixed in behavior.** The stronger live real-save check passed; the automated proof remains incomplete under F-1-7. |

## Missed leverage

F-1-23 describes the expected import counterpart to local export. No AI feature is warranted: the core job is a deterministic offline planning game, and model use would not remove a real player task. There is no decorative AI, embedded provider key, or external model request.

## Verification summary

- `npm ci`: PASS, 0 vulnerabilities.
- Every claim command: 13 passed on first execution; `local-save-pause` failed once, then passed three retries.
- `npm test`: PASS, 22/22.
- `npm run build`: PASS; `dist/index.html` produced; JS 27.87 KB raw / 9.64 KB gzip.
- `/opt/fleet/lib/verify-url.sh https://finite-foundry.sociobot.in/ <temp-dir>`: PASS.
- Live request logging: same-origin only for demo and offline flow.
- Live offline reload: PASS.
- Live demo real-save isolation: PASS.
- Link crawl: PASS, with the unknown route correctly returning 404.
- `git diff --check`: PASS before review files were written.

## What would make this perfect

Resolve every finding above: make every claim command deterministic; make each test prove its exact sentence; list or remove every public claim; restore the explicit sample-data action and outcome sentence; make every target 44 × 44 px; complete the landing skeleton and 404 metadata; add safe campaign import; and apply every copy rewrite. Then repeat the full review from fresh mobile and desktop contexts. The acceptance condition is zero findings and zero untested claims.
