import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendReviewRequest } from "@/lib/email";

// Daily cron (see vercel.ts): send a Google review request a few hours after a
// paid visit has passed. Idempotent via reviewSentAt.
export async function GET() {
  const cutoff = new Date(Date.now() - 3 * 60 * 60 * 1000); // visit started 3h+ ago

  const due = await db.booking.findMany({
    where: {
      status: "PAID",
      reviewSentAt: null,
      startsAt: { lte: cutoff },
    },
    include: { customer: true },
    take: 100,
  });

  for (const b of due) {
    await sendReviewRequest({
      to: b.customer.email,
      customerName: b.customer.name,
    }).catch(() => {});
    await db.booking.update({
      where: { id: b.id },
      data: { reviewSentAt: new Date(), status: "COMPLETED" },
    });
  }

  return NextResponse.json({ sent: due.length });
}
