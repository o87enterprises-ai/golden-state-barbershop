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
