// Golden State Barbershop — brand tokens (derived from the grizzly + barber-pole logo)
export const brand = {
  name: "Golden State Barbershop",
  tagline: "California's sharpest cuts.",

  colors: {
    bear: "#1A1A1A",        // near-black fur
    crimson: "#B01E28",     // barber-pole red / script
    gold: "#C9A24B",        // california gold outline
    bone: "#F5F0E6",        // off-white
    black: "#0A0A0A",
    white: "#FFFFFF",
  },

  // High-end modular + parallax 3D direction (Framer Motion / R3F on the frontend)
  motion: {
    style: "modular-parallax-3d-luxury",
    easing: [0.16, 1, 0.3, 1] as const, // expo-out, premium feel
  },

  contact: {
    // Real data pulled from the Google Business Profile (Oct 2026).
    phone: "(209) 362-9290",
    email: "hello@goldenstatebarbershop.com", // PLACEHOLDER — swap when you have the real one
    street: "1121 Adam St",
    city: "Tracy",
    region: "CA",
    postalCode: "95376",

    // Built from the address so the link always works.
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=Golden%20State%20Barbershop%2C%201121%20Adam%20St%2C%20Tracy%2C%20CA%2095376",

    hours: {
      tue: "10:30-18:30",
      wed: "10:30-18:30",
      thu: "10:30-18:30",
      fri: "10:30-19:30",
      sat: "09:30-15:30",
    },
  },

  social: {
    instagram: "https://www.instagram.com/goldenstatebarbershop/",
    // facebook: "",  // add when you have it
    // tiktok: "",    // add when you have it
  },
} as const;

// Convenience helpers so components don't repeat string logic.
export const fullAddress = `${brand.contact.street}, ${brand.contact.city}, ${brand.contact.region} ${brand.contact.postalCode}`;

export const telHref = `tel:+1${brand.contact.phone.replace(/\D/g, "")}`;

export const mapsHref = brand.contact.directionsUrl;