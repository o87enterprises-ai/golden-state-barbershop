import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { activeBookingFilter } from "@/lib/booking";
import { clientIp, rateLimited } from "@/lib/ratelimit";

const schema = z.object({
  serviceId: z.string().min(1).max(64),
  barberId: z.string().min(1).max(64).optional(),
  startsAt: z.string().datetime(),
  customer: z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().toLowerCase().email().max(200),
    phone: z.string().trim().max(30).optional(),
  }),
});

// POST /api/bookings — create a pending booking (payment happens next via /api/checkout)
export async function POST(req: NextRequest) {
  if (rateLimited(`book:${clientIp(req)}`, 10, 10 * 60_000))
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { serviceId, barberId, startsAt, customer } = parsed.data;

  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active)
    return NextResponse.json({ error: "Unknown service" }, { status: 404 });

  if (barberId) {
    const barber = await db.barber.findUnique({ where: { id: barberId } });
    if (!barber || !barber.active)
      return NextResponse.json({ error: "Unknown barber" }, { status: 404 });
  }

  const start = new Date(startsAt);
  if (start.getTime() <= Date.now())
    return NextResponse.json({ error: "That time has passed" }, { status: 400 });
  const end = new Date(start.getTime() + service.minutes * 60000);

  try {
    // Serializable: the clash check and the insert are one atomic decision, so
    // two simultaneous requests can't both take the same slot.
    const booking = await db.$transaction(
      async (tx) => {
        // Prisma drops `undefined` filters, which would turn "any barber" into
        // "the whole shop is busy", so only add the filter for a chosen barber.
        const clash = await tx.booking.findFirst({
          where: {
            ...activeBookingFilter(),
            ...(barberId ? { barberId } : {}),
            startsAt: { lt: end },
            endsAt: { gt: start },
          },
        });
        if (clash) return null;

        const cust = await tx.customer.upsert({
          where: { email: customer.email },
          update: { name: customer.name, phone: customer.phone },
          create: customer,
        });

        return tx.booking.create({
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
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    if (!booking) return NextResponse.json({ error: "Slot taken" }, { status: 409 });
    return NextResponse.json({ booking });
  } catch (e) {
    // Serialization failure = a concurrent request won the slot.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2034")
      return NextResponse.json({ error: "Slot taken" }, { status: 409 });
    throw e;
  }
}
