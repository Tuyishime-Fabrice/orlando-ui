/* ==========================================================================
   RE-BANATEX — Interactions
   Vanilla JS, no dependencies. Every feature is progressive: the page is
   complete without JS, and motion is skipped under prefers-reduced-motion.
   ========================================================================== */

/* ---------------------------------------------------------------- Config
   Connect the enquiry form here. Use ONE of:
   - formEndpoint: a URL that accepts a JSON POST (Formspree, Netlify, own API)
   - contactEmail: opens the visitor's mail client with the enquiry filled in */
const CONFIG = {
  formEndpoint: '',
  contactEmail: '',
  fallbackContact: 'Instagram @rebanatex',
};

(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = () => window.matchMedia('(min-width: 961px)').matches;
  if (reduced) document.documentElement.classList.add('reduced');

  /* Batched scroll/resize work on a single rAF loop */
  const onScroll = [];
  let ticking = false;
  const runScroll = () => { ticking = false; onScroll.forEach((fn) => fn()); };
  const requestScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(runScroll); } };
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);

  /* ---------------------------------------------------------------- Nav */
  function initNav() {
    const nav = $('[data-nav]');
    if (!nav) return;
    const darkSections = $$('[data-theme="dark"]');
    const links = $$('.nav__links a');
    const targets = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    let lastY = window.scrollY;

    onScroll.push(() => {
      const y = window.scrollY;
      const navH = nav.offsetHeight;
      nav.classList.toggle('is-scrolled', y > 24);

      // hide on scroll down, reveal on scroll up
      if (!nav.classList.contains('is-menu')) {
        nav.classList.toggle('is-hidden', y > lastY && y > window.innerHeight * 0.6);
      }
      lastY = y;

      // invert over dark sections
      const probe = navH / 2;
      const overDark = darkSections.some((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= probe && r.bottom > probe;
      });
      nav.classList.toggle('is-dark', overDark);

      // current link
      const mid = window.innerHeight * 0.35;
      let current = -1;
      targets.forEach((t, i) => { if (t.getBoundingClientRect().top <= mid) current = i; });
      links.forEach((a, i) => a.classList.toggle('is-current', i === current));
    });
  }

  /* ---------------------------------------------------------------- Mobile menu */
  function initMenu() {
    const toggle = $('[data-menu-toggle]');
    const menu = $('[data-menu]');
    const nav = $('[data-nav]');
    if (!toggle || !menu) return;
    $$('a', menu).forEach((a, i) => a.style.setProperty('--i', i));

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
      nav.classList.toggle('is-menu', open);
      nav.classList.remove('is-hidden');
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.add('is-open'));
        $('a', menu).focus({ preventScroll: true });
      } else {
        menu.classList.remove('is-open');
        const done = () => { if (!menu.classList.contains('is-open')) menu.hidden = true; };
        reduced ? done() : setTimeout(done, 400);
      }
    };

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1081px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------------------------------------------------------------- Reveal on scroll */
  function initReveal() {
    const els = $$('[data-reveal], [data-reveal-lines], [data-reveal-img]');
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    // stagger siblings that reveal together
    els.forEach((el) => {
      if (!el.hasAttribute('data-reveal')) return;
      const sibs = Array.from(el.parentElement.children).filter((c) => c.hasAttribute('data-reveal'));
      const i = sibs.indexOf(el);
      if (i > 0) el.style.setProperty('--delay', `${Math.min(i, 6) * 0.07}s`);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------- Parallax (subtle) */
  function initParallax() {
    if (reduced) return;
    const els = $$('[data-parallax]');
    if (!els.length) return;
    onScroll.push(() => {
      const vh = window.innerHeight;
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const factor = parseFloat(el.dataset.parallax) || 0;
        const offset = (r.top + r.height / 2 - vh / 2) * factor * -1;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    });
  }

  /* ---------------------------------------------------------------- Journey indicator */
  function initChapter() {
    const box = $('[data-chapter]');
    if (!box) return;
    const num = $('[data-chapter-num]', box);
    const name = $('[data-chapter-name]', box);
    const bar = $('[data-chapter-progress]', box);
    const sections = $$('main [data-chapter-num]');
    const footer = $('.footer');
    let currentId = null;

    onScroll.push(() => {
      const mid = window.innerHeight * 0.5;
      let active = sections[0];
      sections.forEach((s) => { if (s.getBoundingClientRect().top <= mid) active = s; });
      if (active !== currentId) {
        currentId = active;
        num.textContent = active.dataset.chapterNum;
        name.textContent = active.dataset.chapterName;
      }
      const r = active.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      bar.style.transform = `scaleY(${p.toFixed(3)})`;
      box.classList.toggle('is-dark', active.dataset.theme === 'dark' || active.classList.contains('closing'));
      const fr = footer.getBoundingClientRect();
      box.style.opacity = fr.top < window.innerHeight ? '0' : '';
    });
  }

  /* ---------------------------------------------------------------- Material swatchbook */
  function initSwatchbook() {
    const book = $('[data-swatchbook]');
    if (!book) return;
    const swatches = $$('[data-swatch]', book);
    const views = $$('[data-swatch-view]', book);
    const tag = $('[data-swatch-tag]', book);

    const activate = (btn) => {
      const key = btn.dataset.swatch;
      swatches.forEach((s) => {
        const on = s === btn;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-pressed', String(on));
      });
      views.forEach((v) => v.classList.toggle('is-active', v.dataset.swatchView === key));
      if (tag) tag.textContent = `${$('.swatch__key', btn).textContent} — ${$('.swatch__name', btn).textContent}`;
    };
    swatches.forEach((s) => {
      s.addEventListener('click', () => activate(s));
      s.addEventListener('focus', () => activate(s));
      s.addEventListener('mouseenter', () => { if (desktop()) activate(s); });
    });
  }

  /* ---------------------------------------------------------------- Process: sticky stage */
  function initProcess() {
    const root = $('[data-process]');
    if (!root) return;
    const steps = $$('[data-step]', root);
    const imgs = $$('[data-step-img]', root);
    const num = $('[data-step-num]', root);
    const bar = $('[data-step-bar]', root);
    let current = 0;

    const setStep = (i) => {
      if (i === current) return;
      imgs.forEach((im) => im.classList.remove('was-active'));
      imgs[current].classList.add('was-active');
      imgs[current].classList.remove('is-active');
      imgs[i].classList.add('is-active');
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      num.textContent = String(i + 1).padStart(2, '0');
      bar.style.transform = `scaleX(${(i + 1) / steps.length})`;
      current = i;
    };

    if (!('IntersectionObserver' in window)) { steps.forEach((s) => s.classList.add('is-active')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setStep(steps.indexOf(en.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => io.observe(s));
  }

  /* ---------------------------------------------------------------- Photo slots
     <img data-fallback="..."> shows a material plate until the real
     photograph exists at its src. */
  const photoCache = new Map();
  function photoExists(src) {
    if (!photoCache.has(src)) {
      photoCache.set(src, new Promise((res) => {
        const im = new Image();
        im.onload = () => res(im.naturalWidth > 0);
        im.onerror = () => res(false);
        im.src = src;
      }));
    }
    return photoCache.get(src);
  }
  function initPhotoSlots() {
    $$('img[data-fallback]').forEach((img) => {
      const fallback = () => {
        if (img.dataset.fellBack) return;
        img.dataset.fellBack = '1';
        img.src = img.dataset.fallback;
        img.closest('.plate')?.classList.add('is-fallback');
      };
      img.addEventListener('error', fallback, { once: true });
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fallback();
    });
  }

  /* ---------------------------------------------------------------- Product index preview */
  function initIndexPreview() {
    const list = $('[data-index]');
    const box = $('[data-index-preview]');
    if (!list || !box || !window.matchMedia('(hover: hover)').matches) return;
    const img = $('img', box);
    let x = 0, y = 0, cx = 0, cy = 0, raf = null, active = false;

    const loop = () => {
      cx += (x - cx) * (reduced ? 1 : 0.16);
      cy += (y - cy) * (reduced ? 1 : 0.16);
      box.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) scale(${active ? 1 : 0.92})`;
      raf = active || Math.abs(x - cx) > 0.5 ? requestAnimationFrame(loop) : null;
    };
    const show = async (row) => {
      const src = (await photoExists(row.dataset.preview)) ? row.dataset.preview : row.dataset.previewFallback;
      if (img.getAttribute('src') !== src) img.src = src;
      img.alt = '';
    };

    list.addEventListener('mousemove', (e) => {
      x = e.clientX + 40; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    $$('.index__row', list).forEach((row) => {
      row.addEventListener('mouseenter', (e) => {
        if (!active) { cx = x = e.clientX + 40; cy = y = e.clientY; }
        active = true; box.classList.add('is-visible'); show(row);
        if (!raf) raf = requestAnimationFrame(loop);
      });
    });
    list.addEventListener('mouseleave', () => { active = false; box.classList.remove('is-visible'); });
  }

  /* ---------------------------------------------------------------- Counters */
  function initCounters() {
    const els = $$('[data-count]');
    if (reduced || !('IntersectionObserver' in window)) return;
    const run = (el) => {
      const end = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const t0 = performance.now();
      const dur = 1400;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - p, 4);
        el.textContent = (end * e).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------- Enquiry routes + form */
  function initForm() {
    const form = $('[data-form]');
    if (!form) return;
    const status = $('[data-form-status]', form);

    // Any [data-route] link pre-selects the matching enquiry type
    $$('[data-route]').forEach((a) => {
      a.addEventListener('click', () => {
        const radio = $(`input[name="route"][value="${a.dataset.route}"]`, form);
        if (radio) radio.checked = true;
      });
    });

    const setStatus = (msg, kind) => {
      status.textContent = msg;
      status.className = `form__status${kind ? ` is-${kind}` : ''}`;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let firstBad = null;
      $$('[required]', form).forEach((f) => {
        const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        f.closest('.field').classList.toggle('is-invalid', bad);
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) {
        setStatus('Please add your name, a valid email and a short description.', 'error');
        firstBad.focus();
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      const routeLabel = $(`input[name="route"][value="${data.route}"] + span`, form)?.textContent || data.route;

      if (CONFIG.formEndpoint) {
        setStatus('Sending…');
        try {
          const res = await fetch(CONFIG.formEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ ...data, route: routeLabel }),
          });
          if (!res.ok) throw new Error(res.statusText);
          form.reset();
          setStatus(`Thank you, ${data.name.split(' ')[0]}. We’ll be in touch.`, 'ok');
        } catch (err) {
          setStatus(`Something went wrong. Please try again, or reach us on ${CONFIG.fallbackContact}.`, 'error');
        }
        return;
      }

      if (CONFIG.contactEmail) {
        const body = [
          `Enquiry: ${routeLabel}`,
          `Name: ${data.name}`,
          `Company: ${data.company || '—'}`,
          `Sector: ${data.sector || '—'}`,
          `Email: ${data.email}`,
          '',
          data.message,
        ].join('\n');
        window.location.href = `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent(`${routeLabel} — ${data.company || data.name}`)}&body=${encodeURIComponent(body)}`;
        setStatus('Your email app should open with the enquiry ready to send.', 'ok');
        return;
      }

      console.warn('[RE-BANATEX] Enquiry form not connected: set CONFIG.formEndpoint or CONFIG.contactEmail in js/main.js');
      setStatus(`Online enquiries are being set up. For now, please reach us on ${CONFIG.fallbackContact}.`, 'error');
    });

    form.addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('is-invalid'));
  }

  /* ---------------------------------------------------------------- Boot */
  initNav();
  initMenu();
  initReveal();
  initParallax();
  initChapter();
  initSwatchbook();
  initProcess();
  initPhotoSlots();
  initIndexPreview();
  initCounters();
  initForm();
  const yr = $('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
  runScroll();
})();
