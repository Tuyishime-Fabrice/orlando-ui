/* ==========================================================================
   INGABO KREATIVES — Contact / booking form
   - Client-side validation with inline and summary messages
   - If IK_CONFIG.formEndpoint is set, the form is POSTed there.
   - If not, nothing is "sent" silently: the visitor gets a ready-made
     WhatsApp message (and an email alternative) built from their answers.
   - contact.html?service=weddings pre-selects the service.
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

  /* Button label says exactly what will happen */
  if (CONFIG.formEndpoint) {
    var label = IK.$("[data-submit-label]", form);
    var note = IK.$("[data-form-note]", form);
    if (label) label.textContent = "Send inquiry";
    if (note) note.textContent = "We only use your details to reply to your inquiry.";
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

  /* ---- Message builder --------------------------------------------------- */
  function formatDate(v) {
    if (!v) return "";
    var d = new Date(v + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  function buildMessage() {
    var serviceText = fields.service.options[fields.service.selectedIndex].text;
    var lines = [
      "Hello " + (CONFIG.businessName || "Ingabo Kreatives") + ", I'd like to make an inquiry.",
      "",
      "Name: " + fields.name.value.trim(),
      "Email: " + fields.email.value.trim(),
      "Phone: " + fields.phone.value.trim(),
      "Service: " + serviceText
    ];
    if (fields.date.value) lines.push("Date: " + formatDate(fields.date.value));
    if (fields.location.value.trim()) lines.push("Location: " + fields.location.value.trim());
    if (fields.details.value.trim()) lines.push("", "Project details:", fields.details.value.trim());
    return lines.join("\n");
  }

  /* ---- Success states ------------------------------------------------------ */
  function showHandOff(message, note) {
    var serviceText = fields.service.options[fields.service.selectedIndex].text;
    IK.$("[data-success-title]", success).textContent = "Your inquiry is ready to send";
    IK.$("[data-success-text]", success).textContent = note ||
      "Send it on WhatsApp for the quickest reply, or by email. Your answers are already filled in: just press send.";
    IK.$("[data-success-preview]", success).textContent = message;
    IK.$("[data-success-preview]", success).hidden = false;
    var wa = IK.$("[data-success-whatsapp]", success);
    wa.href = IK.whatsappURL(message);
    wa.hidden = false;
    var mail = IK.$("[data-success-email]", success);
    mail.href = "mailto:" + (CONFIG.email || "") +
      "?subject=" + encodeURIComponent("Inquiry: " + serviceText + " — " + fields.name.value.trim()) +
      "&body=" + encodeURIComponent(message);
    mail.hidden = !CONFIG.email;
    reveal();
  }

  function showSent(message) {
    IK.$("[data-success-title]", success).textContent = "Thank you, " + fields.name.value.trim().split(" ")[0] + ". We've received your inquiry.";
    IK.$("[data-success-text]", success).textContent =
      "We'll reply by email or phone soon. If your date is close, message us on WhatsApp as well.";
    IK.$("[data-success-preview]", success).hidden = true;
    IK.$("[data-success-whatsapp]", success).href = IK.whatsappURL(message);
    IK.$("[data-success-email]", success).hidden = true;
    reveal();
  }

  function reveal() {
    form.hidden = true;
    success.hidden = false;
    var heading = IK.$("[data-success-title]", success);
    heading.setAttribute("tabindex", "-1");
    heading.focus();
    success.scrollIntoView({ behavior: IK.reducedMotion.matches ? "auto" : "smooth", block: "start" });
  }

  IK.$("[data-success-edit]", success).addEventListener("click", function () {
    success.hidden = true;
    form.hidden = false;
    fields.name.focus();
  });

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

    // Honeypot: bots fill hidden fields, people don't
    if (form.elements.company && form.elements.company.value) return;

    var message = buildMessage();

    if (!CONFIG.formEndpoint) { showHandOff(message); return; }

    submitBtn.disabled = true;
    var original = submitBtn.textContent;
    submitBtn.textContent = "Sending…";
    fetch(CONFIG.formEndpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      showSent(message);
    }).catch(function () {
      showHandOff(message, "We couldn't send the form just now. Your inquiry is ready below: send it on WhatsApp or by email instead.");
    }).then(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    });
  });
})();
