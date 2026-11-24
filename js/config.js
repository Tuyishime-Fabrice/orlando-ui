/* ==========================================================================
   INGABO KREATIVE: SITE CONFIGURATION
   This is the ONE place to update business contact details.
   Every WhatsApp button, phone number, email link and social link on the
   website reads from here. After changing social links, the next Vercel
   deploy (or `node scripts/build.js`) writes them into every page.
   ========================================================================== */
window.IK_CONFIG = {
  businessName: "Ingabo Kreative",
  siteUrl: "https://www.ingabocreative.com",

  /* WhatsApp number in international format, DIGITS ONLY:
     country code (250) + number without the leading 0. */
  whatsappNumber: "250799902322",

  /* How the phone number is displayed on the page. Phone links dial it. */
  phoneDisplay: "+250 799 902 322",

  /* Public email address. Contact form enquiries are delivered here. */
  email: "ingabomedia@gmail.com",

  /* Shown on the contact page and footer. */
  location: "Kigali, Rwanda",
  serviceArea: "Across Rwanda",

  /* The contact form posts here (FormSubmit, delivered to the email above). */
  formEndpoint: "https://formsubmit.co/ajax/ingabomedia@gmail.com",
  formSubject: "New enquiry from ingabocreative.com",

  /* Social profiles: paste the full profile URL, for example
     "https://www.instagram.com/your-handle/". Leave a value empty ("")
     and that icon is not shown anywhere on the site. */
  social: {
    instagram: "",
    facebook: "",
    linkedin: ""
  },

  /* Pre-filled WhatsApp messages. Keys match the service IDs used on
     the site (data-wa-service="..."). */
  whatsappMessages: {
    default: "Hello Ingabo Kreative, I'd like to talk about a project.",
    booking: "Hello Ingabo Kreative, I'd like to book a session. Could you share your availability?",
    weddings: "Hello Ingabo Kreative, I'm planning a wedding/engagement and would like to know more about your photography and film coverage.",
    events: "Hello Ingabo Kreative, I'd like a quote for photo/video coverage of an event.",
    portraits: "Hello Ingabo Kreative, I'd like to book a portrait or lifestyle session.",
    commercial: "Hello Ingabo Kreative, I'm looking for commercial/brand photography for my business.",
    "corporate-video": "Hello Ingabo Kreative, I'd like to discuss a promotional or corporate video.",
    content: "Hello Ingabo Kreative, I'd like to talk about creative content production for our brand."
  }
};
