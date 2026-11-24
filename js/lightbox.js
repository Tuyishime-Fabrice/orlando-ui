/* ==========================================================================
   INGABO KREATIVE: Lightbox
   IK.Lightbox.open(items, startIndex, triggerElement)
   items: [{ image, alt, title, description, categoryLabel, video }]
   Keyboard: ← / → navigate · Esc closes · Tab stays inside
   Touch: swipe left / right
   Video: YouTube, Vimeo or .mp4 links play inside the lightbox
   ========================================================================== */
(function () {
  "use strict";
  var IK = window.IK;

  var ICONS = {
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  var root, stage, media, titleEl, descEl, countEl, prevBtn, nextBtn, closeBtn;
  var items = [];
  var index = 0;
  var trigger = null;
  var release = null;
  var touchX = null;

  function build() {
    root = document.createElement("div");
    root.className = "lightbox";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "lightbox-title");
    root.hidden = true;
    root.innerHTML =
      '<div class="lightbox__bar">' +
        '<p class="lightbox__count" aria-live="polite"></p>' +
        '<button type="button" class="lightbox__close">' + ICONS.close + "<span>Close</span></button>" +
      "</div>" +
      '<div class="lightbox__stage">' +
        '<div class="lightbox__media"></div>' +
        '<button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="Previous image">' + ICONS.prev + "</button>" +
        '<button type="button" class="lightbox__nav lightbox__nav--next" aria-label="Next image">' + ICONS.next + "</button>" +
      "</div>" +
      '<div class="lightbox__caption">' +
        '<h2 class="lightbox__title" id="lightbox-title"></h2>' +
        '<p class="lightbox__desc"></p>' +
      "</div>";
    document.body.appendChild(root);

    stage = IK.$(".lightbox__stage", root);
    media = IK.$(".lightbox__media", root);
    titleEl = IK.$(".lightbox__title", root);
    descEl = IK.$(".lightbox__desc", root);
    countEl = IK.$(".lightbox__count", root);
    prevBtn = IK.$(".lightbox__nav--prev", root);
    nextBtn = IK.$(".lightbox__nav--next", root);
    closeBtn = IK.$(".lightbox__close", root);

    prevBtn.addEventListener("click", function () { go(-1); });
    nextBtn.addEventListener("click", function () { go(1); });
    closeBtn.addEventListener("click", close);
    root.addEventListener("keydown", onKey);
    // Click on the dark backdrop (not the media) closes
    stage.addEventListener("click", function (e) {
      if (e.target === stage || e.target === media) close();
    });
    stage.addEventListener("touchstart", function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    });
  }

  function videoEmbed(url) {
    var yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) return { type: "iframe", src: "https://www.youtube-nocookie.com/embed/" + yt[1] + "?autoplay=1&rel=0" };
    var vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return { type: "iframe", src: "https://player.vimeo.com/video/" + vm[1] + "?autoplay=1" };
    return { type: "video", src: url };
  }

  function render() {
    var item = items[index];
    media.innerHTML = "";
    media.classList.remove("is-loading");

    if (item.video) {
      var v = videoEmbed(item.video);
      if (v.type === "iframe") {
        var frame = document.createElement("iframe");
        frame.src = v.src;
        frame.title = item.title + " (video)";
        frame.allow = "autoplay; fullscreen; picture-in-picture";
        frame.allowFullscreen = true;
        media.appendChild(frame);
      } else {
        var vid = document.createElement("video");
        vid.src = v.src;
        vid.controls = true;
        vid.playsInline = true;
        vid.poster = item.image;
        vid.setAttribute("aria-label", item.title);
        media.appendChild(vid);
      }
    } else {
      var img = new Image();
      img.alt = item.alt || "";
      img.decoding = "async";
      media.classList.add("is-loading");
      img.onload = function () { media.classList.remove("is-loading"); };
      img.onerror = function () { media.classList.remove("is-loading"); img.classList.add("is-broken"); };
      img.src = item.image;
      media.appendChild(img);
    }

    titleEl.textContent = item.title || "";
    descEl.textContent = [item.categoryLabel, item.description].filter(Boolean).join(". ");
    countEl.textContent = (index + 1) + " / " + items.length;
    var single = items.length < 2;
    prevBtn.hidden = single;
    nextBtn.hidden = single;

    // Warm the cache for neighbours
    [index - 1, index + 1].forEach(function (i) {
      var n = items[(i + items.length) % items.length];
      if (n && !n.video) { var pre = new Image(); pre.src = n.image; }
    });
  }

  function go(step) {
    if (items.length < 2) return;
    index = (index + step + items.length) % items.length;
    render();
  }

  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  }

  function open(list, start, fromEl) {
    if (!root) build();
    items = list;
    index = start || 0;
    trigger = fromEl || document.activeElement;
    render();
    root.hidden = false;
    void root.offsetWidth; // flush styles so the fade-in transition runs
    root.classList.add("is-open"); // visible now, so it can take focus
    IK.lockScroll(true, "lightbox-open");
    release = IK.trapFocus(root);
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (!root || root.hidden) return;
    root.classList.remove("is-open");
    IK.lockScroll(false, "lightbox-open");
    if (release) release();
    media.innerHTML = ""; // stops any playing video
    window.setTimeout(function () { root.hidden = true; }, 330);
    if (trigger && document.contains(trigger)) trigger.focus();
  }

  IK.Lightbox = { open: open, close: close };
})();
