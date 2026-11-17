/* ==========================================================================
   INGABO KREATIVE — Core behaviour
   - Shared helpers (IK namespace)
   - Applies config.js values (WhatsApp, email, phone, socials)
   - Hero slideshow · reveal on scroll · back-to-top · image fallback
   - Services page sub-navigation highlight
   ========================================================================== */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.remove("no-js");
  doc.classList.add("js");

  var CONFIG = window.IK_CONFIG || {};
  var IK = (window.IK = window.IK || {});

  IK.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---- Helpers ---------------------------------------------------------- */
  IK.$ = function (sel, root) { return (root || document).querySelector(sel); };
  IK.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  IK.escapeHTML = function (str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  /** Build a WhatsApp click-to-chat URL (https://wa.me/<digits>?text=...) */
  IK.whatsappURL = function (message) {
    var number = String(CONFIG.whatsappNumber || "").replace(/\D/g, "");
    var base = "https://wa.me/" + number;
    return message ? base + "?text=" + encodeURIComponent(message) : base;
  };

  IK.whatsappMessage = function (key) {
    var msgs = CONFIG.whatsappMessages || {};
    return msgs[key] || msgs["default"] || "";
  };

  /** Keep keyboard focus inside `container` while it is open. Returns a release fn. */
  IK.trapFocus = function (container) {
    var selector = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, iframe, video[controls], [tabindex]:not([tabindex="-1"])';
    function onKey(e) {
      if (e.key !== "Tab") return;
      var nodes = IK.$$(selector, container).filter(function (n) {
        return n.offsetParent !== null || n === document.activeElement;
      });
      if (!nodes.length) return;
      var first = nodes[0];
      var last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    container.addEventListener("keydown", onKey);
    return function release() { container.removeEventListener("keydown", onKey); };
  };

  IK.lockScroll = function (on, reason) {
    document.body.classList.toggle("is-locked", on);
    if (reason) document.body.classList.toggle(reason, on);
  };

  /* ---- Apply configuration ---------------------------------------------- */
  function applyConfig() {
    // WhatsApp links: <a data-wa data-wa-service="weddings">
    IK.$$("[data-wa]").forEach(function (a) {
      var key = a.getAttribute("data-wa-service") || "default";
      var custom = a.getAttribute("data-wa-message");
      a.href = IK.whatsappURL(custom || IK.whatsappMessage(key));
      a.target = "_blank";
      a.rel = "noopener";
    });

    // Text values: <span data-config-text="phoneDisplay">
    IK.$$("[data-config-text]").forEach(function (el) {
      var val = CONFIG[el.getAttribute("data-config-text")];
      if (val) el.textContent = val;
    });

    // Email links
    IK.$$("[data-config-email]").forEach(function (a) {
      if (!CONFIG.email) return;
      a.href = "mailto:" + CONFIG.email;
      if (!a.hasAttribute("data-keep-text")) a.textContent = CONFIG.email;
    });

    // Social links: <a data-social="instagram">; hidden when empty
    var social = CONFIG.social || {};
    IK.$$("[data-social]").forEach(function (a) {
      var url = social[a.getAttribute("data-social")];
      var wrapper = a.closest("li") || a;
      if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; wrapper.hidden = false; }
      else { wrapper.hidden = true; }
    });

    IK.$$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---- Image fallback ---------------------------------------------------- */
  function handleBrokenImages() {
    function mark(img) {
      img.classList.add("is-broken");
      if (!img.getAttribute("alt")) img.setAttribute("alt", "");
    }
    document.addEventListener("error", function (e) {
      var t = e.target;
      if (t && t.tagName === "IMG") mark(t);
    }, true);
    // Images that failed before this script ran
    IK.$$("img").forEach(function (img) {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) mark(img);
    });
  }

  /* ---- Hero slideshow ---------------------------------------------------- */
  function initHero() {
    var hero = IK.$("[data-hero]");
    if (!hero) return;
    var slides = IK.$$(".hero__slide", hero);
    var caption = IK.$("[data-hero-caption]", hero);
    var count = IK.$("[data-hero-count]", hero);
    var toggle = IK.$("[data-hero-toggle]", hero);
    if (slides.length < 2) { if (toggle) toggle.hidden = true; return; }

    var index = 0;
    var timer = null;
    var DELAY = 6500;
    var playing = !IK.reducedMotion.matches;

    function pad(n) { return (n < 10 ? "0" : "") + n; }

    function show(i) {
      var next = slides[i];
      loadSlide(next);
      slides[index].classList.remove("is-active");
      slides[index].setAttribute("aria-hidden", "true");
      next.classList.add("is-active");
      next.removeAttribute("aria-hidden");
      index = i;
      if (caption) caption.textContent = next.getAttribute("data-caption") || "";
      if (count) count.textContent = pad(i + 1) + " / " + pad(slides.length);
    }
    // Later slides carry data-src/data-srcset until they are first needed
    function loadSlide(slide) {
      var img = IK.$("img", slide);
      if (!img || !img.dataset.src) return;
      IK.$$("source[data-srcset]", slide).forEach(function (src) {
        src.srcset = src.dataset.srcset;
        src.removeAttribute("data-srcset");
      });
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    }
    function preloadNext() { loadSlide(slides[(index + 1) % slides.length]); }
    function tick() { show((index + 1) % slides.length); preloadNext(); }
    function start() { stop(); timer = window.setInterval(tick, DELAY); }
    function stop() { if (timer) window.clearInterval(timer); timer = null; }
    function setPlaying(p) {
      playing = p;
      if (toggle) {
        toggle.setAttribute("aria-pressed", String(!p));
        toggle.setAttribute("aria-label", p ? "Pause slideshow" : "Play slideshow");
        toggle.classList.toggle("is-paused", !p);
      }
      if (p) start(); else stop();
    }

    if (toggle) toggle.addEventListener("click", function () { setPlaying(!playing); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else if (playing) start();
    });

    // Load the second slide once the page has settled, then begin
    window.addEventListener("load", function () { preloadNext(); });
    setPlaying(playing);
  }

  /* ---- Reveal on scroll (image groups only) ------------------------------ */
  IK.observeReveal = function (nodes) {
    if (!("IntersectionObserver" in window) || IK.reducedMotion.matches) {
      nodes.forEach(function (n) { n.classList.add("is-visible"); });
      return;
    }
    if (!IK._revealObserver) {
      IK._revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            IK._revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    }
    nodes.forEach(function (n) { IK._revealObserver.observe(n); });
  };

  /* ---- Back to top -------------------------------------------------------- */
  function initToTop() {
    var fab = IK.$("[data-fab-top]");
    function goTop(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: IK.reducedMotion.matches ? "auto" : "smooth" });
      var target = IK.$("#main");
      if (target) target.focus({ preventScroll: true });
    }
    IK.$$("[data-to-top]").forEach(function (b) { b.addEventListener("click", goTop); });
    var waFab = IK.$(".fab--whatsapp");
    var hero = IK.$("[data-hero]");
    if (!fab) return;
    var ticking = false;
    function update() {
      fab.classList.toggle("is-visible", window.scrollY > window.innerHeight * 1.2);
      // On the home page the header already offers WhatsApp; the floating
      // button appears once the hero has mostly scrolled away.
      if (waFab && hero) waFab.classList.toggle("is-tucked", window.scrollY < hero.offsetHeight * 0.6);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---- Services page: highlight current service in sub-nav ---------------- */
  function initServiceNav() {
    var nav = IK.$("[data-service-nav]");
    if (!nav || !("IntersectionObserver" in window)) return;
    var links = IK.$$("a", nav);
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-current"); a.removeAttribute("aria-current"); });
        var link = map[entry.target.id];
        if (link) {
          link.classList.add("is-current");
          link.setAttribute("aria-current", "true");
          link.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ---- Testimonials (rendered from data.js) ------------------------------- */
  function initTestimonials() {
    var wrap = IK.$("[data-testimonials]");
    if (!wrap) return;
    var section = wrap.closest("section");
    var list = (window.IK_DATA && window.IK_DATA.testimonials) || [];
    if (!list.length) { if (section) section.hidden = true; return; }
    wrap.innerHTML = list.map(function (t) {
      return '<figure class="testimonial">' +
        (t.placeholder ? '<span class="editable-note">Sample testimonial: replace before launch</span>' : "") +
        "<blockquote><p>" + IK.escapeHTML(t.quote) + "</p></blockquote>" +
        "<figcaption><strong>" + IK.escapeHTML(t.name) + "</strong>" +
        '<span class="muted">' + IK.escapeHTML(t.context) + "</span></figcaption></figure>";
    }).join("");
  }

  /* ---- Boot ---------------------------------------------------------------- */
  applyConfig();
  handleBrokenImages();
  initHero();
  initToTop();
  initServiceNav();
  initTestimonials();
  IK.observeReveal(IK.$$(".reveal"));
})();
