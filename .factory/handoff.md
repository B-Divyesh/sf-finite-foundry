# Finite Foundry polish 2 handoff — PASS

Completed and deployed September 2, 2026. The production application corresponds to code commit `5249a8e` and is live at <https://finite-foundry.sociobot.in>.

## What changed

- Made the initial 390 × 844 demo screen immediately playable: compact notice, chapter, named contract, all four placed machines, and the shift action are visible without scrolling.
- Cleared demo save and sound state on every in-app exit, including browser Back, without reading or changing the real save.
- Added the required offline first-screen fact and narrowed privacy copy to the data actually tested.
- Restored visible keyboard focus after cancelled and completed campaign imports.
- Replaced the 404 metaphors and removed its untested save statement.
- Added the MIT source-license claim and test; all 20 manifest claims now have exactly one matching tag.
- Updated the catalog description, demo/design notes, copy audit, claims manifest, and cumulative finding map.

## Verification

- Clean clone: `npm ci` passed with zero vulnerabilities. Every one of the 20 exact `.factory/claims.json` commands passed independently.
- Full local suite: `npm test` — 29/29 passed, including deterministic core, six-chapter ending, loss/recovery, demo isolation, browser Back, offline reload, import focus, keyboard/touch, route metadata, 404 status, mobile targets, and Axe.
- Build: `npm run build` passed and produced `dist/index.html`. Initial JS is 34.02 KiB raw / 11.13 KiB gzip; CSS is 25.36 KiB raw / 6.01 KiB gzip; fonts total 58.44 KiB.
- Security/privacy: `npm audit --omit=dev` found zero vulnerabilities. The production flow made only bodyless same-origin GET requests. CSP, HSTS, nosniff, referrer policy, and permissions policy are present.
- Live browser audit: `npm run verify:live` completed a six-chapter run and checked every route, 404, history, demo reset/Back isolation, import focus, 390 px layout, 44 px targets, offline reload, and frame pacing. Result: zero failures and zero console errors; p95 frame interval 16.7 ms.
- Worker verifier: 200 response in 629 ms; correct title and language; one `h1`; one `main`; zero missing alt text, unlabeled buttons, or load errors.
- Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; FCP 0.9 s, LCP 1.1 s, CLS 0.002, TBT 10 ms, 76 KiB transfer. The JSON report was complete before the container Chrome process emitted a post-report tab-crash exit.
- Candidate/live match: index plus hashed JS and CSS were compared byte-for-byte. JS SHA-256 is `f23056a0956ab57a00ceae0ad9f8424942634b4dde9ac578a5dcb68fb8ee013b`; CSS SHA-256 is `063d9c317fbe86bcf36e104cc035ec55ec193c867ac10b57b891f5d6b4530055`.

Evidence: `.factory/evidence-polish-2/live-check.json`, `verify.json`, `lighthouse.json`, `live-cold-desktop.png`, `live-cold-mobile.png`, `live-demo-mobile.png`, and `live-demo-ending.png`.

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh finite-foundry ./dist
npm run verify:live
```

## Known gaps and next steps

None. Bonus contracts remain intentionally unavailable and are not advertised as purchasable. No review finding is deferred.
