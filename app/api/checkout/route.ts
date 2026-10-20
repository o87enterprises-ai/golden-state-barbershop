import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

// POST /api/checkout { bookingId }
// Stripe Checkout with Apple Pay / Google Pay auto-enabled (customer taps own phone).
export async function POST(req: NextRequest) {
  const { bookingId } = await req.json();
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, customer: true },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const site = process.env.NEXT_PUBLIC_SITE_URL;
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
    success_url: `${site}/booking/success?b=${booking.id}`,
    cancel_url: `${site}/booking?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
