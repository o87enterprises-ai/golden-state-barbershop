import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendReceipt } from "@/lib/email";

// Stripe webhook — on payment, mark paid + fire the digital receipt.
// (Review request is sent later by the /api/cron/reviews job, post-visit.)
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      const booking = await db.booking.update({
        where: { id: bookingId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          stripePaymentIntentId: session.payment_intent as string,
          receiptSentAt: new Date(),
        },
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

  return NextResponse.json({ received: true });
}
