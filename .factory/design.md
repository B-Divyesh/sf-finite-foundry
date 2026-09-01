# Finite Foundry visual and game design

## Direction

Finite Foundry uses a **risograph tactile collage** made from torn inventory slips, overprinted machine silhouettes, registration crosses, and imperfect ink edges. The factory is practical and finite. It feels like a small-run instruction booklet someone marked up during a shift, not a glowing dashboard or an endless industrial empire.

The interface is single-mode and paper-light. Dark indigo plates carry the controls. Cream stock holds plans and explanations. Coral and teal inks mark opposing states. Coarse halftone, offset shadows, clipped corners, and visible registration marks make the product recognizable at thumbnail size.

## Palette

The colors come from the generated print-shop scene and remain fixed across the product.

| Token | Value | Use |
| --- | --- | --- |
| paper | `#F3E8CE` | page background |
| paper-light | `#FFF8E8` | primary reading surfaces |
| ink | `#1E2340` | text and deep control plates |
| ink-muted | `#55556B` | secondary text on paper |
| coral | `#D94B45` | primary action and active route |
| teal | `#147D78` | success and completed production |
| ochre | `#C58A19` | caution and simulated timer |
| danger | `#A62E38` | failed shifts and destructive actions |

All body combinations meet 4.5:1. Coral is never used for small text on cream. White or deep ink text sits on solid controls.

## Type and spacing

Display headings use **Bowlby One SC**, licensed under the SIL Open Font License and self-hosted as a subset. Body and controls use **Atkinson Hyperlegible**, also OFL and self-hosted. The broad display face resembles block-cut type; the quiet body face keeps small machine data readable.

Spacing follows an 8 px base: 4, 8, 16, 24, 32, 48, 64, and 96 px. Text measures never exceed 70 characters. Controls are at least 44 px high. On phones, the route becomes a vertical production strip and secondary status moves below it.

## Shape and interaction grammar

- Paper sections use irregular clipped corners and 2 px ink rules.
- Buttons carry a 4 px offset ink shadow and visibly press into it.
- Machine tiles resemble perforated stock cards. Selecting a machine raises it; choosing a route slot places it there.
- Registration crosses and dot screens are decorative and never convey state.
- A route reads left-to-right on wide screens and top-to-bottom at 390 px.
- Keyboard players choose a machine, then a numbered slot. Arrow keys move between route slots. Delete clears the focused slot.

## Motion policy

One signature motion is the **paper-feed step**: finished goods advance across the route in short, physical 180 ms translations rather than floating continuously. Buttons and cards use 140–220 ms transform/opacity transitions. The generated scene drifts by no more than 12 px while the landing preview enters.

With `prefers-reduced-motion: reduce`, the paper-feed translation becomes an instant state change, scene drift stops, and transitions are removed. There is no flashing, looping decoration, or mandatory timed input. Screen shake is off by default and remains optional.

## Game loop and difficulty

The campaign has six chapters. Each chapter adds one routing rule and retains prior knowledge:

1. Put two required machines in order.
2. Add heat and keep a cooling gap.
3. Meet a power cap while assembling three steps.
4. Route fragile stock without placing heavy machines together.
5. Reclaim scrap and balance pace against quota.
6. Build the complete route, run the last shift, then dismantle every station for the ending.

Each production shift is a clearly labeled five-minute simulated timer. The simulation pauses when the tab is hidden and never adds offline progress. A forecast says whether the current plan can meet quota before the player starts. Missing the quota is the loss state; the same chapter can be replanned and retried. Campaign completion typically takes about 60–90 minutes because planning time varies.

The deterministic core advances in fixed 100 ms steps and clamps long frame gaps. A seeded PRNG chooses one of three named contracts per chapter. The seed appears in the campaign record. Demo and automated tests use accelerated clock rates while keeping the same production math.

## Asset plan and provenance

The hero is one original generated risograph illustration of a compact impossible factory folding out of a paper plan. It provides the world, while game controls remain authored HTML/CSS for clarity. A responsive WebP is used on the first screen and is kept below 300 KB. The social preview is composed from the same art so the identity stays consistent. Icons and registration marks are hand-authored CSS/SVG.

Prompt sheet: “Editorial risograph collage, compact impossible tabletop factory unfolding from a torn cream production plan, chunky conveyors and stamping machines, coral red and teal ink over deep indigo, ochre registration marks, coarse halftone dots, imperfect two-color overprint, tactile recycled paper fibers, asymmetric overhead three-quarter composition, large calm negative-space area, no people, no text, no letters, no numbers, no logos, no watermark, no gradients, no photorealism.”

Generated with the factory image model (`factory-image`) on 2026-09-01. Assets are original to Finite Foundry. Generated imagery is disclosed in the footer.

## Sound

Small synthesized clicks, press thumps, and a completion chord use the Web Audio API after a user gesture. No audio files or network requests are used. Sound defaults on but only begins after interaction; mute persists locally.
