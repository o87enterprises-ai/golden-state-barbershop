# Quickstart

Get Golden State Barbershop running locally, then deploy it.

> **Heads up:** accounts and logins are real (Postgres + httpOnly sessions). The shop floor
> — chairs, time clock, queue, sales, style profiles — is still stored per device in the
> browser, and payments in the booking UI are simulated. See [What isn't real yet](#what-isnt-real-yet).

## 0. You'll need

- **Node.js 20.9+** (22 LTS recommended)
- **Postgres** — [Neon](https://neon.tech), Supabase, or the Vercel Marketplace all work; local Postgres is fine too
- **Stripe** account — only for payment flows
- **Resend** account — only for receipts and review emails
- **Stripe CLI** — only to test webhooks locally

## 1. Install

```bash
npm install
```

## 2. Environment

```bash
cp .env.example .env
```

Fill in at minimum:

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Postgres connection string (`?sslmode=require` for hosted) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally, your real URL in production |
| `STRIPE_SECRET_KEY` | `sk_test_…` for now, `sk_live_…` when you go live |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from step 5 |
| `RESEND_API_KEY` | `re_…` |
| `RECEIPT_FROM_EMAIL` | Verified sender, e.g. `Golden State Barbershop <hello@goldenstatebarbershop.com>` |
| `CRON_SECRET` | Any long random string; protects `/api/cron/reviews` |

Leave `NEXT_PUBLIC_PREVIEW_MODE` and `NEXT_PUBLIC_SEED_DEMO` **unset** outside owner previews.

`NEXT_PUBLIC_PAYMENTS_LIVE=1` only hides the "simulated payment" labels — it does **not**
connect a processor. Leave it unset until the booking flow is wired to Stripe.

## 3. Database

```bash
npm run db:push        # create the tables
npm run db:seed        # menu services + staff logins
```

Pick the staff password up front:

```bash
# macOS / Linux / Git Bash
SEED_STAFF_PASSWORD='PickAStrong1' npm run db:seed

# Windows PowerShell
$env:SEED_STAFF_PASSWORD='PickAStrong1'; npm run db:seed
```

Or omit it and the seed prints a random temporary password for each person — **once**.
Re-running the seed never changes an existing account's password.

### Staff logins

| Person | Email | Role |
|---|---|---|
| Andy | `andy@goldenstatebarbershop.com` | Owner (also works a chair) |
| Ever | `ever@goldenstatebarbershop.com` | Barber |
| Andru | `andru@goldenstatebarbershop.com` | Barber |
| Julio Cesar | `julio@goldenstatebarbershop.com` | Barber |
| Marvin | `marvin@goldenstatebarbershop.com` | Barber |

Sign in at **`/login`**. Andy lands on `/admin`, barbers on `/admin/clock`.
Barbers can also be invited later with one-time codes from **Team** in the admin app.

Inspect or edit rows with `npm run db:studio`.

## 4. Run it

```bash
npm run dev
```

Open <http://localhost:3000>. Useful routes:

| Route | What |
|---|---|
| `/` | storefront |
| `/book` | guest booking |
| `/login`, `/signup` | accounts |
| `/portal` | customer app |
| `/admin` | staff app |
| `/success` | post-payment confirmation |

## 5. Stripe webhook (local)

In a second terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET` and restart `npm run dev`.

## 6. Production

1. Push the repo to GitHub and import it into Vercel (framework preset: Next.js).
2. Add every variable from step 2 to the Vercel project (Production environment),
   with `NEXT_PUBLIC_SITE_URL` set to the real domain.
3. Run the schema against the production database once:
   ```bash
   DATABASE_URL='<production url>' npm run db:push
   DATABASE_URL='<production url>' SEED_STAFF_PASSWORD='<strong password>' npm run db:seed
   ```
4. Add the live webhook endpoint in Stripe: `https://<domain>/api/stripe/webhook`,
   event `checkout.session.completed`, and put its signing secret in `STRIPE_WEBHOOK_SECRET`.
5. Set `CRON_SECRET`. `vercel.ts` schedules `/api/cron/reviews` daily at 20:00 UTC.
6. Verify the sending domain in Resend, then point the domain at Vercel.

Build locally any time with `npm run build` (`prisma generate` runs first).

## What isn't real yet

- **Shop data is per device.** Chairs, time clock, private sessions, queue, messages, sales,
  and style profiles live in `localStorage`, so a booking on a customer's phone doesn't
  reach the shop's computer. Accounts are the exception — they're in Postgres.
- **Payments in the UI are simulated.** `BookingFlow` opens a fake Stripe overlay; the real
  `/api/bookings` and `/api/checkout` routes exist but the UI doesn't call them yet.
- **No server-side agreement on availability.** Two engines exist: `lib/availability.ts`
  (chair rules, used by the UI) and `lib/booking.ts` (service slots, used by the API).

These need to land before taking real customers. The README's "Production notes" has the
long version.

## Troubleshooting

**`@prisma/client did not initialize yet`** — run `npm run db:push` (or `npx prisma generate`).

**Login returns 500 / can't create accounts** — `DATABASE_URL` is missing or the tables
don't exist yet. Check step 3.

**Forgot a seeded password** — delete that user in `npm run db:studio`, then re-run
`npm run db:seed` to recreate them with a fresh temporary password.

**Sessions don't stick in production** — the session cookie is `secure` there, so the site
must be served over HTTPS.
