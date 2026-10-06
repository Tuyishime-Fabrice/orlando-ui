# RE-BANATEX — website

Front-end for RE-BANATEX, the Kigali company that turns discarded banana
stems into fibre, yarn, woven fabric and vegan leather.

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
  - A sticky process stage that follows RE-BANATEX's seven production phases.
  - The material swatchbook (with a sample link that follows the selected form) and a cursor-following product preview.
  - Subtle parallax and a nav that inverts over dark sections.
  - Everything is disabled under `prefers-reduced-motion`, and the page is complete without JS.

## Content sources and fact rules

Every claim on the page traces to public RE-BANATEX information: rebanatex.rw
(as indexed by search), the University of Rwanda GIIH company profile,
Hanga Pitchfest 2025 coverage (BusinessBeat24, Kigali Today) and Broadcast
Media Africa. The live rebanatex.rw site could not be opened from the build
environment, so its pages were checked through search-indexed copies.

| On the page | Source |
| --- | --- |
| Founder & CEO Jonathan Shauri, mechanical engineer, designed the first extraction machine | rebanatex.rw/about |
| Idea launched Sep 2022; machine design and manufacture from Oct 2022 | GIIH profile |
| Seven-phase process: raw material, collection, cutting, extraction, treatment (incl. dyeing), spinning, weaving | rebanatex.rw |
| Stems and leaves bought from local farmers; extra income; jobs for youth | GIIH, BMA, Hanga coverage |
| Handlooms and specialised machines; traditional craft skills | BMA |
| Banana fibre blended with cotton | Hanga Pitchfest 2025 coverage |
| Products: yarn, fabric (1 m × 50 cm), garments, rugs/carpets, hair extensions, vegan leather, laptop bag, carry bag, backpack, men's shoe, sandals; custom orders | rebanatex.rw, GIIH, BMA |
| Overall winner, Hanga Pitchfest 2025 (14 Nov 2025, Rwf 50M) | BusinessBeat24, Kigali Today |
| Mission/vision ("leading sustainable textile company in Africa…") | rebanatex.rw/about |
| Founder quotes ("Made in Rwanda" movement; synthetic textiles) | GIIH, BMA |

Company-stated figures carry a † and appear once each, where they belong:
- 3M+ tonnes of banana trunks discarded or burned each year (01 Stem)
- 65% more sustainable than cotton (03 Material dossier)
- 42.3% cheaper than products on the Rwandan market (03 Material dossier)

Rules followed:
- No other numbers appear on the page.
- The Impact section is deliberately qualitative: there are no verified figures for farmers reached, jobs or volumes.
- Technical properties (weight, strength, etc.) are marked "not yet published" rather than estimated.
- Audience and partnership copy is framed as an invitation, not as existing clients.

## Before launch

1. **Photography:** add the files listed in `assets/img/README.md`.
2. **Enquiry form:** set `CONFIG.formEndpoint` (JSON POST) or
   `CONFIG.contactEmail` at the top of `js/main.js`. Until then the form
   validates input and points visitors to Instagram.
3. **Logo:** the wordmark is typeset (`.wordmark` in `index.html`). Swap in
   the official logo SVG if one should be used.
4. **Copy check:** have RE-BANATEX confirm milestones, product names and the
   † figures, and add verified impact numbers (farmers, jobs, tonnes processed)
   to the Impact ledger once they exist.
5. **Social preview:** set `og:image` in `index.html` to an absolute URL once
   the production domain is known.
