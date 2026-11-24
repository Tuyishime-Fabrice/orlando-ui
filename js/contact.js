/* ==========================================================================
   INGABO KREATIVE: Contact / enquiry form
   - Client-side validation with inline and summary messages
   - Sends the enquiry as JSON to FormSubmit (IK_CONFIG.formEndpoint),
     which emails it to IK_CONFIG.email
   - Without JavaScript the form posts to FormSubmit directly
   - contact/?service=weddings pre-selects the service
   ========================================================================== */
(function () {
  "use strict";
  var IK = window.IK;
  var CONFIG = window.IK_CONFIG || {};
  var form = IK.$("[data-contact-form]");
  if (!form) return;

  var summary = IK.$("[data-form-summary]");
  var success = IK.$("[data-form-success]");
  var submitBtn = IK.$("[type=submit]", form);
  var submitLabel = submitBtn.textContent;

  var fields = {
    name: form.elements.name,
    email: form.elements.email,
    phone: form.elements.phone,
    service: form.elements.service,
    date: form.elements.date,
    location: form.elements.location,
    details: form.elements.details
  };

  /* ---- Pre-select service from URL ---------------------------------------- */
  var wanted = new URLSearchParams(window.location.search).get("service");
  if (wanted && fields.service.querySelector('option[value="' + CSS.escape(wanted) + '"]')) {
    fields.service.value = wanted;
  }

  /* Dates can't be in the past */
  var today = new Date();
  var iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  fields.date.min = iso;

  /* ---- Validation rules ------------------------------------------------- */
  var rules = {
    name: function (v) {
      if (!v.trim()) return "Enter your full name.";
      if (v.trim().length < 2) return "Your name needs at least 2 characters.";
      return "";
    },
    email: function (v) {
      if (!v.trim()) return "Enter your email address.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "Enter an email address in the format name@example.com.";
      return "";
    },
    phone: function (v) {
      if (!v.trim()) return "Enter a phone number so we can reach you.";
      if (/[^\d\s()+-]/.test(v)) return "Use only numbers, spaces and +.";
      var digits = v.replace(/\D/g, "");
      if (digits.length < 9 || digits.length > 15) return "Enter a phone number with 9 to 15 digits, for example 0788 123 456.";
      return "";
    },
    service: function (v) { return v ? "" : "Choose the service you're interested in."; },
    date: function (v) {
      if (v && v < iso) return "Choose today's date or a date in the future.";
      return "";
    }
  };

  function errorEl(name) { return document.getElementById(name + "-error"); }

  function validateField(name) {
    var input = fields[name];
    var rule = rules[name];
    if (!rule) return true;
    var msg = rule(input.value);
    var wrap = input.closest(".field");
    wrap.classList.toggle("has-error", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    errorEl(name).textContent = msg;
    return !msg;
  }

  // Validate on blur once touched; re-validate while correcting
  Object.keys(rules).forEach(function (name) {
    var input = fields[name];
    input.addEventListener("blur", function () {
      if (input.value || input.dataset.touched) { input.dataset.touched = "1"; validateField(name); }
    });
    input.addEventListener(input.tagName === "SELECT" ? "change" : "input", function () {
      if (input.closest(".field").classList.contains("has-error")) validateField(name);
    });
  });

  /* ---- What gets sent ------------------------------------------------------ */
  function formatDate(v) {
    if (!v) return "";
    var d = new Date(v + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  function payload() {
    var data = {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      service: fields.service.options[fields.service.selectedIndex].text
    };
    if (fields.date.value) data.date = formatDate(fields.date.value);
    if (fields.location.value.trim()) data.location = fields.location.value.trim();
    if (fields.details.value.trim()) data.details = fields.details.value.trim();
    data._subject = CONFIG.formSubject || "New enquiry";
    data._template = "table";
    data._honey = form.elements._honey ? form.elements._honey.value : "";
    return data;
  }

  /* ---- Outcomes ------------------------------------------------------------- */
  function showSent() {
    form.hidden = true;
    success.hidden = false;
    var heading = IK.$("[data-success-title]", success);
    heading.setAttribute("tabindex", "-1");
    heading.focus();
    success.scrollIntoView({ behavior: IK.reducedMotion.matches ? "auto" : "smooth", block: "start" });
  }

  function showFailed() {
    var phone = CONFIG.phoneDisplay || "";
    var email = CONFIG.email || "";
    summary.hidden = false;
    summary.innerHTML = "<p>Your enquiry did not send. Please WhatsApp us on " +
      '<a href="' + IK.whatsappURL(IK.whatsappMessage("booking")) + '" target="_blank" rel="noopener">' + IK.escapeHTML(phone) + "</a>" +
      ' or email <a href="mailto:' + IK.escapeHTML(email) + '">' + IK.escapeHTML(email) + "</a>.</p>";
    summary.focus();
  }

  /* ---- Submit ------------------------------------------------------------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var invalid = Object.keys(rules).filter(function (name) { return !validateField(name); });

    if (invalid.length) {
      summary.hidden = false;
      summary.innerHTML = "<p><strong>Please check " + (invalid.length === 1 ? "1 field" : invalid.length + " fields") + ":</strong></p><ul>" +
        invalid.map(function (n) {
          return '<li><a href="#' + fields[n].id + '">' + IK.escapeHTML(errorEl(n).textContent) + "</a></li>";
        }).join("") + "</ul>";
      summary.focus();
      return;
    }
    summary.hidden = true;

    // Honeypot: bots fill the hidden field, people don't
    if (form.elements._honey && form.elements._honey.value) { showSent(); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    fetch(CONFIG.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload())
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (body) {
        // FormSubmit answers { success: "true" } once the address is activated
        if (!res.ok || String(body.success) !== "true") throw new Error(body.message || "HTTP " + res.status);
      });
    }).then(showSent, showFailed).then(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    });
  });
})();
