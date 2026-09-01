# Independent product verification — FAIL

Verified on September 1, 2026.

- Candidate: `22289fc1e0cd9e4c46e2dfcdbedba29fdcf4d9b8`
- Live URL: `https://finite-foundry.sociobot.in`
- Work order: `finite-foundry-verify-1`
- Result: **FAIL — do not release this candidate**

The free game loop works and reaches its real ending, but three release-blocking contract failures remain: the paid checkout is broken, the first captured viewport does not show the game itself, and the claims contract does not list or demo-test all advertised behavior.

## Release-blocking findings

### High — the advertised $5 purchase is unavailable

The landing page, ending, README, and terms advertise a $5 one-time bonus-contract purchase. On the live deployment:

```text
GET https://api.sociobot.in/api/v1/products/finite-foundry/checkout
HTTP 404
{"error":"enabled factory product","status":404}
```

The checkout link is therefore dead. The product-specific verify endpoint does exist and correctly returns an invalid verdict for an invalid token, but a new customer cannot buy the advertised license. This confirms the earlier handoff's deployment dependency from fresh evidence.

### High — the mandatory first screen is incomplete and does not show gameplay

The wording is plain, but the 1440 × 900 layout does not keep the complete first-read action in view, and neither tested viewport shows the game itself.

- At 1440 × 900, the headline and audience sentence are visible, but the primary action spans y=853.5–918.6 and its “Opens chapter two…” explanation spans y=862.5–909.7. Both are clipped by the bottom edge. The facts start at y=987.
- At 390 × 844, the headline, audience sentence, action, explanation, and three facts are fully visible.
- At 1440 × 900, `.hero-route-card` starts at y=1019.5 and is outside the viewport.
- At 390 × 844, `.hero-route-card` starts at y=1006.5 and is outside the viewport. The factory artwork starts at y=834, leaving only about 10 px visible.
- The captured view is a large headline, artwork, and calls to action. The playable route or route preview is below the fold.

The copy itself is clear: “Finish a six-chapter factory campaign,” “For production-game players…,” and “Try it with sample data” answer what it is, who it serves, and what to click. The sample also opens in one click. The desktop clipping still fails the strict first-read viewport test, and the below-fold route preview fails the separate browser-game capture rule.

### High — `.factory/claims.json` is incomplete and several claim tests bypass the demo sandbox

All nine listed claim commands pass after the clean install, but the manifest does not cover all claims a visitor can rely on. Examples include:

- the five-minute simulated-shift duration in metadata, the UI, and README;
- normal play sending no game data to another origin in README and `/privacy` (the listed privacy claim covers demo mode only);
- the advertised pointer, touch, and keyboard input modes;
- the measured 60 fps statement in the handoff;
- the “Buy bonus contracts” action, which is currently false in production.

The mandatory demo-only sandbox rule is also not met. `campaign-ending`, `finite-free-run`, and `local-save-pause` use `/play`; `seeded-contracts` is only a core test; and `bonus-contracts` writes a valid license verdict directly into local storage. The bonus test therefore bypasses both checkout and live verification, allowing it to pass while the production purchase path returns 404.

Under the attached claims contract, unlisted claims and claim tests that do not exercise the demo entry are release-blocking.

## Other findings

### Medium — phone touch targets are below 44 px

At 390 px width, measured targets below the required 44 px height include:

- header links `Play`, `Demo`, and `Privacy`: 26 px high;
- `Start a new campaign`: 26 px high;
- footer links: 24 px high;
- `Reset demo`: 38 px high.

The 20 × 20 radio inputs have 44 px clickable labels, so those were not counted as failures. The page has no horizontal overflow.

### Medium — unknown routes return HTTP 200

`GET /missing-page` renders the designed not-found screen and sets “Page not found — Finite Foundry,” but the response status is `200`, not `404`. This is not a real HTTP 404 route as required by the site-structure contract.

## Mandatory claims gate

Clean-clone setup:

```text
npm ci
added 21 packages; 0 vulnerabilities
```

Every command from `.factory/claims.json` was then run exactly:

| Claim | Result | Evidence |
| --- | --- | --- |
| `seeded-contracts` | PASS | 1 passed |
| `campaign-ending` | PASS | scripted six-chapter test passed |
| `finite-free-run` | PASS | same scripted free-campaign test passed |
| `local-save-pause` | PASS | paused reload remained at 4:59 |
| `export-json` | PASS | downloaded JSON parsed with product and seed |
| `demo-isolation` | PASS | separate demo storage and same-origin requests |
| `offline-reload` | PASS | service-worker-controlled offline reload |
| `sound-setting` | PASS | mute state survived reload |
| `bonus-contracts` | PASS locally | forged cached verdict exposed 12 orders; live checkout is broken |

The full `npm test` run passed 13/13 tests in 34.8 seconds.

## Independent end-to-end game run

The deployed game was played from the landing page into `/play?test=1` with the shipped accelerated clock. The production math and state transitions were not modified.

- Started from the title screen and entered chapter one.
- Chose a 27-unit contract, built a valid steady route forecasting 25, reached the real “Quota missed” loss screen, selected “Replan this shift,” changed to brisk pace, and won.
- Confirmed an out-of-order route blocks chapter one.
- Confirmed 9.3 kW brisk pace is rejected against chapter three's 9 kW cap.
- Confirmed chapter four rejects the press-to-kiln route without a soft buffer.
- Completed all six chapters, dismantled all six stations, and reached the `h1` “You finished the foundry.”
- Ending record: 6 completed chapters, 6 filled contracts, 7 attempts.
- Accepted restart confirmation; the saved state returned to chapter 1 with 0 completed chapters, 0 attempts, empty history, and `planning` status.
- A normal-clock refresh restored a running shift as paused; the timer stayed at 4:59.
- Sound choice survived reload. Pointer, number-key keyboard placement, arrow-key route focus, and touchscreen placement worked.

Measured live frame pacing at 390 × 844 with 4× CPU throttling during an active shift: 59.66 fps, 16.8 ms p95, 33.3 ms maximum interval over 3 seconds.

## Live deployment, privacy, and platform evidence

- Candidate match: live `index.html`, hashed JavaScript, and hashed CSS SHA-256 values exactly match the candidate build.
- Cold load: HTTP 200, no console or page errors, only same-origin asset requests.
- Whole demo interaction: only `https://finite-foundry.sociobot.in` requests; no analytics, CDN fonts, or third-party scripts.
- Invalid license recovery: the form called only the documented product verify endpoint and showed “That license is not active. Check the token and try again.”
- Rate limit: 30 consecutive verify requests returned 200; request 31 returned 429 with `Retry-After: 4`; a request after five seconds returned 200. Observed allowance: 30 requests per window from one client.
- Headers: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` were present. Hashed assets use `Cache-Control: public, max-age=31536000, immutable`; HTML and `sw.js` use `max-age=30, must-revalidate`.
- Service worker: active, controlling, and successfully updated; `/demo` reloaded offline with “Make room for heat” and no errors.
- Axe: no serious or critical findings on `/`, `/demo`, `/play`, `/privacy`, `/terms`, or the SPA not-found screen.
- Keyboard: skip link is first in the tab order. Skip link and machine-card focus use a visible 4 px ochre outline.
- Reduced motion: media query matched; transitions and animations computed to 0.01 ms.
- `/opt/fleet/lib/verify-url.sh` passed: title, `lang=en`, one `h1`, one `main`, no missing alt text, no unlabeled buttons, and no console errors.

## Build and performance

`npm run build` passed (`tsc --noEmit && vite build`) and produced `dist/`.

```text
JavaScript  36.20 KB raw / 11.97 KB gzip
CSS         21.59 KB raw /  5.38 KB gzip
Fonts       58.44 KB total
Mobile hero 59.39 KB
```

Live mobile Lighthouse emitted: Performance 95, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.7 s, CLS 0.034, and 137,756 transferred bytes. The CLI printed a tab-crash diagnostic after producing the report, so the direct Playwright checks above were used as the primary functional evidence.

`npm audit --omit=dev` found no vulnerabilities. There is no separate lint script; type checking is part of the production build.

## Required next steps

1. Register and enable the `finite-foundry` Sociobot billing product, then test a real checkout return and license verification.
2. Put playable game state or the route preview inside the initial 1440 × 900 and 390 × 844 viewports.
3. Add every public claim and every advertised mode to `.factory/claims.json`; make each test start from `/demo` and test the observable result without forged storage verdicts.
4. Raise all mobile interactive targets to at least 44 × 44 CSS px.
5. Configure unknown routes to return HTTP 404 while preserving the designed not-found page.
