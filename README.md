# Golden State Barbershop — backend scaffold

Next.js 16 App Router backend for the Framer Motion / 3D parallax PWA frontend you'll build.

## What's wired
| Feature | Where |
|---|---|
| Online booking + availability | `app/api/bookings`, `app/api/availability`, `lib/booking.ts` |
| Payments (Apple/Google Pay + card) | `app/api/checkout`, `app/api/stripe/webhook`, `lib/stripe.ts` |
| Digital receipts | `lib/email.ts` (fired from webhook) |
| Auto Google reviews | `app/api/cron/reviews` (daily cron in `vercel.ts`) |
| SEO | `app/sitemap.ts`, `app/robots.ts`, metadata in `app/layout.tsx` |
| AEO (answer engines) | `lib/schema.ts` FAQPage JSON-LD, `FAQS` |
| GEO (AI crawlers) | `public/llms.txt`, AI-bot allows in `robots.ts`, BarberShop JSON-LD |
| PWA | `app/manifest.ts` |
| Branding tokens | `lib/branding.ts` |

## In-shop payment model (decided)
Customer taps **their own phone** (Apple Pay / Google Pay) or any card via Stripe Checkout.
$0 hardware, pure PWA. If you later want the barber tapping the customer's card, that
needs a native Tap-to-Pay wrapper — the backend here doesn't change.

## Setup
1. `npm install`
2. Copy `.env.example` → `.env`, fill keys.
   - Postgres: `vercel integration add neon` (or any Marketplace Postgres)
   - Stripe + Resend keys from their dashboards
3. `npm run db:push` then seed Services/Barbers (Prisma Studio: `npm run db:studio`)
4. Stripe webhook → `https://<site>/api/stripe/webhook` (event: `checkout.session.completed`)
5. `npm run dev`

## Still to fill in (quick)
- `lib/branding.ts` → real phone / address / Google Place ID
- `.env` → `GOOGLE_REVIEW_URL` (from your Google Business Profile)
- Icons: `public/icon-192.png`, `public/icon-512.png`, `public/logo.png`

## App structure (storefront + staff app)
| Area | Route | Who |
|---|---|---|
| Landing, menu, shop, guest booking | `/`, `/menu`, `/shop`, `/book` | everyone (no account needed to book; payment is required up front) |
| Log in / sign up / onboarding | `/login`, `/signup`, `/onboarding` | everyone |
| Customer app | `/portal/*` | customers |
| Staff app | `/admin/*` | owner (all pages) and barbers (Time Clock, Incognito, Schedule, POS, Queue, Chairs) |

- **Accounts:** the first owner is created at `/signup?role=admin` (only possible until an owner exists). The owner invites barbers with one-time codes (Team page); customers sign up freely. Passwords are salted PBKDF2-SHA256 hashes.
- **Time clock:** barbers clock in and claim a chair. Public availability (the landing "The Floor", the booking calendar, barber choices) follows who is clocked in at a public chair.
- **Incognito (ghost chair):** a barber can reserve their chair for private/VIP clients. It shows publicly as "Reserved" with no names, and the barber sets a custom price per private session. Sales roll up to the owner's Revenue page.
- **Shop:** affiliate links to Amazon (`lib/mock/data.ts` → `products`). No prices are stored because Amazon requires live prices. Set `NEXT_PUBLIC_AMAZON_TAG` to your Associates ID.

## Production notes — read before launch
The storefront, accounts, time clock, bookings, and POS currently run on a **client-side data layer** (`lib/auth/AuthStore.tsx`, `lib/mock/DemoStore.tsx`) persisted in the browser. That means:
- Accounts and shop data live **per device**: a booking made on a customer's phone will not appear on the shop's computer. Browser storage is also **not a security boundary**; the route gates (`RequireRole`) are a UX layer, not server enforcement.
- Card payments are **simulated** (`NEXT_PUBLIC_PAYMENTS_LIVE` unset). No charge is made.
- Before taking real customers, move these to the server: users + sessions (cookie auth), chairs / time entries / private sessions / sales (Prisma + Postgres), and wire the booking flow to `app/api/checkout` and the Stripe webhook that already exist. The store functions (`signup`, `login`, `clockIn`, `addAppointment`, …) are the seam: swap their bodies for `fetch` calls and the pages don't change.

## Environment flags
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_AMAZON_TAG` | Amazon Associates store ID appended to every product link |
| `NEXT_PUBLIC_PREVIEW_MODE=1` | Owner-approval previews only: NDA gate, banner, watermark, noindex |
| `NEXT_PUBLIC_SEED_DEMO=1` | Loads sample barbers/appointments/sales (never in production) |
| `NEXT_PUBLIC_PAYMENTS_LIVE=1` | Hides the "simulated payment" labels once a processor is connected |
| `NEXT_PUBLIC_GOOGLE_REVIEW_URL` | Shows the review prompt on the confirmation page |

## 3D hero assets
- Drop the artist's model at `public/clipper.glb` with nodes named `Blade`, `Motor`, `Coil`; the scene uses it automatically (placeholder shapes otherwise).
- `public/clippers.mp4` is ~5.4 MB. Re-encode to 5 MB or less with no audio track (HandBrake: H.264, RF 26, audio off). Phones and reduced-motion users never load it.
- If the 3D model is blank in Firefox, check `about:support` → Graphics; "Blocked" means the GPU driver needs updating. The page falls back gracefully.
