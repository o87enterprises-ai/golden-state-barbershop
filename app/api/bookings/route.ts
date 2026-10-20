import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  serviceId: z.string(),
  barberId: z.string().optional(),
  startsAt: z.string().datetime(),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
});

// POST /api/bookings — create a pending booking (payment happens next via /api/checkout)
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { serviceId, barberId, startsAt, customer } = parsed.data;

  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service) return NextResponse.json({ error: "Unknown service" }, { status: 404 });

  const start = new Date(startsAt);
  const end = new Date(start.getTime() + service.minutes * 60000);

  // double-booking guard
  const clash = await db.booking.findFirst({
    where: {
      barberId: barberId ?? undefined,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      startsAt: { lt: end },
      endsAt: { gt: start },
    },
  });
  if (clash) return NextResponse.json({ error: "Slot taken" }, { status: 409 });

  const cust = await db.customer.upsert({
    where: { email: customer.email },
    update: { name: customer.name, phone: customer.phone },
    create: customer,
  });

  const booking = await db.booking.create({
    data: {
      serviceId,
      barberId,
      customerId: cust.id,
      startsAt: start,
      endsAt: end,
      amountCents: service.priceCents,
      status: "PENDING",
    },
  });

  return NextResponse.json({ booking });
}
