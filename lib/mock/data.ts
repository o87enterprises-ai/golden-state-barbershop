// Shop domain types, menu, and affiliate catalog for Golden State Barbershop.
// Sample/demo records live in ./demo.ts and are only loaded when SEED_DEMO is on.

import { AMAZON_TAG } from "@/lib/config";

export type Role = "customer" | "barber" | "admin";

export type QueueStatus = "WAITING" | "IN_CHAIR" | "DONE";
export type ChairState = "IDLE" | "IN_SERVICE" | "ALMOST_READY";

export type Barber = { id: string; name: string; initials: string };

export type Service = {
  id: string;
  name: string;
  price: number;
  minutes: number;
  category: "Cuts" | "Beard & Face";
  desc: string;
};

export type ProductCategory =
  | "Pomade & Wax"
  | "Gels & Edge Control"
  | "Sprays"
  | "Oils & Moisturizers"
  | "Beard Care"
  | "Waves & Curls"
  | "Shampoo & Care"
  | "Tools";

// Affiliate catalog entry. No prices or images are stored: Amazon's Associates
// terms require live prices, so each card links out to the current listing.
export type Product = {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  blurb: string;
  query: string; // Amazon search query that surfaces the product
};

export type Appointment = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  serviceId: string;
  barberId: string;
  date: string; // YYYY-MM-DD (shop-local)
  time: string; // "HH:MM" 24h
  status: "Upcoming" | "Completed" | "Cancelled";
  price: number;
};

export type QueueEntry = {
  id: string;
  name: string;
  barberId: string;
  status: QueueStatus;
  estimatedWait: number; // minutes
};

// A physical chair. `barberId` is the barber clocked in at it (null = empty).
// `incognito` chairs are held for private clients: they show as unavailable
// to the public with no barber name attached.
export type Chair = {
  id: string;
  name: string;
  barberId: string | null;
  state: ChairState;
  incognito: boolean;
};

export type TimeEntry = {
  id: string;
  barberId: string;
  chairId: string;
  clockIn: string; // ISO
  clockOut: string | null; // ISO
  incognito: boolean;
};

export type PrivateSession = {
  id: string;
  barberId: string;
  chairId: string;
  client: string; // alias, never shown publicly
  note: string;
  price: number; // custom premium rate set by the barber
  startedAt: string; // ISO
  status: "ACTIVE" | "DONE";
};

export type Sale = {
  id: string;
  at: string; // ISO
  amount: number;
  kind: "booking" | "walk-in" | "private";
  label: string;
  barberId?: string;
  serviceId?: string;
};

export type Message = {
  id: string;
  customerName: string;
  customerEmail?: string;
  preview: string;
  body: string;
  unread: boolean;
  time: string;
};

export type StyleProfile = {
  fadeType: string;
  clipperGuard: string;
  lineup: string;
  beard: string;
  allergies: string;
  conversation: string;
  products: string;
  notes: string;
};

export const emptyStyleProfile: StyleProfile = {
  fadeType: "",
  clipperGuard: "",
  lineup: "",
  beard: "",
  allergies: "",
  conversation: "",
  products: "",
  notes: "",
};

// ---- Menu (owner-approved) ----
export const services: Service[] = [
  { id: "classic", name: "Classic Cut", price: 40, minutes: 45, category: "Cuts", desc: "Precision cut, clean neckline, and style." },
  { id: "classic-beard", name: "Classic Cut with Beard", price: 50, minutes: 60, category: "Cuts", desc: "Your classic cut plus a full beard shape-up." },
  { id: "kids", name: "Kids Haircut", price: 30, minutes: 30, category: "Cuts", desc: "Clean, quick, and comfortable." },
  { id: "senior", name: "Seniors Haircut", price: 30, minutes: 30, category: "Cuts", desc: "Classic grooming at a relaxed pace." },
  { id: "beard-lineup", name: "Beard Trim & Line Up", price: 20, minutes: 30, category: "Beard & Face", desc: "Beard shaped and trimmed with a crisp line up." },
  { id: "lineup-edge", name: "Line Up & Edge", price: 15, minutes: 20, category: "Beard & Face", desc: "Sharp edges and hairline between cuts." },
];

export const serviceCategories: Service["category"][] = ["Cuts", "Beard & Face"];

// ---- Affiliate catalog ----
export const productCategories: ProductCategory[] = [
  "Pomade & Wax",
  "Gels & Edge Control",
  "Sprays",
  "Oils & Moisturizers",
  "Beard Care",
  "Waves & Curls",
  "Shampoo & Care",
  "Tools",
];

export const products: Product[] = [
  // Pomade & wax
  { id: "suavecito", name: "Original Hold Pomade", brand: "Suavecito", category: "Pomade & Wax", blurb: "Medium-shine, firm hold. The classic slick-back.", query: "Suavecito Original Hold Pomade" },
  { id: "murrays", name: "Superior Hair Dressing Pomade", brand: "Murray's", category: "Pomade & Wax", blurb: "Heavy-duty wax pomade for waves, braids, and tight styles.", query: "Murray's Superior Hair Dressing Pomade" },
  { id: "reuzel-blue", name: "Blue Strong Hold Pomade", brand: "Reuzel", category: "Pomade & Wax", blurb: "Water-soluble, high-sheen, washes out clean.", query: "Reuzel Blue Strong Hold Water Soluble Pomade" },
  { id: "american-crew-fiber", name: "Fiber Moldable Paste", brand: "American Crew", category: "Pomade & Wax", blurb: "High hold, low shine for textured, natural looks.", query: "American Crew Fiber Pliable Molding Creme" },
  { id: "gatsby-matte", name: "Moving Rubber Matte Clay", brand: "Gatsby", category: "Pomade & Wax", blurb: "Matte finish with bold texture and volume.", query: "Gatsby Moving Rubber Spiky Edge" },
  { id: "brylcreem", name: "Original Styling Cream", brand: "Brylcreem", category: "Pomade & Wax", blurb: "The old-school shine, light grease, easy comb.", query: "Brylcreem Original Hair Styling Cream" },

  // Gels & edge control
  { id: "eco-olive", name: "Olive Oil Styling Gel", brand: "Eco Styler", category: "Gels & Edge Control", blurb: "Max hold, no flakes. A barbershop staple for waves and twists.", query: "Eco Styler Professional Styling Gel Olive Oil" },
  { id: "got2b-glued", name: "Ultra Glued Invincible Gel", brand: "Got2b", category: "Gels & Edge Control", blurb: "Spike-and-hold power for sharp, lasting styles.", query: "Got2b Ultra Glued Invincible Styling Gel" },
  { id: "lets-jam", name: "Shining & Conditioning Gel", brand: "Let's Jam", category: "Gels & Edge Control", blurb: "Lays edges flat with a smooth, flake-free finish.", query: "Let's Jam Shining and Conditioning Gel" },
  { id: "ampro-prostyl", name: "Pro Styl Super Hold Gel", brand: "Ampro", category: "Gels & Edge Control", blurb: "Super-hold gel that keeps braids and waves locked.", query: "Ampro Pro Styl Super Hold Protein Styling Gel" },

  // Sprays
  { id: "aqua-net", name: "Extra Super Hold Hairspray", brand: "Aqua Net", category: "Sprays", blurb: "Maximum hold that locks a style in place all day.", query: "Aqua Net Professional Hair Spray Extra Super Hold" },
  { id: "surf-spray", name: "Surf Spray", brand: "Bumble and bumble", category: "Sprays", blurb: "Salt-based texture spray for a lived-in, beachy look.", query: "Bumble and bumble Surf Spray" },
  { id: "pink-oil", name: "Pink Oil Moisturizer Lotion", brand: "Luster's", category: "Sprays", blurb: "Classic sheen and moisture for scalp and hair.", query: "Luster's Pink Oil Moisturizer Hair Lotion" },

  // Oils & moisturizers
  { id: "jbco", name: "Jamaican Black Castor Oil", brand: "Tropic Isle Living", category: "Oils & Moisturizers", blurb: "Thick, nourishing oil for scalp, edges, and growth.", query: "Tropic Isle Living Jamaican Black Castor Oil" },
  { id: "blue-magic", name: "Bergamot Hair Conditioner", brand: "Blue Magic", category: "Oils & Moisturizers", blurb: "Old-school grease for moisture and shine on coarse hair.", query: "Blue Magic Bergamot Hair Conditioner" },
  { id: "cantu", name: "Shea Butter Leave-In Cream", brand: "Cantu", category: "Oils & Moisturizers", blurb: "Soft, hydrated curls and coils without the weight.", query: "Cantu Shea Butter Leave-In Conditioning Repair Cream" },

  // Beard care
  { id: "viking-oil", name: "Beard Oil", brand: "Viking Revolution", category: "Beard Care", blurb: "Softens and tames beard hair, relieves itch.", query: "Viking Revolution Beard Oil" },
  { id: "honest-amish", name: "Beard Balm", brand: "Honest Amish", category: "Beard Care", blurb: "Leave-in balm that conditions and holds shape.", query: "Honest Amish Beard Balm Leave-in Conditioner" },
  { id: "beard-brush", name: "Boar Bristle Beard Brush", brand: "Kent", category: "Beard Care", blurb: "Spreads oil, trains the beard, and softens it.", query: "boar bristle beard brush for men" },

  // Waves & curls
  { id: "torino-wave", name: "Pro Medium Wave Brush", brand: "Torino Pro", category: "Waves & Curls", blurb: "Hard-bristle wave brush for 360 waves.", query: "Torino Pro Medium Wave Brush" },
  { id: "durag", name: "Silky Satin Durag", brand: "Assorted", category: "Waves & Curls", blurb: "Protects waves and keeps the style on overnight.", query: "silky satin durag men" },
  { id: "wave-cap", name: "Compression Wave Cap", brand: "Assorted", category: "Waves & Curls", blurb: "Stretch cap that presses waves flat while you sleep.", query: "wave cap compression for men 360 waves" },
  { id: "denman-d3", name: "D3 Classic Styling Brush", brand: "Denman", category: "Waves & Curls", blurb: "Defines curls and coils with even tension.", query: "Denman D3 Classic Styling Brush" },

  // Shampoo & care
  { id: "tea-tree", name: "Special Shampoo", brand: "Paul Mitchell Tea Tree", category: "Shampoo & Care", blurb: "Invigorating cleanse for scalp health.", query: "Paul Mitchell Tea Tree Special Shampoo" },
  { id: "shea-jbco-shampoo", name: "JBCO Strengthen & Restore Shampoo", brand: "SheaMoisture", category: "Shampoo & Care", blurb: "Gentle cleansing for curly and coily textures.", query: "SheaMoisture Jamaican Black Castor Oil Strengthen Grow Restore Shampoo" },
  { id: "nizoral", name: "Anti-Dandruff Shampoo", brand: "Nizoral", category: "Shampoo & Care", blurb: "Clears flakes for a clean canvas.", query: "Nizoral A-D Anti-Dandruff Shampoo" },

  // Tools
  { id: "wahl-magic", name: "Magic Clip Cordless Clipper", brand: "Wahl", category: "Tools", blurb: "The fade clipper in most shops.", query: "Wahl Professional 5 Star Magic Clip Cordless" },
  { id: "andis-master", name: "Master Cordless Clipper", brand: "Andis", category: "Tools", blurb: "Powerful adjustable-blade clipper for fades.", query: "Andis Master Cordless Clipper" },
  { id: "babyliss-fx", name: "FX Skeleton Trimmer", brand: "BaBylissPRO", category: "Tools", blurb: "Zero-gap trimmer for sharp lineups.", query: "BaBylissPRO FX Skeleton Trimmer" },
  { id: "neck-duster", name: "Neck Duster Brush", brand: "Assorted", category: "Tools", blurb: "Soft brush that clears hair off the neck and face.", query: "barber neck duster brush" },
];

export function amazonUrl(p: Product): string {
  const params = new URLSearchParams({ k: p.query });
  if (AMAZON_TAG) params.set("tag", AMAZON_TAG);
  return `https://www.amazon.com/s?${params.toString()}`;
}

// ---- helpers ----
export const serviceById = (id: string) => services.find((s) => s.id === id);
export const fmt = (n: number) => `$${n.toFixed(0)}`;
export const fmtMoney = (n: number) => `$${n.toFixed(2)}`;

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("") || "?";

// Shop-local calendar date as YYYY-MM-DD (not UTC).
export function isoDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(iso: string, n: number): string {
  const d = parseIsoDate(iso);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

export function dayLabel(iso: string): string {
  const today = isoDate();
  if (iso === today) return "Today";
  if (iso === addDays(today, 1)) return "Tomorrow";
  return parseIsoDate(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-3);
