# Images

## `material/` — material plates

Studio-style macro plates (fibre, stem, yarn, weaves, leather, seam, loom,
stacked stems). They are generated procedurally by `tools/generate_textures.py`
as stand-ins until real macro photography is shot. Each exists at full size
and as a `-1200.jpg` variant for `srcset`.

To swap in real photography, keep the filename (and add the `-1200` variant).

## `photo/` — photography slots

These files do not exist yet. Until they are added, each slot shows a
material plate as a fallback (handled in `js/main.js → initPhotoSlots`).
Drop real RE-BANATEX photographs here with these names and they appear
automatically — no code change needed.

| File | Used in | Art direction |
| --- | --- | --- |
| `farmers-stems.jpg` | 07 Origin, wide | Farmers with harvested stems / stems being collected. Landscape 16:10, ≥2000px wide. Real people at work, no posed smiles to camera. |
| `workshop-loom.jpg` | 07 Origin | Hands at a handloom, tight crop on yarn and fingers. Portrait 4:5. |
| `founder.jpg` | 07 Origin, quote | Jonathan Shauri, ideally with the extraction machine. Square, ≥400px. |
| `product-laptop-bag.jpg` | 06 Products, feature + hover | Laptop bag on a neutral paper/stone ground, side light. 4:3. |
| `product-carry-bag.jpg` | 06 Products, hover | As above. Portrait 4:5. |
| `product-backpack.jpg` | 06 Products, hover | As above. Portrait 4:5. |
| `product-shoe.jpg` | 06 Products, hover | As above. Portrait 4:5. |
| `product-fabric.jpg` | 06 Products, hover | Folded fabric cut, close crop showing weave. Portrait 4:5. |
| `product-yarn.jpg` | 06 Products, hover | Yarn hanks/cones. Portrait 4:5. |
| `product-rug.jpg` | 06 Products, hover | Rug detail, top-down. Portrait 4:5. |
| `product-hair.jpg` | 06 Products, hover | Banana-fibre hair extensions, studio. Portrait 4:5. |
| `product-leather.jpg` | 06 Products, hover | Alternative leather swatch, raking light. Portrait 4:5. |

General direction: warm side light, natural paper/earth/charcoal grounds,
aggressive crops, the material always in focus. Avoid generic stock and
staged "sustainability" imagery.
