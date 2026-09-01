# Finite Foundry

Plan six factory routes and finish a campaign in one or two evenings. Finite Foundry is a browser game for incremental-game players who want useful planning breaks, a clear ending, and no prestige loop.

Each chapter gives you three deterministic contracts. Choose an order, arrange machines around one new constraint, and run a five-minute simulated shift. Production pauses when the tab closes or hides. The intended session is six timed shifts plus untimed planning.

The full campaign is free. It has no ads, energy limits, loot boxes, paid progress, or offline accrual. A $5 one-time license adds twelve harder one-shift contracts after the ending.

## Try the sample campaign

Open `/demo` or visit <https://finite-foundry.sociobot.in/demo>. It starts in chapter two with a complete route and a 10× demo clock. The demo uses `demo:` local-storage keys and never reads or writes the real campaign save.

## Controls

- Pointer or touch: choose a machine card, then choose a route slot.
- Keyboard: Tab to a machine card and press Enter. Press a number key to place it in that slot.
- Route slots: choose a filled slot with no selected machine to clear it.
- Pause: use the visible pause button. Hiding the tab also pauses production.
- Sound: use the header button. The sound choice persists in the current storage namespace.

Campaign progress saves in the browser. The game makes no offline progress. Use **Export save** to download a readable JSON record at any time. The game works offline after the first visit.

## Run locally

Requirements: Node.js 20 or newer.

```sh
npm install
npm run dev
```

The local site opens at `http://localhost:5173`. The direct demo entry is `http://localhost:5173/demo`.

## Test and build

```sh
npm test
npm run build
```

`npm test` builds the production app, starts a local preview, runs deterministic core checks, completes a scripted campaign, checks the demo sandbox, tests offline reload, and runs serious/critical accessibility checks.

`npm run build` is the deployment command. It writes the static product to `dist/`, with `dist/index.html` at the root.

## Privacy and payment

Normal play has no account and sends no game data to another origin. Progress and sound settings use local storage. License holders contact `api.sociobot.in` at most once per day to verify a saved token. See `/privacy` and `/terms`.

Checkout uses the Sociobot billing API. The app never embeds a payment provider or stores payment details.

## Technical notes

- Vite and vanilla TypeScript, with no runtime framework.
- Seeded contract generation and a fixed 100 ms simulation step.
- Service worker shell cache for offline reloads.
- Self-hosted OFL fonts and original generated risograph artwork.
- Static Azure deployment configured by `public/staticwebapp.config.json`.

## License

MIT. See [LICENSE](LICENSE).
