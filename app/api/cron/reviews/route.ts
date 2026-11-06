import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendReviewRequest } from "@/lib/email";

// Daily cron (see vercel.ts): send a Google review request a few hours after a
// paid visit has passed. Idempotent via reviewSentAt.
export async function GET(req: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET` when the variable is
  // set; without this check anyone could trigger customer emails.
  const secret = process.env.CRON_SECRET;
  // Fail closed in production if the secret was never configured.
  if (!secret && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
