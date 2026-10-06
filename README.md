# RE-BANATEX — website

Front-end for RE-BANATEX, the Kigali company that turns discarded banana
stems into fibre, yarn, woven fabric and alternative leather.

Plain HTML, CSS and vanilla JS. No build step and no dependencies. Fonts
are self-hosted.

```
index.html              the page
css/tokens.css          fonts, colour, type scale, spacing (edit here first)
css/base.css            reset, typography, buttons, image plates, nav, motion
css/sections.css        section layouts, in page order
js/main.js              interactions + CONFIG (form connection)
assets/fonts/           Newsreader, Archivo, IBM Plex Mono (OFL)
assets/img/material/    material plates (see assets/img/README.md)
assets/img/photo/       photography slots — drop real photos here
tools/generate_textures.py   regenerates the material plates (numpy + Pillow)
```

Run locally with any static server, e.g. `npx http-server .`.

## Design direction

**Concept: from banana stem to material.** The page is a numbered journey,
set like a materials specimen catalogue:

`00 Harvest → 01 Stem → 02 Fibre → 03 Material → 04 Process → 05 Applications → 06 Products → 07 Origin → 08 Impact → 09 Partners → closing CTA`

The hero's journey rail and the fixed chapter marker (desktop) keep the
visitor oriented on that path.

- **Type:**
  - Newsreader (editorial serif) carries statements.
  - Archivo (expanded for the wordmark) handles UI and body.
  - IBM Plex Mono sets specimen labels, specs and captions, like a lab or sample-book voice.
- **Colour:** natural paper, raw fibre, dried stem and charcoal. Rwandan
  laterite red-earth is the single signature accent; it is used for
  emphasis and the closing section. Green appears only in the stem itself.
- **Form:** square corners, hairline rules, flush-mounted images with
  captions, and asymmetric 12-column compositions. Cards, pills, gradients
  and icon rows are deliberately absent.
- **Motion:**
  - Line-by-line headline reveals and top-down image unveils.
  - A sticky process stage that swaps plates as the steps scroll past.
  - The material swatchbook and a cursor-following product preview.
  - Subtle parallax and a nav that inverts over dark sections.
  - Everything is disabled under `prefers-reduced-motion`, and the page is complete without JS.

## Content sources

All copy is based on publicly available RE-BANATEX information: rebanatex.rw
(as indexed), the University of Rwanda GIIH profile, and Hanga Pitchfest 2025
coverage. Company-stated figures are marked † on the page:
- 3M+ tonnes of banana trunks discarded or burned each year
- 65% more sustainable than cotton
- 42.3% cheaper than comparable products on the Rwandan market

No other numbers were added. Technical specs (GSM, tensile strength, etc.)
are intentionally "on request" until RE-BANATEX supplies verified data.

## Before launch

1. **Photography:** add the files listed in `assets/img/README.md`.
2. **Enquiry form:** set `CONFIG.formEndpoint` (JSON POST) or
   `CONFIG.contactEmail` at the top of `js/main.js`. Until then the form
   validates input and points visitors to Instagram.
3. **Logo:** the wordmark is typeset (`.wordmark` in `index.html`). Swap in
   the official logo SVG if one should be used.
4. **Copy check:** have RE-BANATEX confirm milestones, product names and the
   † figures.
