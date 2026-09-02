# Finite Foundry

Plan six factory routes and finish a campaign. Finite Foundry is a browser game for players who prefer five-minute simulated shifts and a final ending.

Each campaign seed produces the same three contract choices per chapter. Choose an order, arrange machines to meet the chapter rule, and run a five-minute simulated shift. Production pauses when the tab closes or hides.

The complete six-chapter campaign is free. It has no ads, energy limits, loot boxes, paid progress, or progress while the game is closed. Bonus contracts are unavailable while operator registration is pending.

## Try the sample campaign

Open `/demo` or visit <https://finite-foundry.sociobot.in/demo>. It starts in chapter two with a complete route and a 10× demo clock. Choose **Play full demo** to restart at chapter one in a separate demo save.

The demo stores data under separate demo keys. It never reads or writes your real campaign save. **Reset demo** restores the sample, and **Start for real** discards it.

## Controls

- Pointer or touch: choose a machine card, then choose a route slot.
- Keyboard: focus a machine card and press Enter. Press a number key to place it.
- Route slots: choose a filled slot with no selected machine to clear it.
- Pause: use the visible pause button. Hiding the tab also pauses production.
- Sound: use the header button. The choice is stored separately for demo and real play.

Campaign progress saves in the browser. Use **Export campaign record** to download a JSON file. Use **Import campaign record** to preview and restore that file. The game works offline after the first visit.

## Run locally

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

## Privacy and payment

Play needs no account. The game has no analytics, checkout, or payment form. Progress and sound settings stay in browser storage. See [Privacy](https://finite-foundry.sociobot.in/privacy) and [Terms](https://finite-foundry.sociobot.in/terms).

## Artwork and fonts

The generated risograph artwork is original to Finite Foundry. It appears in the social preview. The self-hosted fonts use the SIL Open Font License.

## License

Finite Foundry source code is available under the [MIT License](LICENSE).
