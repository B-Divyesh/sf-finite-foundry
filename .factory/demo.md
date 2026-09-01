# Demo sandbox

## Entry point

- Production: `https://finite-foundry.sociobot.in/demo`
- Local: `http://localhost:5173/demo`

The catalogue and verifier can also use `/?demo=1`. It opens the same sandbox, while `/demo` remains the canonical URL.

## Sample data

The demo opens chapter two with seed `240319`. A named contract is selected, and this safe route is already placed:

1. Cutter
2. Kiln
3. Cooling rack
4. Press

The lowest available quota is chosen. A 10× demo clock completes the same five-minute simulation in about 30 seconds. `?test=1` changes only wall-clock speed for automated end-to-end checks.

Choose **Play full demo** to begin at chapter one with the same fixed seed. It remains in the demo storage namespace, so the complete scripted campaign is safe to test.

## Isolation and reset

Demo progress uses `demo:finite-foundry:save`. Its sound setting uses `demo:finite-foundry:mute`. Demo mode never reads or writes `finite-foundry:save`.

Choose **Reset demo** to delete the demo save and restore the sample. Choose **Start for real** to delete the demo save and open `/play`; no sample data is copied.

The demo needs no account or network request beyond same-origin page assets. After the first load, the service worker supports an offline reload.
