# Finite Foundry polish handoff

Perfection-loop round 1 completed September 2, 2026 for <https://finite-foundry.sociobot.in>.

## What changed

- Repaired all 32 findings in `.factory/review-1.md` and rechecked the earlier verification findings.
- Restored the exact sample-data action and outcome copy while keeping playable contracts in the first phone and desktop viewport.
- Added the missing landing sections, plain wording, route-specific social metadata, complete static 404 chrome, and 44 × 44 px controls.
- Added safe campaign import: validate the product and schema, preview the replacement, confirm it, and keep demo imports isolated.
- Expanded `.factory/claims.json` to 19 claims and hardened every observable proof, including closed/hidden pause behavior, exact seeded contracts, the 10× sample clock, privacy surfaces, provenance, and a 20 ms p95 frame bound.
- Added artwork provenance, font licensing, updated demo documentation, copy audit, and catalog description.

## Verification

- `npm ci`: passed with 0 vulnerabilities.
- `npm test`: 27/27 passed.
- Every exact command in `.factory/claims.json`: 19/19 passed independently from a fresh clone.
- `npm run build`: passed; `dist/index.html` exists.
- Initial bundles: JavaScript 32.69 KB raw / 10.84 KB gzip; CSS 23.19 KB raw / 5.63 KB gzip; fonts 58.44 KB total.
- `/opt/fleet/lib/verify-url.sh https://finite-foundry.sociobot.in .factory/evidence-polish-1`: passed; cold load 645 ms with no console errors.
- `npm run verify:live`: passed after deployment; complete six-chapter run, query demo, reset/exit isolation, import/export, route metadata, real 404, mobile targets, Axe, offline reload, and frame pacing all passed.
- Live browser result: zero failures, zero console errors, zero cross-origin requests, 16.7 ms p95 frame interval.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.3 s, CLS 0.002, TBT 10 ms, 75 KiB transferred.
- `git diff --check`: passed.

## Evidence

- `.factory/evidence-polish-1/live-cold-desktop.png`
- `.factory/evidence-polish-1/live-cold-mobile.png`
- `.factory/evidence-polish-1/live-demo-ending.png`
- `.factory/evidence-polish-1/live-check.json`
- `.factory/evidence-polish-1/verify.json`
- `.factory/evidence-polish-1/lighthouse.json`
- `.factory/polish-1.md`

## Deploy

Build with `npm run build`, then deploy with:

```sh
/opt/fleet/lib/deploy-static.sh finite-foundry /work/repo/dist
```

The existing `sf-finite-foundry` app in `sociobot` is the only cloud resource used.

## Known gaps

None. Bonus contracts remain intentionally unavailable and are not advertised for sale.
