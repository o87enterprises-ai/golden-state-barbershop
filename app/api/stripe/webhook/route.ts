import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendReceipt } from "@/lib/email";

// Stripe needs the raw body for signature verification.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe webhook — on payment, mark paid + fire the digital receipt.
// (Review request is sent later by the /api/cron/reviews job, post-visit.)
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const bookingId = session.metadata?.bookingId;
    // Stripe delivers the event for delayed methods before the money settles.
    if (bookingId && session.payment_status === "paid") {
      // Idempotent and race-safe: Stripe retries webhooks, and the receipt must
      // go out once. The conditional updateMany lets exactly one delivery win.
      const claimed = await db.booking.updateMany({
        where: { id: bookingId, status: { in: ["PENDING", "CONFIRMED"] } },
        data: {
          status: "PAID",
          paidAt: new Date(),
          stripePaymentIntentId: session.payment_intent as string,
          receiptSentAt: new Date(),
        },
      });
      if (claimed.count === 1) {
        const booking = await db.booking.findUniqueOrThrow({
          where: { id: bookingId },
          include: { service: true, customer: true },
        });

        await sendReceipt({
          to: booking.customer.email,
          customerName: booking.customer.name,
          serviceName: booking.service.name,
          amountCents: booking.amountCents,
          when: booking.startsAt,
        }).catch(() => {});
      }
    }
  }

  // Customer abandoned checkout: release the slot right away.
  if (event.type === "checkout.session.expired") {
    const bookingId = (event.data.object as any).metadata?.bookingId;
    if (bookingId) {
      await db.booking.updateMany({
        where: { id: bookingId, status: "PENDING" },
        data: { status: "CANCELLED" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
