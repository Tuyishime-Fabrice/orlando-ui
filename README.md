# Ingabo Kreative — website

A fast, static website for **Ingabo Kreative**, a photography and videography agency in Kigali, Rwanda.
Plain HTML, CSS and JavaScript: no framework, no build step, no database. It runs on any ordinary web host.

---

## 1. What's in the box

```text
ingabo-kreatives/
├── index.html            Home                       → /
├── services/index.html   Services (6 detailed services, "Request a quote") → /services/
├── portfolio/index.html  Portfolio (filters + lightbox) → /portfolio/
├── about/index.html      About                      → /about/
├── contact/index.html    Contact & booking form     → /contact/
├── 404.html              "Page not found" page
├── favicon.svg           Browser-tab icon (IK monogram)
├── site.webmanifest      App/bookmark metadata
├── robots.txt            Search-engine rules
├── sitemap.xml           Page list for search engines
│
├── css/
│   ├── style.css         Design tokens, base styles, layout, page sections
│   └── components.css    Buttons, navigation, cards, grids, lightbox, forms, footer
│
├── js/
│   ├── config.js         ★ Business contact details, WhatsApp number, socials
│   ├── data.js           ★ Portfolio projects and testimonials
│   ├── main.js           Shared helpers, hero slideshow, reveal, back-to-top
│   ├── navigation.js     Header behaviour and mobile menu
│   ├── portfolio.js      Portfolio grids and category filters
│   ├── lightbox.js       Full-screen image/video viewer
│   └── contact.js        Form validation and WhatsApp/email hand-off
│
└── assets/
    ├── brand/            Logo SVGs (lockup, wordmark, mark), social card, square logo
    ├── fonts/            Self-hosted Archivo (subset variable font)
    ├── icons/            PNG app icons
    └── images/
        ├── hero/         Home page slideshow (desktop + phone crops)
        ├── services/     One image per service
        ├── portfolio/    Portfolio images (+ thumbs/ for the grids)
        ├── general/      Intro, About, Contact, banners
        └── CREDITS.md    Source and photographer for every placeholder image
```

The two ★ files are the ones you'll edit most often.

---

## 2. Run it on your computer

Any static file server works. From inside the `ingabo-kreatives` folder:

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>. (Alternatively: `npx serve .`, or the "Live Server" extension in VS Code.)

Use a local server rather than double-clicking `index.html`. The pages live in folders so the web addresses have no `.html` at the end (`/services/`, `/portfolio/`, …), and only a server turns a folder address into its `index.html`.

### Clean URLs (no `.html`)

Each page except the home page is an `index.html` inside a folder named after the page, so every host serves it at a clean address such as `https://www.ingabokreative.com/services/` with no rewrite rules. Links inside the site are relative (`../contact/`), so the site also works when it is published in a sub-folder. When you add a page, follow the same pattern: create `new-page/index.html`, prefix its CSS, JS and image paths with `../`, and add it to `sitemap.xml`. `404.html` stays at the root and uses root paths (`/css/…`) because the host shows it at any address.

---

## 3. Put it online

The site is just files, so any host works:

- **Shared hosting / cPanel (e.g. a Rwandan host):** upload the *contents* of this folder into `public_html` using File Manager or FTP. In cPanel's *Error Pages* (or in `.htaccess`, add `ErrorDocument 404 /404.html`), point 404 errors at `404.html`.
- **Netlify:** drag the folder onto <https://app.netlify.com/drop>. `404.html` is picked up automatically.
- **GitHub Pages / Cloudflare Pages / Vercel:** publish the folder as a static site; no build command is needed.

**Before launch, replace the placeholder domain.** Search all files for `https://www.ingabokreative.com` and replace it with your real domain. It appears in:

- every page's `index.html` (`canonical`, `og:url`, `og:image`)
- the structured data blocks in `index.html` and `services/index.html`
- `sitemap.xml` and `robots.txt`

Enable HTTPS on your host (most offer free certificates).

---

## 4. Contact details and WhatsApp: `js/config.js`

Every WhatsApp button, phone number, email link and social icon on the site reads from this one file.

```js
whatsappNumber: "2507XXXXXXXX",   // ← replace
phoneDisplay:   "+250 7XX XXX XXX",
email:          "hello@ingabokreative.com",
```

**WhatsApp number format:** digits only, country code first, no `+`, no spaces, no leading `0`.
A Rwandan number written `0788 123 456` becomes `"250788123456"`.
The site then builds proper click-to-chat links (`https://wa.me/250788123456?text=…`).

**Pre-filled messages:** `whatsappMessages` holds the text each WhatsApp button starts with. Every service has its own message, so a visitor who taps "Ask on WhatsApp" under *Events* starts with an event-specific note.

**Social links:** replace the URLs in `social`. Set any to `""` to hide that icon everywhere.

---

## 5. The contact form

The form has full validation (required fields, email and phone format, no past dates), clear error messages and an accessible error summary.

**What happens on submit depends on one setting in `config.js`:**

| `formEndpoint` | Behaviour |
|---|---|
| `""` (default) | Nothing is silently "sent". The visitor sees their inquiry as a ready-made message with **Send on WhatsApp** and **Send by email** buttons. Their answers are already filled in. |
| A form-service URL | The form is POSTed there (e.g. [Formspree](https://formspree.io), [Basin](https://usebasin.com), [Getform](https://getform.io)). The visitor gets a confirmation and a WhatsApp link for urgent dates. If the service fails, it falls back to the WhatsApp/email hand-off. |

To use Formspree: create a form, copy its endpoint (`https://formspree.io/f/xxxxxx`), paste it into `formEndpoint`. That's all. A hidden spam-trap field is already included.

Links like `contact/?service=weddings` pre-select the service (the *Request a quote* buttons use this).

---

## 6. Replacing the images

All images are **temporary placeholders** from Unsplash (see `assets/images/CREDITS.md`). Replace them with the agency's own work before launch. The site should only show work Ingabo Kreative actually produced.

**The easy way: overwrite files, keeping the same filename.** Nothing else needs to change.

| Where it appears | File(s) | Suggested size |
|---|---|---|
| Home slideshow (desktop) | `hero/hero-01.jpg`, `hero-02.jpg`, `hero-03.jpg` | 2000 px wide, landscape |
| Home slideshow (phones) | `hero/hero-01-portrait.jpg` … `-03-portrait.jpg` | 900 × 1400, portrait crop of the same photo |
| Service images (home + services page) | `services/wedding.jpg`, `events.jpg`, `portrait.jpg`, `commercial.jpg`, `video.jpg`, `content.jpg` | ~1300 px long side |
| Portfolio (lightbox) | `portfolio/*.jpg` | ~1400 px long side |
| Portfolio (grid thumbnails) | `portfolio/thumbs/*.jpg` | exactly 700 px wide |
| Home intro pair | `general/intro-01.jpg`, `intro-02.jpg` | ~900 px |
| About page | `general/about-01.jpg` … `about-04.jpg` | 900–1400 px |
| Services page banner | `general/services-hero.jpg` | 1600 px wide |
| Closing banner (Home/About) | `general/kigali-skyline.jpg` | 1600 px wide |
| Contact page | `general/kigali-aerial.jpg` | 1600 px wide |
| Social-media preview | `hero/hero-01.jpg` | (same file) |

Tips:

- **Export JPEGs at about 70–80 % quality.** Aim for under ~250 KB per image (thumbnails under ~80 KB). Free tools: [Squoosh](https://squoosh.app) or your editor's "Export for web".
- **Portfolio thumbnails:** if you replace `portfolio/wedding-01.jpg`, also replace `portfolio/thumbs/wedding-01.jpg`. If you'd rather not make thumbnails, delete that item's `thumb:` line in `js/data.js`; the grid will then use the full image.
- **If a photo's proportions change** (e.g. portrait → landscape), update its `width`/`height` in `data.js` (portfolio) or in the `<img>` tag (other pages). They only describe the shape, to stop the page jumping while loading. Most frames crop to a fixed shape, so they rarely need touching.
- **Focal point:** some `<img>` tags have `style="object-position: 50% 30%"`. Adjust it if a face gets cropped (first value = left↔right, second = top↔bottom).
- If an image is missing or fails to load, the frame shows a neutral "Image coming soon" instead of a broken icon.

### 6b. Logo and brand files

| File | Use |
|---|---|
| `assets/brand/logo-lockup.svg` | Full logo ("ingabo" + "KREATIVE"): footer |
| `assets/brand/logo-wordmark.svg` | "ingabo" only: header and mobile menu |
| `assets/brand/logo-mark.svg` | The dotted "i": basis of the favicon |
| `assets/brand/og-image.jpg` | 1200 × 630 card shown when the site is shared on WhatsApp, Facebook, LinkedIn |
| `assets/brand/logo-512.png` | Square logo for Google's business information |
| `favicon.svg`, `assets/icons/*.png` | Browser tab and home-screen icons |

The SVG letters use `currentColor`, so one file works on both backgrounds: the site shows it navy on light and white on navy, while the dot always stays brand yellow. The header and footer embed the logo markup inline (in every page), so if the logo artwork changes, replace the `<svg>…</svg>` inside `<a class="logo …">` on each page with the new file's contents (keep `aria-hidden="true"` on the `<svg>`).

---

## 7. Portfolio and testimonials: `js/data.js`

**Add a project:** copy one block in `portfolio: [...]`, then change `title`, `category`, `image`, `thumb`, `width`, `height`, `alt` and `description`.

- `category` must be one of `weddings`, `events`, `portraits`, `commercial`, `lifestyle`, `videography`.
- `featured: true` puts it on the home page. The home mosaic shows the **first 8 featured items**; tiles 1 and 8 are the largest, so put landscape photos there.
- Order in the file = order on the page.
- **Videos:** set `video` to a YouTube link, a Vimeo link or a path to an `.mp4`. The tile gets a "Play film" badge and the lightbox plays it. The image stays as the poster.

**Testimonials** are clearly labelled *"Sample testimonial: replace before launch"*. Replace `quote`, `name` and `context` with real, approved client words and set `placeholder: false` (this removes the label). To hide the section until you have real ones, use `testimonials: []`.

---

## 8. Editing page text

Text lives directly in the HTML files and is plain, readable markup.

The header, mobile menu and footer are repeated in each page (that's what keeps the site framework-free). To change a menu item or footer link, use your editor's **find-and-replace across files** so all six pages stay identical.

Placeholders marked `<!-- EDITABLE: … -->` in `about/index.html` show where to add the founding story and an optional team section, once real details are confirmed.

---

## 9. Design system

Defined once as CSS variables at the top of `css/style.css`:

| Token group | Values |
|---|---|
| **Colour** | Taken from the logo: brand navy `#0A2471` (dark sections, buttons, logo on light) · navy-deep `#061650` (hover) · brand yellow `#FFB90B` (the dot on the i: primary buttons on navy, numbers, details) · ivory `#F7F6F2` (background) · navy-tint `#ECEEF5` (alternate background) · ink `#0E1838` (text) · stone `#5A6075` (secondary text, AA) · `#B4BCDC` (secondary text on navy, AA) · WhatsApp green `#187A42` (AA with white) |
| **Type** | **Archivo** only (variable weight *and* width): wide caps for display headlines, regular weight for editorial statements, normal width for UI and body. One font file keeps pages fast. Fluid scale `--fs-xs` → `--fs-hero`. |
| **Spacing** | 4 px base scale `--s-1` … `--s-10`, fluid `--section-y`, `--gutter`, `--grid-gap` |
| **Layout** | Container 1360 px, 12-column editorial grid on desktop |
| **Radii** | Deliberately minimal: 0 / 2 px / 4 px; pills only for filter chips and round buttons |
| **Motion** | `--ease-out`, durations 160 / 320 / 700 ms; one orchestrated hero entrance; all motion disabled under *reduce motion* |
| **Breakpoints** | mobile-first: 600 · 700 · 900 · 1000 · 1200 px |

Buttons: navy on light backgrounds, yellow on navy. The yellow is never used for text on light backgrounds (it fails contrast there).

Design notes: navy and yellow carry the brand; the photography carries everything else. The one bold move is the wide, film-title-style headline set over the hero image, with a small caption plate naming each frame. Numbering appears only where content is a real sequence (the 4-step process).

---

## 10. Adding Kinyarwanda later

The site is structured for a second language without rework:

1. Copy the pages into a `rw/` folder (`rw/index.html`, `rw/services/index.html`, …) and translate the text. Set `<html lang="rw">`.
2. Link each pair with `<link rel="alternate" hreflang="en" href="…">` / `hreflang="rw"` in both versions.
3. Add a small "EN / RW" link to the header.
4. Translate the WhatsApp messages by giving `rw/` pages their own copy of `config.js` (or add a `whatsappMessagesRw` block).

---

## 11. SEO and local search

Already in place:

- A unique title and meta description per page, aimed at searches like *photographer Kigali*, *wedding photography Rwanda*, *video production Kigali*
- One `h1` per page and a logical heading order; semantic landmarks
- Descriptive `alt` text on every image
- Open Graph and Twitter preview tags; canonical URLs
- `sitemap.xml`, `robots.txt`, favicon and app icons
- Structured data (`ProfessionalService` and a `Service` list), using **only verified facts**: name, Kigali, Rwanda and services. No address, phone, hours or ratings were invented.

After launch:

1. Create or claim a **Google Business Profile** for Ingabo Kreative. It matters more than anything else for local "near me" searches.
2. Submit `sitemap.xml` in **Google Search Console**.
3. Once confirmed, add `telephone`, `email`, `sameAs` (social profile URLs) and, if you have a public studio, `streetAddress` and `openingHours` to the structured data in `index.html`.

---

## 12. Quality checks performed

Tested in Chromium at 320, 375/390, 820, 1440 px:

- **Functional:** 64 automated checks passed, covering navigation, mobile menu (focus trap, Escape, focus return), hero pause/play, back-to-top, every WhatsApp link, portfolio filters and URL state, lightbox (keyboard, buttons, touch swipe, YouTube/Vimeo/MP4 embeds), form validation, WhatsApp/email hand-off, form-service POST, image fallback and reduced motion.
- **Links:** every internal link, image, `srcset`, script and stylesheet on every page (including the 404 page served at a nested address) returns 200, and no link points at a `.html` address.
- **Accessibility:** axe-core reports **0 violations** on every page at mobile and desktop widths (WCAG 2.1 AA rules).
- **Lighthouse (local server):**

  | Page | Performance (desktop / mobile) | Accessibility | Best practices | SEO |
  |---|---|---|---|---|
  | Home | 97 / 81–89 | 100 | 100 | 100 |
  | Services | 99 / 84 | 100 | 100 | 100 |
  | Portfolio | 95 / 76 | 100 | 100 | 100 |
  | About | 98 / 80 | 100 | 100 | 100 |
  | Contact | 100 / 98 | 100 | 100 | 100 |

  Mobile figures re-measured after the move to clean URLs (Home varies between runs). Layout shift (CLS) is 0 on every page, including repeated Portfolio runs. Mobile scores use Lighthouse's throttled slow-4G profile and are photo-weight bound. Following the image guidance in section 6 keeps them there; a CDN or host with HTTP/2 and caching will improve real-world numbers further.
- No horizontal scrolling at 320 px. No JavaScript errors.

---

## 13. Still to replace before launch

| Item | Where |
|---|---|
| WhatsApp number | `js/config.js` → `whatsappNumber` |
| Displayed phone number | `js/config.js` → `phoneDisplay` |
| Email address | `js/config.js` → `email` |
| Social profile URLs | `js/config.js` → `social` |
| Form service (optional) | `js/config.js` → `formEndpoint` |
| Website domain | all HTML pages, `sitemap.xml`, `robots.txt` (search `ingabokreative.com`) |
| All photographs | `assets/images/` (see section 6), then delete `CREDITS.md` |
| Portfolio titles and descriptions | `js/data.js` |
| Testimonials | `js/data.js` (real, approved quotes only) |
| Founding story, team, credentials (optional) | `about/index.html` (`EDITABLE` comments) |
| Service deliverables: confirm each "What you receive" list matches what you actually offer | `services/index.html` |
| Service area wording | `js/config.js` → `serviceArea` |
| Logo master files (optional) | the website logos were traced from the supplied artwork; if the designer has original vector files (AI/SVG/PDF), swap them in (see section 6b) |

---

## 14. Credits

- Placeholder photography: Unsplash contributors, listed in `assets/images/CREDITS.md`.
- Logo: Ingabo Kreative brand artwork, vectorised to SVG for the website.
- Font: [Archivo](https://fonts.google.com/specimen/Archivo), SIL Open Font License, self-hosted.
