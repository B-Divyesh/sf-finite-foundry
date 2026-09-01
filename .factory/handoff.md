# Finite Foundry repair handoff

## Release repair

This repair addresses every release-blocking item in the independent report at commit `e227a5e6e90fb4f549e525a8525d123499d75918`.

- Reproduced the reported billing failure before changing code: `GET https://api.sociobot.in/api/v1/products/finite-foundry/checkout` returned HTTP 404 with `{"error":"enabled factory product","status":404}`.
- Removed the unregistered $5 checkout, license restore path, and forged-license behavior. Bonus contracts now state plainly that they are unavailable while operator registration is pending. No Sociobot billing resource was registered or changed.
- The home route is now the real playable campaign. At 1440×900 and 390×844, an operable contract choice is inside the first viewport; the sample route remains one tap away.
- Expanded the claims manifest to cover shift duration, normal-play privacy, all three input modes, active-shift frame pacing, purchase availability, and both real demo URLs. Every claim test opens `/demo` first. The previous cached-license fixture is gone.
- Added a full-demo action that restarts chapter one inside `demo:` storage, so the deterministic six-chapter ending is exercised entirely in the sandbox.
- Raised header, footer, demo-banner, and campaign targets to at least 44px on the 390px viewport.
- Replaced broad SPA fallback with explicit known-route rewrites and a static response override. Unknown routes now serve the designed `404.html` with HTTP 404. The local test server implements the same boundary and asserts it.
- Bumped the service-worker cache to `finite-foundry-v2` so the repaired shell updates after deployment.

## How to run

```sh
npm ci
npm test
npm run build
```

The static artifact is `dist/`. `/demo` and `/?demo=1` are the isolated sample entry points. `/play` starts a normal local campaign.

## Verification evidence

- Clean install: `npm ci` completed with 0 vulnerabilities.
- Full browser suite: `npx playwright test --workers=2 --reporter=list` passed **22/22** in 28.3 seconds. This includes the scripted six-chapter ending, retry/restart, keyboard route controls, pointer/touch placement, 390px layout, 44px targets, real 404 status, offline reload, and accessibility smoke tests.
- Every required claim command: `npx playwright test --grep '@claim:' --reporter=list` passed **13/13** in 23.0 seconds. The two campaign claims intentionally share the one complete scripted-run test, so all 14 manifest claim IDs have exactly one tagged test.
- Production build: `npm run build` passed. Output: JavaScript 27.87 KB raw / 9.64 KB gzip; CSS 22.37 KB raw / 5.51 KB gzip.
- Accessibility: Playwright Axe found no serious or critical issues on `/`, `/demo`, `/privacy`, and `/terms`; the static 404 was separately tested for its HTTP status and semantic page. `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4174/ .factory/evidence-repair` passed with one title, `lang=en`, one `h1`, one main landmark, no missing image alt text, no unlabeled buttons, and no console errors. Its screenshots and report are committed in `.factory/evidence-repair/`.
- Privacy: demo and normal-play request logging assert same-origin-only game traffic. The product contains no third-party fonts, scripts, checkout, analytics, or runtime API connection.
- Performance: the deterministic browser claim measures an active demo shift at p95 ≤34 ms across 90 animation frames, meeting the 60 fps target. A local Lighthouse CLI run reached artifact gathering but its Chrome process closed during cleanup and did not emit a score; bundle budgets and browser checks above passed.
- `npm audit --omit=dev` reported 0 vulnerabilities. `git diff --check` passed.

## Known limitations and next steps

- Bonus contracts deliberately remain unavailable until an operator registers the product and price. Do not add checkout copy or a license path before that registration exists and can be observed end to end.
- Static Web Apps deployment is production-only; verify the deployed custom domain after upload, including `/missing-page` returning HTTP 404 and `/demo` offline after one visit.
