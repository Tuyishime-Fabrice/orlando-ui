# Ingabo Kreative: website

A fast, static website for **Ingabo Kreative**, a photography and video studio in Kigali, Rwanda, live at <https://www.ingabocreative.com>.
Plain HTML, CSS and JavaScript: no framework, no database. One small Node script with no dependencies (`scripts/build.js`) writes the team cards, social icons, structured data and sitemap from the two settings files; Vercel runs it on every deploy.

---

## 1. What's in the box

```text
ingabo-kreatives/
├── index.html            Home                       → /
├── services/index.html   Services (6 detailed services, "Get a quote") → /services/
├── portfolio/index.html  Portfolio (filters + lightbox) → /portfolio/
├── about/index.html      About                      → /about/
├── team/index.html       Our team                   → /team/
├── contact/index.html    Contact & enquiry form     → /contact/
├── 404.html              "Page not found" page
├── favicon.svg           Browser-tab icon (IK monogram)
├── site.webmanifest      App/bookmark metadata
├── robots.txt            Search-engine rules
├── sitemap.xml           Page list for search engines (written by scripts/build.js)
├── vercel.json           Clean URLs, redirects and the build command for Vercel
├── scripts/build.js      Writes team cards, social icons, schema and sitemap
│
├── css/
│   ├── style.css         Design tokens, base styles, layout, page sections
│   └── components.css    Buttons, navigation, cards, grids, lightbox, forms, footer
│
├── js/
│   ├── config.js         ★ Contact details, WhatsApp number, form address, socials
│   ├── data.js           ★ Portfolio projects and team members
│   ├── main.js           Shared helpers, contact links, reveal, back to top
│   ├── navigation.js     Header behaviour and mobile menu
│   ├── portfolio.js      Portfolio grids and category filters
│   ├── lightbox.js       Full-screen image/video viewer
│   └── contact.js        Form validation and sending (FormSubmit)
│
└── assets/
    ├── brand/            Logo SVGs (lockup, wordmark, mark), social card, square logo
    ├── fonts/            Self-hosted Archivo (subset variable font)
    ├── icons/            PNG app icons
    └── images/
        ├── hero/         Home page hero image (desktop + phone crop)
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

Each page except the home page is an `index.html` inside a folder named after the page, so every host serves it at a clean address such as `https://www.ingabocreative.com/services/` with no rewrite rules. Links inside the site are relative (`../contact/`), so the site also works when it is published in a sub-folder. When you add a page, follow the same pattern: create `new-page/index.html`, prefix its CSS, JS and image paths with `../`, and add it to the `PAGES` list in `scripts/build.js` so it goes into `sitemap.xml`. `404.html` stays at the root and uses root paths (`/css/…`) because the host shows it at any address.

---

## 3. Put it online

The site is just files, so any host works:

- **Shared hosting / cPanel (e.g. a Rwandan host):** upload the *contents* of this folder into `public_html` using File Manager or FTP. In cPanel's *Error Pages* (or in `.htaccess`, add `ErrorDocument 404 /404.html`), point 404 errors at `404.html`.
- **Netlify:** drag the folder onto <https://app.netlify.com/drop>. `404.html` is picked up automatically.
- **Vercel (current host):** the project deploys from the `main` branch of the GitHub repository. `vercel.json` sets the build command to `node scripts/build.js` (no install step, no dependencies), redirects `/services` to `/services/` (the address in the canonical tags and sitemap), redirects any old `.html` address to its clean URL, and serves `404.html` for missing pages. The domain `ingabocreative.com` redirects to `www.ingabocreative.com`, which is the address used everywhere on the site.
- **GitHub Pages / Cloudflare Pages:** publish the folder as a static site; no build command is needed.

**Domain:** every canonical tag, social preview tag, structured data block, `sitemap.xml` and `robots.txt` use `https://www.ingabocreative.com`. If the domain ever changes, update `siteUrl` in `js/config.js` and search all files for `ingabocreative.com`.

Enable HTTPS on your host (most offer free certificates).

---

## 4. Contact details and WhatsApp: `js/config.js`

Every WhatsApp button, phone number and email link on the site uses these values. They are also written into the HTML, so links work before JavaScript loads.

```js
whatsappNumber: "250799902322",
phoneDisplay:   "+250 799 902 322",
email:          "ingabomedia@gmail.com",
```

**WhatsApp number format:** digits only, country code first, no `+`, no spaces, no leading `0`. Every WhatsApp button opens `https://wa.me/250799902322` directly in WhatsApp.

**Pre-filled messages:** `whatsappMessages` holds the text each WhatsApp button starts with. Every service has its own message, so a visitor who taps "WhatsApp us" under *Events* starts with an event-specific note.

**Social links:** paste the full profile address for `instagram`, `facebook` and `linkedin` in `social`, for example `"https://www.instagram.com/your-handle/"`. An empty value (`""`) hides that icon everywhere. A bare platform address such as `https://www.facebook.com/` is ignored on purpose, so no icon ever points to a platform's home page. The next deploy puts the icons in the footer of every page and in "Follow our work" on the Contact page, and adds the profiles to the structured data (`sameAs`).

If you change a phone number or email, also replace the old value in the HTML files (search all files for it), because the pages carry it as plain text for visitors without JavaScript and for search engines.

---

## 5. The contact form

The form has full validation (required fields, email and phone format, no past dates), clear error messages and an accessible error summary.

**Sending:** the form posts the enquiry as JSON to [FormSubmit](https://formsubmit.co) (`formEndpoint` in `js/config.js`), which emails it to **ingabomedia@gmail.com** with the subject *"New enquiry from ingabocreative.com"* (`formSubject`). There is no account or API key.

- While sending, the button shows *Sending...* and is disabled.
- On success the form is replaced by *"Thank you. Your enquiry has been sent and we will reply by WhatsApp or email."* with an optional **WhatsApp us** button.
- On failure the visitor sees *"Your enquiry did not send. Please WhatsApp us on +250 799 902 322 or email ingabomedia@gmail.com."* and keeps their answers.
- A hidden spam-trap field (`_honey`) is included. Without JavaScript the form posts straight to FormSubmit.

**One-time activation:** the first enquiry makes FormSubmit send an *Activate Form* email to ingabomedia@gmail.com. Until someone clicks that link, enquiries are not delivered (the visitor sees the failure message above, which tells them to use WhatsApp or email instead). After activation, every enquiry arrives by email.

Links like `contact/?service=weddings` pre-select the service (the *Get a quote* buttons under each service use this).

---

## 6. Replacing the images

All images are **temporary placeholders** from Unsplash (see `assets/images/CREDITS.md`). Replace them with the agency's own work before launch. The site should only show work Ingabo Kreative actually produced.

**The easy way: overwrite files, keeping the same filename.** Nothing else needs to change.

| Where it appears | File(s) | Suggested size |
|---|---|---|
| Home hero (desktop) | `hero/hero-01.jpg` | 2000 px wide, landscape |
| Home hero (phones) | `hero/hero-01-portrait.jpg` | 900 × 1400, portrait crop of the same photo |
| Team portraits | `team/first-last.jpg` (new folder), listed in `js/data.js` | 900 × 1125, 4:5 portrait |
| Service images (home + services page) | `services/wedding.jpg`, `events.jpg`, `portrait.jpg`, `commercial.jpg`, `video.jpg`, `content.jpg` | ~1300 px long side |
| Portfolio (lightbox) | `portfolio/*.jpg` | ~1400 px long side |
| Portfolio (grid thumbnails) | `portfolio/thumbs/*.jpg` | exactly 700 px wide |
| Home intro pair | `general/intro-01.jpg`, `intro-02.jpg` | ~900 px |
| About page | `general/about-01.jpg` … `about-04.jpg` | 900 to 1400 px |
| Services page banner | `general/services-hero.jpg` | 1600 px wide |
| Closing banner (Home/About) | `general/kigali-skyline.jpg` | 1600 px wide |
| Contact page | `general/kigali-aerial.jpg` | 1600 px wide |
| Social-media preview | `hero/hero-01.jpg` | (same file) |

Tips:

- **Export JPEGs at about 70 to 80 % quality.** Aim for under ~250 KB per image (thumbnails under ~80 KB). Free tools: [Squoosh](https://squoosh.app) or your editor's "Export for web".
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

## 7. Portfolio and team: `js/data.js`

**Add a project:** copy one block in `portfolio: [...]`, then change `title`, `category`, `image`, `thumb`, `width`, `height`, `alt` and `description`.

- `category` must be one of `weddings`, `events`, `portraits`, `commercial`, `lifestyle`, `videography` (shown as *Behind the scenes*) or `documentary`.
- A filter button only appears when its category has at least one project, so *Documentary* shows up by itself once the first documentary is added. `portfolio/?filter=documentary` links straight to it.
- `featured: true` puts it on the home page. The home mosaic shows the **first 8 featured items**; tiles 1 and 8 are the largest, so put landscape photos there.
- Order in the file = order on the page.
- **Films:** set `video` to a YouTube or Vimeo link (or a path to an `.mp4`). The tile gets a small play mark and the lightbox plays the film in an embedded player (YouTube uses the privacy-friendly youtube-nocookie.com player). Closing the lightbox stops playback. `image` is the poster. The counter above the grid then says "photos and films".
- Once real films are added under `videography`, change that category's label in `categories` from "Behind the scenes" back to "Films".

**Team:** add one entry per person to `team: [...]` (name, role, and optionally photo, one-sentence bio and LinkedIn URL; the format is described in the file). The next deploy writes the cards into `team/index.html`: 3 per row on desktop, 2 on tablets, 1 on phones. A person without a photo gets a tile with their initials. While the list is empty, the Team page shows no cards, is left out of `sitemap.xml` and asks search engines not to index it; adding the first person reverses all three.

**Run the generator yourself** (optional; Vercel does it on every deploy): `node scripts/build.js`. It only rewrites the text between `<!-- build:... -->` markers, plus `sitemap.xml`.

---

## 8. Editing page text

Text lives directly in the HTML files and is plain, readable markup.

The header, mobile menu and footer are repeated in each page (that's what keeps the site framework-free). To change a menu item or footer link, use your editor's **find-and-replace across files** so all six pages stay identical.

The comment marked `<!-- EDITABLE: … -->` in `about/index.html` shows where a founding story could go once real details are confirmed. Team members belong in `js/data.js` (section 7), not in the HTML.

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
- Structured data (`ProfessionalService` with phone, email and, once added, social profiles and team members; plus a `Service` list), using **only verified facts**. No street address, hours or ratings were invented.

After launch:

1. Create or claim a **Google Business Profile** for Ingabo Kreative. It matters more than anything else for local "near me" searches.
2. In **Google Search Console**, add the property `https://www.ingabocreative.com` (or the whole `ingabocreative.com` domain), verify it, then submit `https://www.ingabocreative.com/sitemap.xml` under *Sitemaps*. Do the same in **Bing Webmaster Tools** (it can import from Search Console).
3. If you open a public studio, add `streetAddress` and `openingHours` to the schema in `scripts/build.js`.

---

## 12. Quality checks performed

Tested in Chromium at 320, 375/390, 768, 1000 and 1440 px:

- **Functional:** 97 automated checks passed, covering: WhatsApp, phone and email links on every page with JavaScript switched off; the static hero (one image downloaded); navigation including Team (active state in both menus); footer back to top and the floating WhatsApp button; portfolio filters, counts and URL state, including a documentary film opened with the keyboard and stopped on close; the Team page; contact form validation, the JSON sent to FormSubmit, *Sending...*, success and failure messages; reduced motion; the 404 page.
- **Generator:** `scripts/build.js` was run on a copy of the site with sample team members and profile URLs to check the cards (3 + 2, 2, 1 columns, initials tiles), icons, schema, sitemap and noindex, then on the real files (running it twice changes nothing).
- **Links:** every internal link, image, `srcset`, script and stylesheet on every page returns 200; no link points at `#` or a `.html` address.
- **Accessibility:** axe-core reports **0 violations** on every page at mobile and desktop widths (WCAG 2.1 AA rules), including the Team page with sample members.
- **Lighthouse (local server):**

  | Page | Performance (desktop / mobile) | Accessibility | Best practices | SEO |
  |---|---|---|---|---|
  | Home | 99 / 89 | 100 | 100 | 100 |
  | Services | 99 / 82 | 100 | 100 | 100 |
  | Portfolio | 96 / 76 | 100 | 100 | 100 |
  | About | 99 / 83 | 100 | 100 | 100 |
  | Team | 100 / 98 | 100 | 100 | 69 while empty (noindex on purpose) |
  | Contact | 100 / 98 | 100 | 100 | 100 |

  Layout shift (CLS) is 0 on every page. Mobile scores use Lighthouse's throttled slow-4G profile and are photo-weight bound; real-world numbers on Vercel's CDN are better.
- No horizontal scrolling at 320 px.

---

## 13. Still to add

| Item | Where |
|---|---|
| Instagram, Facebook and LinkedIn profile URLs | `js/config.js` → `social` |
| Team members (5 people) | `js/data.js` → `team`, photos in `assets/images/team/` |
| Documentary projects and film links | `js/data.js` → `portfolio` (category `documentary`, `video` link) |
| Real client testimonials (the section was removed until there are some) | ask for them to be added back to the home page |
| FormSubmit activation | click *Activate Form* in the first email FormSubmit sends to ingabomedia@gmail.com |
| All photographs | `assets/images/` (see section 6), then delete `CREDITS.md` |
| Portfolio titles and descriptions | `js/data.js` |
| Service deliverables: confirm each "What you receive" list matches what you actually offer | `services/index.html` |
| Logo master files (optional) | the website logos were traced from the supplied artwork; if the designer has original vector files (AI/SVG/PDF), swap them in (see section 6b) |

---

## 14. Credits

- Placeholder photography: Unsplash contributors, listed in `assets/images/CREDITS.md`.
- Logo: Ingabo Kreative brand artwork, vectorised to SVG for the website.
- Font: [Archivo](https://fonts.google.com/specimen/Archivo), SIL Open Font License, self-hosted.
