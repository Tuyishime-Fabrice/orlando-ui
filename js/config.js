/* ==========================================================================
   INGABO KREATIVES — SITE CONFIGURATION
   This is the ONE place to update business contact details.
   Every WhatsApp button, phone number, email link and social link on the
   website reads from here.
   ========================================================================== */
window.IK_CONFIG = {
  businessName: "Ingabo Kreatives",

  /* WhatsApp number in international format, DIGITS ONLY:
     country code (250) + number without the leading 0.
     Example: 0788 123 456  ->  "250788123456"
     PLACEHOLDER — replace before launch. */
  whatsappNumber: "2507XXXXXXXX",

  /* How the phone number is displayed on the page. PLACEHOLDER. */
  phoneDisplay: "+250 7XX XXX XXX",

  /* Public email address. PLACEHOLDER — replace before launch. */
  email: "hello@ingabokreatives.com",

  /* Shown on the contact page and footer. */
  location: "Kigali, Rwanda",
  serviceArea: "Available across Rwanda and for travel on request",

  /* Optional: a form-handling service URL (e.g. Formspree, Basin, Getform).
     Leave empty ("") and the contact form will hand the inquiry over to
     WhatsApp or email instead of pretending to send it. */
  formEndpoint: "",

  /* Social profiles. Replace with the agency's real profile URLs.
     Set any value to "" to hide that icon everywhere. */
  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    tiktok: "https://www.tiktok.com/",
    youtube: "https://www.youtube.com/"
  },

  /* Pre-filled WhatsApp messages. Keys match the service IDs used on
     the site (data-wa-service="..."). */
  whatsappMessages: {
    default: "Hello Ingabo Kreatives, I'd like to talk about a project.",
    booking: "Hello Ingabo Kreatives, I'd like to book a session. Could you share your availability?",
    weddings: "Hello Ingabo Kreatives, I'm planning a wedding/engagement and would like to know more about your photography and film coverage.",
    events: "Hello Ingabo Kreatives, I'd like a quote for photo/video coverage of an event.",
    portraits: "Hello Ingabo Kreatives, I'd like to book a portrait or lifestyle session.",
    commercial: "Hello Ingabo Kreatives, I'm looking for commercial/brand photography for my business.",
    "corporate-video": "Hello Ingabo Kreatives, I'd like to discuss a promotional or corporate video.",
    content: "Hello Ingabo Kreatives, I'd like to talk about creative content production for our brand."
  }
};
