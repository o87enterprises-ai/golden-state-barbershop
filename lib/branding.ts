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
    // fill in for SEO/schema/NAP consistency
    phone: "",
    street: "",
    city: "",
    region: "CA",
    postalCode: "",
    hours: {
      tue: "10:30-18:30",
      wed: "10:30-18:30",
      thu: "10:30-18:30",
      fri: "10:30-19:30",
      sat: "09:30-15:30",
    },
  },
} as const;
