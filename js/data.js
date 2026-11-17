/* ==========================================================================
   INGABO KREATIVE — CONTENT DATA
   Edit portfolio projects and testimonials here. No other file needs to
   change when you add, remove or reorder projects.
   ========================================================================== */
window.IK_DATA = {
  /* Portfolio filter categories, in display order.
     `id` is used in URLs: portfolio.html?filter=weddings */
  categories: [
    { id: "weddings", label: "Weddings" },
    { id: "events", label: "Events" },
    { id: "portraits", label: "Portraits" },
    { id: "commercial", label: "Commercial" },
    { id: "lifestyle", label: "Lifestyle" },
    { id: "videography", label: "Videography" }
  ],

  /* PORTFOLIO PROJECTS
     ---------------------------------------------------------------
     title        Short project title shown on hover and in the lightbox
     category     One of the category ids above
     image        Full-size image, shown in the lightbox
                  (keep images in assets/images/portfolio/)
     thumb        Optional smaller copy (about 700px wide) used in the grids
                  so pages load fast. If you don't make one, delete this
                  line and the grid will use the full-size image instead.
     width/height The image's pixel size (prevents layout shift)
     alt          Describe what is in the photo, for screen readers & SEO
     description  One line shown in the lightbox
     featured     true = also shown in "Selected work" on the home page.
                  The home page shows the first 8 featured items in a fixed
                  editorial layout: tiles 1 and 8 are the largest, so put
                  landscape images there.
     video        Optional. A YouTube or Vimeo link, or a path to an .mp4
                  file. When set, the item opens as a playable film.

     All images below are TEMPORARY PLACEHOLDERS from Unsplash.
     Replace them with real Ingabo Kreative projects before launch. */
  portfolio: [
    {
      title: "Leaving as one",
      category: "weddings",
      image: "assets/images/portfolio/wedding-01.jpg",
      thumb: "assets/images/portfolio/thumbs/wedding-01.jpg", width: 1400, height: 927,
      alt: "Bride and groom walking hand in hand as guests cheer outside a brick chapel",
      description: "Ceremony exit, photographed as it happened.",
      featured: true, video: ""
    },
    {
      title: "Gold hour",
      category: "portraits",
      image: "assets/images/portfolio/portrait-01.jpg",
      thumb: "assets/images/portfolio/thumbs/portrait-01.jpg", width: 1050, height: 1400,
      alt: "Studio portrait of a woman with gold hoop earrings against a deep brown backdrop",
      description: "Beauty portrait with sculpted studio light.",
      featured: true, video: ""
    },
    {
      title: "Fireworks over Kigali",
      category: "events",
      image: "assets/images/portfolio/event-01.jpg",
      thumb: "assets/images/portfolio/thumbs/event-01.jpg", width: 1400, height: 1400,
      alt: "Fireworks bursting over the illuminated dome of the Kigali Convention Centre at night",
      description: "City celebration, captured from across the venue.",
      featured: true, video: ""
    },
    {
      title: "Matching prints",
      category: "lifestyle",
      image: "assets/images/portfolio/lifestyle-01.jpg",
      thumb: "assets/images/portfolio/thumbs/lifestyle-01.jpg", width: 960, height: 1400,
      alt: "Smiling couple in matching purple and yellow African print outfits",
      description: "Couple session styled around a shared fabric.",
      featured: true, video: ""
    },
    {
      title: "Behind the lens",
      category: "videography",
      image: "assets/images/portfolio/video-01.jpg",
      thumb: "assets/images/portfolio/thumbs/video-01.jpg", width: 1400, height: 933,
      alt: "Silhouette of a videographer holding a cinema camera against a cool backlight",
      description: "Lighting and camera work for a music performance film.",
      featured: true, video: ""
    },
    {
      title: "Garden vows",
      category: "weddings",
      image: "assets/images/portfolio/wedding-02.jpg",
      thumb: "assets/images/portfolio/thumbs/wedding-02.jpg", width: 934, height: 1400,
      alt: "Groom kissing his bride beneath red flowers in a green garden",
      description: "Portraits between the ceremony and reception.",
      featured: true, video: ""
    },
    {
      title: "Tailored",
      category: "commercial",
      image: "assets/images/portfolio/commercial-01.jpg",
      thumb: "assets/images/portfolio/thumbs/commercial-01.jpg", width: 1120, height: 1400,
      alt: "Man in a corduroy coat, patterned tie and sunglasses posing in a narrow street",
      description: "Menswear lookbook shot on location.",
      featured: true, video: ""
    },
    {
      title: "Market colour",
      category: "commercial",
      image: "assets/images/portfolio/commercial-03.jpg",
      thumb: "assets/images/portfolio/thumbs/commercial-03.jpg", width: 1400, height: 933,
      alt: "Stacks of brightly patterned wax print fabrics folded for sale",
      description: "Product and detail photography for a textile seller.",
      featured: true, video: ""
    },
    {
      title: "Traditional attire",
      category: "weddings",
      image: "assets/images/portfolio/wedding-03.jpg",
      thumb: "assets/images/portfolio/thumbs/wedding-03.jpg", width: 1400, height: 1388,
      alt: "Couple in gold traditional wedding attire with headwraps and coral beads, smiling at each other",
      description: "Traditional ceremony portraits.",
      featured: false, video: ""
    },
    {
      title: "Unposed",
      category: "portraits",
      image: "assets/images/portfolio/portrait-02.jpg",
      thumb: "assets/images/portfolio/thumbs/portrait-02.jpg", width: 933, height: 1400,
      alt: "Woman in a yellow and red headwrap laughing toward the camera",
      description: "Personal portrait session outdoors.",
      featured: false, video: ""
    },
    {
      title: "Hands up",
      category: "events",
      image: "assets/images/portfolio/event-02.jpg",
      thumb: "assets/images/portfolio/thumbs/event-02.jpg", width: 1400, height: 933,
      alt: "Audience raising their hands toward a speaker on stage",
      description: "Conference keynote and audience coverage.",
      featured: false, video: ""
    },
    {
      title: "In monochrome",
      category: "lifestyle",
      image: "assets/images/portfolio/lifestyle-03.jpg",
      thumb: "assets/images/portfolio/thumbs/lifestyle-03.jpg", width: 1167, height: 1400,
      alt: "Black and white portrait of a couple leaning close together",
      description: "Engagement portraits in black and white.",
      featured: false, video: ""
    },
    {
      title: "Rig check",
      category: "videography",
      image: "assets/images/portfolio/video-02.jpg",
      thumb: "assets/images/portfolio/thumbs/video-02.jpg", width: 1400, height: 787,
      alt: "Camera operator adjusting a cinema camera rig before a take",
      description: "On set for a brand film.",
      featured: false, video: ""
    },
    {
      title: "The ring",
      category: "weddings",
      image: "assets/images/portfolio/wedding-04.jpg",
      thumb: "assets/images/portfolio/thumbs/wedding-04.jpg", width: 933, height: 1400,
      alt: "Close-up of a hand holding another hand showing an engagement ring",
      description: "Engagement detail.",
      featured: false, video: ""
    },
    {
      title: "Set for the evening",
      category: "events",
      image: "assets/images/portfolio/event-03.jpg",
      thumb: "assets/images/portfolio/thumbs/event-03.jpg", width: 1050, height: 1400,
      alt: "Long dinner table lined with wine glasses under an outdoor canopy",
      description: "Venue and décor details before guests arrive.",
      featured: false, video: ""
    },
    {
      title: "Low key",
      category: "portraits",
      image: "assets/images/portfolio/portrait-03.jpg",
      thumb: "assets/images/portfolio/thumbs/portrait-03.jpg", width: 933, height: 1400,
      alt: "Man in a maroon t-shirt photographed against a dark background",
      description: "Studio portrait with a single light.",
      featured: false, video: ""
    },
    {
      title: "Red and rattan",
      category: "commercial",
      image: "assets/images/portfolio/commercial-02.jpg",
      thumb: "assets/images/portfolio/thumbs/commercial-02.jpg", width: 933, height: 1400,
      alt: "Woman in a red hat and patterned top holding a woven rattan bag",
      description: "Accessories campaign image.",
      featured: false, video: ""
    },
    {
      title: "Family on shoulders",
      category: "lifestyle",
      image: "assets/images/portfolio/lifestyle-02.jpg",
      thumb: "assets/images/portfolio/thumbs/lifestyle-02.jpg", width: 934, height: 1400,
      alt: "Family of three stacked playfully, a child on her father's shoulders, on a lawn",
      description: "Relaxed family session outdoors.",
      featured: false, video: ""
    },
    {
      title: "Crew at first light",
      category: "videography",
      image: "assets/images/portfolio/video-03.jpg",
      thumb: "assets/images/portfolio/thumbs/video-03.jpg", width: 1400, height: 594,
      alt: "Silhouetted film crew gathered around a camera on a tripod at dawn",
      description: "Location shoot for a short film.",
      featured: false, video: ""
    },
    {
      title: "Before the guests",
      category: "weddings",
      image: "assets/images/portfolio/wedding-05.jpg",
      thumb: "assets/images/portfolio/thumbs/wedding-05.jpg", width: 1007, height: 1400,
      alt: "Outdoor wedding ceremony setup with white chairs and a floral gazebo",
      description: "Ceremony styling and venue details.",
      featured: false, video: ""
    },
    {
      title: "Pattern and frame",
      category: "portraits",
      image: "assets/images/portfolio/portrait-04.jpg",
      thumb: "assets/images/portfolio/thumbs/portrait-04.jpg", width: 933, height: 1400,
      alt: "Close portrait of a woman wearing clear glasses and a beaded headwrap",
      description: "Editorial portrait.",
      featured: false, video: ""
    },
    {
      title: "Founder portrait",
      category: "commercial",
      image: "assets/images/portfolio/commercial-04.jpg",
      thumb: "assets/images/portfolio/thumbs/commercial-04.jpg", width: 1120, height: 1400,
      alt: "Smiling businesswoman in a yellow blazer holding a tablet",
      description: "Brand portraits for a business website.",
      featured: false, video: ""
    },
    {
      title: "Arrivals",
      category: "events",
      image: "assets/images/portfolio/event-04.jpg",
      thumb: "assets/images/portfolio/thumbs/event-04.jpg", width: 1400, height: 788,
      alt: "Guests in smart clothes queuing outside a venue, some holding umbrellas",
      description: "Event arrivals and candid moments.",
      featured: false, video: ""
    },
    {
      title: "Night walk",
      category: "lifestyle",
      image: "assets/images/portfolio/lifestyle-04.jpg",
      thumb: "assets/images/portfolio/thumbs/lifestyle-04.jpg", width: 934, height: 1400,
      alt: "Two women in colourful dresses walking down a lit street at night",
      description: "Street lifestyle after dark.",
      featured: false, video: ""
    },
    {
      title: "Open field",
      category: "lifestyle",
      image: "assets/images/portfolio/lifestyle-05.jpg",
      thumb: "assets/images/portfolio/thumbs/lifestyle-05.jpg", width: 933, height: 1400,
      alt: "Woman in a patterned dress raising crossed arms in a golden field under storm clouds",
      description: "Fashion and lifestyle on location.",
      featured: false, video: ""
    },
    {
      title: "After dark",
      category: "weddings",
      image: "assets/images/portfolio/wedding-06.jpg",
      thumb: "assets/images/portfolio/thumbs/wedding-06.jpg", width: 1400, height: 788,
      alt: "Wedding guests in suits and gowns dancing outdoors at night",
      description: "Reception and dance floor coverage.",
      featured: false, video: ""
    },
    {
      title: "Studio setup",
      category: "videography",
      image: "assets/images/portfolio/video-04.jpg",
      thumb: "assets/images/portfolio/thumbs/video-04.jpg", width: 1400, height: 933,
      alt: "Cinema camera on a rig in a studio corridor lit with coloured lights",
      description: "Interview film setup.",
      featured: false, video: ""
    }
  ],

  /* TESTIMONIALS
     These are clearly marked PLACEHOLDERS. Replace `quote`, `name` and
     `context` with real, approved client words and set placeholder: false.
     Remove all entries (testimonials: []) to hide the section entirely. */
  testimonials: [
    {
      quote: "A short quote from a couple you photographed: how the day felt, and what it was like to see the photos for the first time.",
      name: "Client name",
      context: "Wedding client",
      placeholder: true
    },
    {
      quote: "A line from an event organiser about how the team worked on the day and how quickly the images arrived.",
      name: "Client name",
      context: "Event client",
      placeholder: true
    },
    {
      quote: "A sentence from a business or brand about what the photos and films did for them.",
      name: "Client name",
      context: "Brand client",
      placeholder: true
    }
  ]
};
