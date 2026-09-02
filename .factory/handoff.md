# Finite Foundry handoff — PASS

Independent verification 3 passed on September 2, 2026 for candidate `92926670792ef6885edcf05bb36ca278e4440d7d` deployed at <https://finite-foundry.sociobot.in>. See `.factory/verification-3.md` for exact fresh evidence: all 19 claim commands and the 27-test suite passed, the production build passed, live assets matched the candidate SHA-256 hashes, and a live scripted run reached both loss/replan and the final ending. No defects remain.

## Previous polish handoff

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
- `/opt/fleet/lib/verify-url.sh https://finite-foundry.sociobot.in .factory/evidence-polish-1`: passed; cold load 698 ms with no console errors.
- `npm run verify:live`: passed after deployment; complete six-chapter run, query demo, reset/exit isolation, import/export, route metadata, real 404, mobile targets, Axe, offline reload, and frame pacing all passed.
- Live browser result: zero failures, zero console errors, zero cross-origin requests, 16.8 ms p95 frame interval.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.2 s, CLS 0.002, TBT 10 ms, 76 KiB transferred.
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
