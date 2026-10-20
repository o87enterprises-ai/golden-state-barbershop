import { brand } from "./branding";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://goldenstatebarbershop.com";

// LocalBusiness/BarberShop JSON-LD — the single biggest lever for Google Maps,
// rich results, AND AI answer engines (ChatGPT/Perplexity/AI Overviews cite it).
export function barberShopJsonLd() {
  const c = brand.contact;
  return {
    "@context": "https://schema.org",
    "@type": "BarberShop",
    name: brand.name,
    description: brand.tagline,
    url: site,
    image: `${site}/logo.png`,
    telephone: c.phone || undefined,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: c.street || undefined,
      addressLocality: c.city || undefined,
      addressRegion: c.region,
      postalCode: c.postalCode || undefined,
      addressCountry: "US",
    },
    openingHoursSpecification: Object.entries(c.hours).map(([day, range]) => {
      const [opens, closes] = range.split("-");
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: { tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday" }[day],
        opens,
        closes,
      };
    }),
  };
}

// FAQPage JSON-LD — AEO: feeds Google's "People also ask" + direct AI answers.
export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

// Starter FAQ set — edit freely. Short, factual answers = most AI-citable.
export const FAQS = [
  { q: "Do I need an appointment at Golden State Barbershop?", a: "Walk-ins are welcome, but booking online guarantees your slot and your preferred barber." },
  { q: "What payment methods do you accept?", a: "We accept Apple Pay, Google Pay, and all major credit and debit cards. You can pay online when booking or in-shop by tapping your phone." },
  { q: "What are your hours?", a: "Tuesday–Thursday 10:30am–6:30pm, Friday 10:30am–7:30pm, Saturday 9:30am–3:30pm. Closed Sunday and Monday." },
  { q: "How much is a haircut?", a: "See live pricing on our booking page; most services run in the $25–$45 range." },
];
