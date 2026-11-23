/* ==========================================================================
   INGABO KREATIVE — Portfolio grid & filters
   Renders projects from js/data.js into any element with [data-portfolio]:
     data-portfolio="featured"  → only items with featured: true (home)
     data-portfolio="all"       → every item, with category filters
   Filter state is kept in the URL: portfolio/?filter=weddings
   ========================================================================== */
(function () {
  "use strict";
  var IK = window.IK;
  var DATA = window.IK_DATA || { portfolio: [], categories: [] };

  var PLAY_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>';

  var labels = {};
  DATA.categories.forEach(function (c) { labels[c.id] = c.label; });

  // How wide each tile is on screen, so the browser picks thumb vs full image
  var SIZES = {
    masonry: "(min-width: 1200px) 25vw, (min-width: 700px) 33vw, 50vw",
    featuredLarge: "(min-width: 700px) 60vw, 100vw",
    featured: "(min-width: 700px) 34vw, 50vw"
  };

  function imgAttrs(item, sizes) {
    var full = IK.escapeHTML(IK.asset(item.image));
    if (!item.thumb) return 'src="' + full + '"';
    var thumb = IK.escapeHTML(IK.asset(item.thumb));
    return 'src="' + thumb + '" srcset="' + thumb + " 700w, " + full + " " + (item.width || 1400) + 'w" sizes="' + sizes + '"';
  }

  function itemHTML(item, i, eager, sizes) {
    var label = labels[item.category] || item.category;
    var badge = item.video
      ? '<span class="work-item__badge">' + PLAY_ICON + "Play film</span>"
      : "";
    return '<li class="work-item reveal" data-index="' + i + '" data-category="' + IK.escapeHTML(item.category) + '">' +
      '<button type="button" class="work-item__btn" aria-label="' + IK.escapeHTML((item.video ? "Play " : "View ") + item.title + ", " + label) + '">' +
        "<img " + imgAttrs(item, sizes) + ' alt="' + IK.escapeHTML(item.alt) + '"' +
        (item.width ? ' width="' + item.width + '" height="' + item.height + '"' : "") +
        (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">' +
        badge +
        '<span class="work-item__caption"><span class="work-item__title">' + IK.escapeHTML(item.title) + "</span>" +
        '<span class="work-item__meta">' + IK.escapeHTML(label) + "</span></span>" +
      "</button></li>";
  }

  function init(grid) {
    var mode = grid.getAttribute("data-portfolio");
    var source = DATA.portfolio.filter(function (p) { return mode !== "featured" || p.featured; });
    var limit = parseInt(grid.getAttribute("data-limit"), 10);
    if (limit) source = source.slice(0, limit);
    var eagerCount = parseInt(grid.getAttribute("data-eager"), 10) || 0;

    grid.innerHTML = source.map(function (item, i) {
      var sizes = mode === "featured" ? (i === 0 || i === 7 ? SIZES.featuredLarge : SIZES.featured) : SIZES.masonry;
      return itemHTML(item, i, i < eagerCount, sizes);
    }).join("");
    var nodes = IK.$$(".work-item", grid);
    IK.observeReveal(nodes);

    var section = grid.closest("section") || document;
    var filterWrap = IK.$("[data-portfolio-filters]", section);
    var status = IK.$("[data-portfolio-status]", section);
    var active = "all";

    function visibleItems() {
      return source.filter(function (p) { return active === "all" || p.category === active; });
    }

    // Open lightbox with the currently visible set
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest(".work-item__btn");
      if (!btn || !IK.Lightbox) return;
      var item = source[parseInt(btn.parentNode.getAttribute("data-index"), 10)];
      var list = visibleItems().map(function (p) {
        return {
          image: IK.asset(p.image), alt: p.alt, title: p.title, description: p.description,
          categoryLabel: labels[p.category], video: IK.asset(p.video)
        };
      });
      IK.Lightbox.open(list, visibleItems().indexOf(item), btn);
    });

    if (!filterWrap) return;

    // Build filter buttons with counts (only categories that have items)
    var counts = { all: source.length };
    source.forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });
    var cats = [{ id: "all", label: "All work" }].concat(DATA.categories.filter(function (c) { return counts[c.id]; }));
    filterWrap.innerHTML = cats.map(function (c) {
      return '<button type="button" class="filter-btn" data-filter="' + c.id + '" aria-pressed="false">' +
        IK.escapeHTML(c.label) + '<span class="filter-btn__count">' + counts[c.id] + "</span></button>";
    }).join("");

    function apply(id, animate) {
      if (id !== "all" && !counts[id]) id = "all";
      active = id;
      IK.$$(".filter-btn", filterWrap).forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === id));
      });
      var instant = !animate || IK.reducedMotion.matches;
      nodes.forEach(function (node) {
        var show = id === "all" || node.getAttribute("data-category") === id;
        if (instant) { node.hidden = !show; node.classList.remove("is-leaving", "is-entering"); return; }
        if (!show && !node.hidden) {
          node.classList.add("is-leaving");
          window.setTimeout(function () { node.hidden = true; node.classList.remove("is-leaving"); }, 220);
        } else if (show && node.hidden) {
          window.setTimeout(function () {
            node.classList.add("is-entering", "is-visible");
            node.hidden = false;
            window.requestAnimationFrame(function () {
              window.requestAnimationFrame(function () { node.classList.remove("is-entering"); });
            });
          }, 230);
        }
      });
      if (status) {
        var n = counts[id];
        status.textContent = id === "all"
          ? "Showing all " + n + " projects"
          : "Showing " + n + " project" + (n === 1 ? "" : "s") + " in " + labels[id];
      }
      if (window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        if (id === "all") url.searchParams.delete("filter"); else url.searchParams.set("filter", id);
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
    }

    filterWrap.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (btn) apply(btn.getAttribute("data-filter"), true);
    });

    var initial = new URLSearchParams(window.location.search).get("filter") || "all";
    apply(initial, false);
  }

  IK.$$("[data-portfolio]").forEach(init);
})();
