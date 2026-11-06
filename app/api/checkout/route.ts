import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { HOLD_MINUTES } from "@/lib/time";
import { clientIp, rateLimited } from "@/lib/ratelimit";

const schema = z.object({ bookingId: z.string().min(1).max(64) });

// POST /api/checkout { bookingId }
// Stripe Checkout with Apple Pay / Google Pay auto-enabled (customer taps own phone).
export async function POST(req: NextRequest) {
  if (rateLimited(`checkout:${clientIp(req)}`, 20, 10 * 60_000))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bookingId required" }, { status: 400 });

  const booking = await db.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: { service: true, customer: true },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (booking.status === "PAID" || booking.status === "COMPLETED")
    return NextResponse.json({ error: "Already paid" }, { status: 409 });
  if (booking.status === "CANCELLED" || booking.status === "NO_SHOW")
    return NextResponse.json({ error: "Booking is no longer active" }, { status: 409 });
  if (
    booking.status === "PENDING" &&
    Date.now() - booking.createdAt.getTime() > HOLD_MINUTES * 60_000
  )
    return NextResponse.json({ error: "This hold expired. Please pick a time again." }, { status: 410 });

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: booking.customer.email,
    // card == tap-to-pay wallets (Apple/Google Pay) surface automatically in the browser
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: booking.service.name },
          unit_amount: booking.amountCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: { metadata: { bookingId: booking.id } },
    metadata: { bookingId: booking.id },
    // Stripe requires >= 30 min; the slot hold is shorter, so a late payment is
    // still honoured by the webhook below.
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    success_url: `${site}/success?type=booking&b=${booking.id}`,
    cancel_url: `${site}/book?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
