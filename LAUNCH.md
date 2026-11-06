# Launch checklist (for the shop owner)

Everything technical is already set up. You only need to hand over the items
below, then run one command.

## What we need from you

| # | Item | Where to get it |
|---|------|-----------------|
| 1 | **Stripe keys** (secret + publishable) | stripe.com → Developers → API keys |
| 2 | **Resend API key** | resend.com → API Keys. Also add and verify `goldenstatebarbershop.com` under Domains so receipts don't land in spam. |
| 3 | **Google review link** (optional) | Google Business Profile → "Ask for reviews" → copy link |
| 4 | **Amazon Associates ID** (optional) | affiliate-program.amazon.com |

## Launch

```bash
npm run launch
```

It asks for the items above (keys are hidden as you type), connects Stripe,
builds the database, creates the staff logins and publishes the site. When it
finishes, staff logins are saved in `LAUNCH-CREDENTIALS.txt` — keep that file
private and delete it once everyone has signed in and changed their password.

## One-time setup done by your developer beforehand

- A database: Vercel dashboard → this project → Storage → Create Database → Neon.
- The domain `goldenstatebarbershop.com` added under Project → Settings → Domains.

## Not yet live

Booking/shop-floor data (chairs, time clock, queue, sales) is still stored per
device and checkout in the booking screen is simulated. These must be connected
to the database and Stripe before real customers use the site.
