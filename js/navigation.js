/* ==========================================================================
   INGABO KREATIVE: Header & navigation
   - Transparent header over the home hero turns solid on scroll
   - Header hides while scrolling down, returns when scrolling up
   - Accessible mobile menu (focus trap, Escape to close, scroll lock)
   ========================================================================== */
(function () {
  "use strict";
  var IK = window.IK;
  var header = IK.$("[data-header]");
  if (!header) return;

  /* ---- Solid / hidden states --------------------------------------------- */
  var lastY = window.scrollY;
  var ticking = false;
  var overlay = header.classList.contains("site-header--overlay");

  function update() {
    var y = window.scrollY;
    if (overlay) header.classList.toggle("is-solid", y > 40);
    var goingDown = y > lastY;
    var menuOpen = document.body.classList.contains("menu-open");
    header.classList.toggle("is-hidden", goingDown && y > 480 && !menuOpen && !header.contains(document.activeElement));
    lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  header.addEventListener("focusin", function () { header.classList.remove("is-hidden"); });
  update();

  /* ---- Mobile menu --------------------------------------------------------- */
  var toggle = IK.$("[data-menu-toggle]");
  var menu = IK.$("[data-mobile-menu]");
  if (!toggle || !menu) return;
  var closeBtn = IK.$("[data-menu-close]", menu);
  var release = null;

  function open() {
    menu.hidden = false;
    void menu.offsetWidth; // flush styles so the fade-in transition runs
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    IK.lockScroll(true, "menu-open");
    release = IK.trapFocus(menu);
    var first = IK.$(".mobile-menu__link", menu);
    window.setTimeout(function () { (first || closeBtn).focus(); }, 60);
  }
  function close(returnFocus) {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    IK.lockScroll(false, "menu-open");
    if (release) release();
    window.setTimeout(function () { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 340);
    if (returnFocus !== false) toggle.focus();
  }

  toggle.addEventListener("click", function () {
    if (toggle.getAttribute("aria-expanded") === "true") close(); else open();
  });
  if (closeBtn) closeBtn.addEventListener("click", function () { close(); });
  menu.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  IK.$$("a", menu).forEach(function (a) {
    a.addEventListener("click", function () { close(false); });
  });
  // Close if the viewport grows to desktop while open
  window.matchMedia("(min-width: 1000px)").addEventListener("change", function (mq) {
    if (mq.matches && menu.classList.contains("is-open")) close(false);
  });
})();
