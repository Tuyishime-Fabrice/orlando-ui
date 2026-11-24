#!/usr/bin/env node
/* ==========================================================================
   INGABO KREATIVE: page generator (no dependencies)

   Writes the parts of the HTML that come from js/config.js and js/data.js,
   so every page works without JavaScript and search engines see the same
   content as visitors:

     build:socials  footer social icons (every page)
     build:follow   "Follow our work" block (contact page)
     build:schema   business structured data (home page)
     build:team     team cards (team page)
     build:robots   noindex on the team page while the team list is empty
     sitemap.xml    every public page

   Vercel runs it on each deploy (see vercel.json). To run it yourself:
     node scripts/build.js
   Only the text between the <!-- build:... --> markers is replaced.
   ========================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

function load(file) {
  const sandbox = { window: {} };
  vm.runInNewContext(read(file), sandbox, { filename: file });
  return sandbox.window;
}
const CONFIG = load("js/config.js").IK_CONFIG;
const DATA = load("js/data.js").IK_DATA;
const SITE = CONFIG.siteUrl.replace(/\/$/, "");
const TEAM = (DATA.team || []).filter((p) => p && p.name && p.name.trim());

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const isUrl = (u) => /^https:\/\/[^\s"]+\.[^\s"]+\/[^\s"]+/.test(u || ""); // a profile, not a home page

/* ---- Social icons (same 24px viewBox and style as the other icons) ------- */
const SOCIAL = [
  ["instagram", "Instagram", '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/></svg>'],
  ["facebook", "Facebook", '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.86.25-1.45 1.48-1.45h1.57V4.47A20.6 20.6 0 0 0 14.27 4.3c-2.27 0-3.82 1.39-3.82 3.93v2.27H8v3h2.45V21h3.05Z"/></svg>'],
  ["linkedin", "LinkedIn", '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6.94 20H3.56V9h3.38v11ZM5.25 7.5a1.96 1.96 0 1 1 0-3.92 1.96 1.96 0 0 1 0 3.92ZM20.44 20h-3.37v-5.35c0-1.28-.02-2.92-1.78-2.92-1.78 0-2.05 1.39-2.05 2.83V20H9.87V9h3.24v1.5h.04c.45-.85 1.55-1.75 3.19-1.75 3.41 0 4.04 2.25 4.04 5.17V20Z"/></svg>']
];
const profiles = SOCIAL.filter(([key]) => isUrl((CONFIG.social || {})[key]));
const ignored = SOCIAL.filter(([key]) => (CONFIG.social || {})[key] && !isUrl(CONFIG.social[key]));
ignored.forEach(([, label]) => console.warn(`! ${label}: not a full profile URL, icon left out`));

function socialList() {
  if (!profiles.length) return [];
  return ['<ul class="socials" role="list">']
    .concat(profiles.map(([key, label, icon]) =>
      `  <li><a class="icon-btn" href="${esc(CONFIG.social[key])}" target="_blank" rel="noopener" aria-label="Ingabo Kreative on ${label} (opens in a new tab)">${icon}</a></li>`))
    .concat(["</ul>"]);
}
function followBlock() {
  const list = socialList();
  if (!list.length) return [];
  return ["<div>", '  <p class="caption" style="margin-bottom: var(--s-2)">Follow our work</p>']
    .concat(list.map((l) => "  " + l)).concat(["</div>"]);
}

/* ---- Structured data ------------------------------------------------------ */
function schema() {
  const business = {
    "@type": "ProfessionalService",
    "@id": SITE + "/#business",
    name: CONFIG.businessName,
    description: "Photography and video studio in Kigali, Rwanda, offering wedding, event, portrait, commercial and brand photography, and promotional and corporate video production across Rwanda.",
    url: SITE + "/",
    image: SITE + "/assets/brand/og-image.jpg",
    logo: SITE + "/assets/brand/logo-512.png",
    telephone: "+" + CONFIG.phoneDisplay.replace(/\D/g, ""),
    email: CONFIG.email,
    address: { "@type": "PostalAddress", addressLocality: "Kigali", addressCountry: "RW" },
    areaServed: { "@type": "Country", name: "Rwanda" },
    knowsAbout: ["Wedding photography", "Event photography", "Videography", "Portrait photography", "Commercial photography", "Corporate video production"]
  };
  if (profiles.length) business.sameAs = profiles.map(([key]) => CONFIG.social[key]);
  if (TEAM.length) {
    business.employee = TEAM.map((p) => {
      const person = { "@type": "Person", name: p.name.trim() };
      if (p.role) person.jobTitle = p.role;
      if (p.photo) person.image = SITE + "/" + p.photo.replace(/^\//, "");
      if (isUrl(p.linkedin)) person.sameAs = [p.linkedin];
      return person;
    });
  }
  const graph = {
    "@context": "https://schema.org",
    "@graph": [business, { "@type": "WebSite", "@id": SITE + "/#website", url: SITE + "/", name: CONFIG.businessName, inLanguage: "en" }]
  };
  return ['<script type="application/ld+json">']
    .concat(JSON.stringify(graph, null, 2).replace(/</g, "\\u003c").split("\n"))
    .concat(["</script>"]);
}

/* ---- Team cards ------------------------------------------------------------ */
function initials(name) {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
function teamSection() {
  if (!TEAM.length) return [];
  const cards = TEAM.map((p) => {
    const name = esc(p.name.trim());
    const media = p.photo
      ? `<div class="frame ratio-4-5"><img src="../${esc(p.photo.replace(/^\//, ""))}" alt="Portrait of ${name}" width="900" height="1125" loading="lazy" decoding="async"></div>`
      : `<div class="frame ratio-4-5 team-card__initials" aria-hidden="true"><span>${esc(initials(p.name))}</span></div>`;
    const lines = [
      '      <li class="team-card">',
      "        " + media,
      `        <h2 class="team-card__name">${name}</h2>`
    ];
    if (p.role) lines.push(`        <p class="team-card__role">${esc(p.role)}</p>`);
    if (p.bio) lines.push(`        <p class="muted">${esc(p.bio)}</p>`);
    if (isUrl(p.linkedin)) lines.push(`        <a class="link-line" href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn<span class="visually-hidden">: ${name} (opens in a new tab)</span></a>`);
    lines.push("      </li>");
    return lines.join("\n");
  });
  return ['<section class="section section--flush-top" aria-label="Team members">', '  <div class="container">',
    '    <ul class="team-grid" role="list">'].concat(cards.join("\n").split("\n")).concat(["    </ul>", "  </div>", "</section>"]);
}

/* ---- Region replacement ----------------------------------------------------- */
function fill(html, name, lines) {
  const re = new RegExp(`( *)(<!-- build:${name}\\b[^>]*-->)\\n[\\s\\S]*?\\1<!-- /build:${name} -->`, "g");
  return html.replace(re, (m, indent, open) =>
    [indent + open].concat(lines.map((l) => (l ? indent + l : l))).concat([indent + `<!-- /build:${name} -->`]).join("\n"));
}

const PAGES = [
  ["index.html", "/"], ["services/index.html", "/services/"], ["portfolio/index.html", "/portfolio/"],
  ["about/index.html", "/about/"], ["team/index.html", "/team/"], ["contact/index.html", "/contact/"], ["404.html", null]
];
let changed = 0;
for (const [file] of PAGES) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) continue;
  const before = fs.readFileSync(full, "utf8");
  let html = before;
  html = fill(html, "socials", socialList());
  html = fill(html, "follow", followBlock());
  html = fill(html, "schema", schema());
  html = fill(html, "team", teamSection());
  html = fill(html, "robots", TEAM.length ? [] : ['<meta name="robots" content="noindex">']);
  if (html !== before) { fs.writeFileSync(full, html); changed++; console.log("updated", file); }
}

/* ---- Sitemap (keeps each page's existing lastmod; new pages get today) ---- */
const smPath = path.join(ROOT, "sitemap.xml");
const old = fs.existsSync(smPath) ? fs.readFileSync(smPath, "utf8") : "";
const lastmod = {};
old.replace(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g, (m, loc, d) => { lastmod[loc] = d; });
const today = new Date().toISOString().slice(0, 10);
const urls = PAGES.filter(([file, url]) => url && fs.existsSync(path.join(ROOT, file)) && !(url === "/team/" && !TEAM.length))
  .map(([, url]) => {
    const loc = SITE + url;
    return `  <url><loc>${loc}</loc><lastmod>${lastmod[loc] || today}</lastmod><priority>${url === "/" ? "1.0" : "0.8"}</priority></url>`;
  });
const sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls).concat(["</urlset>", ""]).join("\n");
if (sitemap !== old) { fs.writeFileSync(smPath, sitemap); changed++; console.log("updated sitemap.xml"); }

console.log(`build: ${TEAM.length} team member(s), ${profiles.length} social profile(s), ${changed} file(s) updated`);
