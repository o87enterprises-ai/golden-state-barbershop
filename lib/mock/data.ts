// Client-side mock data layer for the Golden State Barbershop prototype.
// Everything here is seed/demo data — no backend, no real bookings or charges.

export type Role = "public" | "customer" | "admin";

export type QueueStatus = "WAITING" | "IN_CHAIR" | "DONE";
export type ChairState = "IDLE" | "IN_SERVICE" | "ALMOST_READY";

export type Barber = { id: string; name: string; initials: string };

export type Service = {
  id: string;
  name: string;
  price: number;
  minutes: number;
  category: "Cuts" | "Beard & Face" | "Signature";
  desc: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  tag: string;
  blurb: string;
};

export type Appointment = {
  id: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  barberId: string;
  day: "Today" | "Tomorrow" | "This Week";
  time: string; // "10:30"
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

export type Chair = {
  barberId: string;
  state: ChairState;
};

export type Message = {
  id: string;
  customerName: string;
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

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  lastVisit: string;
};

export const barbers: Barber[] = [
  { id: "marcus", name: "Marcus", initials: "M" },
  { id: "deon", name: "Deon", initials: "D" },
  { id: "tony", name: "Tony", initials: "T" },
];

export const services: Service[] = [
  { id: "classic", name: "Classic Cut", price: 35, minutes: 45, category: "Cuts", desc: "Precision scissor cut, wash, and style." },
  { id: "fade", name: "Skin Fade", price: 40, minutes: 60, category: "Cuts", desc: "Zero to skin fade with detailed lineup." },
  { id: "kids", name: "Kids Cut", price: 25, minutes: 30, category: "Cuts", desc: "Clean, quick, and comfortable." },
  { id: "beard", name: "Beard Trim", price: 25, minutes: 30, category: "Beard & Face", desc: "Sculpting, razor outline, and hot towel." },
  { id: "shave", name: "Hot Towel Shave", price: 35, minutes: 45, category: "Beard & Face", desc: "Traditional straight-razor shave." },
  { id: "lineup", name: "Line-up / Edge", price: 15, minutes: 20, category: "Beard & Face", desc: "Crisp edges between cuts." },
  { id: "full", name: "The Full Service", price: 60, minutes: 90, category: "Signature", desc: "Haircut, beard trim, hot towel, and facial." },
];

export const products: Product[] = [
  { id: "pomade", name: "Signature Pomade", price: 22, tag: "Strong Hold", blurb: "High-shine, all-day hold. Water-based." },
  { id: "clay", name: "Matte Clay", price: 24, tag: "Matte", blurb: "Texture and volume with zero shine." },
  { id: "salt", name: "Sea Salt Spray", price: 18, tag: "Texture", blurb: "Effortless, lived-in texture." },
  { id: "beard-oil", name: "Golden Beard Oil", price: 20, tag: "Conditioning", blurb: "Softens and tames. Cedar + citrus." },
  { id: "brush", name: "Boar Bristle Brush", price: 28, tag: "Tool", blurb: "Distributes oils, tames flyaways." },
  { id: "comb", name: "Carbon Comb", price: 12, tag: "Tool", blurb: "Anti-static, heat resistant." },
  { id: "shampoo", name: "Daily Shampoo", price: 19, tag: "Care", blurb: "Gentle cleanse, no stripping." },
  { id: "kit", name: "The Golden Kit", price: 75, tag: "Bundle", blurb: "Pomade, oil, brush & comb. Save 15%." },
];

export const customers: Customer[] = [
  { id: "c1", name: "James Rivera", email: "james@example.com", phone: "(209) 555-0112", visits: 14, lastVisit: "6 days ago" },
  { id: "c2", name: "Andre Collins", email: "andre@example.com", phone: "(209) 555-0137", visits: 7, lastVisit: "2 weeks ago" },
  { id: "c3", name: "Mike Tran", email: "mike@example.com", phone: "(209) 555-0190", visits: 22, lastVisit: "3 days ago" },
  { id: "c4", name: "Sofia Reyes", email: "sofia@example.com", phone: "(209) 555-0145", visits: 4, lastVisit: "yesterday" },
];

// The signed-in demo customer.
export const ME: Customer = {
  id: "me",
  name: "Alex Morgan",
  email: "alex@example.com",
  phone: "(209) 555-0100",
  visits: 9,
  lastVisit: "3 weeks ago",
};

export const seedAppointments: Appointment[] = [
  { id: "a1", customerId: "me", customerName: ME.name, serviceId: "fade", barberId: "marcus", day: "Tomorrow", time: "14:15", status: "Upcoming", price: 40 },
  { id: "a2", customerId: "me", customerName: ME.name, serviceId: "classic", barberId: "deon", day: "This Week", time: "11:00", status: "Completed", price: 35 },
  { id: "a3", customerId: "me", customerName: ME.name, serviceId: "full", barberId: "tony", day: "This Week", time: "16:30", status: "Completed", price: 60 },
  { id: "a4", customerId: "c1", customerName: "James Rivera", serviceId: "fade", barberId: "marcus", day: "Today", time: "10:30", status: "Upcoming", price: 40 },
  { id: "a5", customerId: "c3", customerName: "Mike Tran", serviceId: "beard", barberId: "deon", day: "Today", time: "12:00", status: "Upcoming", price: 25 },
  { id: "a6", customerId: "c4", customerName: "Sofia Reyes", serviceId: "classic", barberId: "tony", day: "Today", time: "13:30", status: "Upcoming", price: 35 },
  { id: "a7", customerId: "c2", customerName: "Andre Collins", serviceId: "full", barberId: "marcus", day: "Today", time: "15:00", status: "Upcoming", price: 60 },
  // Fuller day so the admin schedule overview looks real
  { id: "a8", customerId: "w1", customerName: "Chris Daniels", serviceId: "classic", barberId: "deon", day: "Today", time: "11:15", status: "Upcoming", price: 35 },
  { id: "a9", customerId: "w2", customerName: "Leo Park", serviceId: "fade", barberId: "tony", day: "Today", time: "11:30", status: "Upcoming", price: 40 },
  { id: "a10", customerId: "w3", customerName: "Ray Soto", serviceId: "beard", barberId: "marcus", day: "Today", time: "13:00", status: "Upcoming", price: 25 },
  { id: "a11", customerId: "w4", customerName: "Victor Hughes", serviceId: "full", barberId: "deon", day: "Today", time: "14:00", status: "Upcoming", price: 60 },
  { id: "a12", customerId: "w5", customerName: "Omar Fuentes", serviceId: "classic", barberId: "tony", day: "Today", time: "16:00", status: "Upcoming", price: 35 },
  { id: "a13", customerId: "w6", customerName: "DeShawn B.", serviceId: "lineup", barberId: "marcus", day: "Today", time: "17:00", status: "Upcoming", price: 15 },
  { id: "a14", customerId: "w7", customerName: "Paul Nguyen", serviceId: "fade", barberId: "deon", day: "Tomorrow", time: "10:30", status: "Upcoming", price: 40 },
  { id: "a15", customerId: "w8", customerName: "Marcus Lee", serviceId: "full", barberId: "tony", day: "Tomorrow", time: "12:00", status: "Upcoming", price: 60 },
  { id: "a16", customerId: "w9", customerName: "Ivan Petrov", serviceId: "classic", barberId: "marcus", day: "Tomorrow", time: "15:30", status: "Upcoming", price: 35 },
];

export const seedQueue: QueueEntry[] = [
  { id: "q1", name: "James Rivera", barberId: "marcus", status: "IN_CHAIR", estimatedWait: 0 },
  { id: "q2", name: "Mike Tran", barberId: "deon", status: "IN_CHAIR", estimatedWait: 0 },
  { id: "q3", name: "Walk-in · Chris", barberId: "tony", status: "WAITING", estimatedWait: 15 },
  { id: "q4", name: "Sofia Reyes", barberId: "marcus", status: "WAITING", estimatedWait: 30 },
];

export const seedChairs: Chair[] = [
  { barberId: "marcus", state: "IN_SERVICE" },
  { barberId: "deon", state: "ALMOST_READY" },
  { barberId: "tony", state: "IDLE" },
];

export const seedMessages: Message[] = [
  { id: "m1", customerName: "James Rivera", preview: "Can I move my appt to 3?", body: "Hey, something came up — can I move my appointment to 3pm instead of 10:30?", unread: true, time: "9:14 AM" },
  { id: "m2", customerName: "Sofia Reyes", preview: "Do you take walk-ins Saturday?", body: "Do you take walk-ins on Saturday mornings or should I book ahead?", unread: true, time: "8:52 AM" },
  { id: "m3", customerName: "Andre Collins", preview: "Thanks for the cut!", body: "Thanks for the cut yesterday, looked clean. See you next month.", unread: false, time: "Yesterday" },
];

export const defaultStyleProfile: StyleProfile = {
  fadeType: "Mid skin fade",
  clipperGuard: "#2 on sides, scissor on top",
  lineup: "Natural hairline, light edge",
  beard: "Short, defined cheek line",
  allergies: "Sensitive to strong fragrance",
  conversation: "Friendly, but happy to relax quietly",
  products: "Matte clay, no shine",
  notes: "Cowlick at the crown — leave a little length there.",
};

// revenue demo totals (dollars)
export const revenueSeed = {
  today: 420,
  week: 2615,
  month: 10840,
  byService: [
    { label: "Skin Fade", value: 1040 },
    { label: "Classic Cut", value: 735 },
    { label: "Full Service", value: 540 },
    { label: "Beard Trim", value: 300 },
  ],
  byBarber: [
    { label: "Marcus", value: 1120 },
    { label: "Deon", value: 860 },
    { label: "Tony", value: 635 },
  ],
  trend: [280, 410, 360, 520, 475, 590, 420], // last 7 days
};

export const serviceById = (id: string) => services.find((s) => s.id === id);
export const barberById = (id: string) => barbers.find((b) => b.id === id);
export const fmt = (n: number) => `$${n.toFixed(0)}`;
