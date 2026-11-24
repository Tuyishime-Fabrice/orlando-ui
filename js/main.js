/* ==========================================================================
   INGABO KREATIVE: Core behaviour
   - Shared helpers (IK namespace)
   - Applies config.js values (WhatsApp, email, phone)
   - Reveal on scroll, back to top, floating WhatsApp button, image fallback
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

  /* Site root, worked out from this script's own URL (js/main.js), so pages
     in sub-folders (/services/, /portfolio/ ...) resolve data.js image paths. */
  var self = document.currentScript;
  IK.root = self && self.src ? new URL("../", self.src).href : "";
  /** Resolve a site-relative path such as "assets/images/x.jpg" */
  IK.asset = function (path) {
    if (!path || /^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(path)) return path;
    return IK.root + path;
  };

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

    // Phone links: <a data-config-tel>
    IK.$$("[data-config-tel]").forEach(function (a) {
      var digits = String(CONFIG.phoneDisplay || "").replace(/\D/g, "");
      if (digits) a.href = "tel:+" + digits;
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

    // Social icons are written into the HTML by scripts/build.js

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

  /* ---- Back to top (footer) + floating WhatsApp button ------------------- */
  function initToTop() {
    IK.$$("[data-to-top]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: IK.reducedMotion.matches ? "auto" : "smooth" });
        var target = IK.$("#main");
        if (target) target.focus({ preventScroll: true });
      });
    });
    // On the home page the header already offers WhatsApp; the floating
    // button appears once the hero has mostly scrolled away.
    var waFab = IK.$(".fab--whatsapp");
    var hero = IK.$("[data-hero]");
    if (!waFab || !hero) return;
    var ticking = false;
    function update() {
      waFab.classList.toggle("is-tucked", window.scrollY < hero.offsetHeight * 0.6);
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

  /* ---- Boot ---------------------------------------------------------------- */
  applyConfig();
  handleBrokenImages();
  initToTop();
  initServiceNav();
  IK.observeReveal(IK.$$(".reveal"));
})();
