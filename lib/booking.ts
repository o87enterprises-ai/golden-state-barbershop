import { db } from "./db";
import { brand } from "./branding";
import { HOLD_MINUTES, parseDateOnly, zonedInstant } from "./time";

// Availability: slots from shop hours (Pacific time) minus live bookings.
// Hours are "HH:MM-HH:MM" per weekday key (see branding.contact.hours).
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** Bookings that currently hold a slot: confirmed ones, plus unpaid ones still inside the hold window. */
export function activeBookingFilter(now = new Date()) {
  const holdCutoff = new Date(now.getTime() - HOLD_MINUTES * 60_000);
  return {
    OR: [
      { status: { in: ["CONFIRMED", "PAID", "COMPLETED"] as ("CONFIRMED" | "PAID" | "COMPLETED")[] } },
      { status: "PENDING" as const, createdAt: { gte: holdCutoff } },
    ],
  };
}

export async function getAvailability(dateISO: string, serviceId: string, barberId?: string) {
  const day = parseDateOnly(dateISO);
  if (!day) return [];

  const hours = (brand.contact.hours as Record<string, string>)[DAY_KEYS[day.dow]];
  if (!hours) return []; // closed

  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) return [];

  const [open, close] = hours.split("-");
  const slots = buildSlots(day, open, close, service.minutes);
  if (!slots.length) return [];

  const booked = await db.booking.findMany({
    where: {
      ...activeBookingFilter(),
      ...(barberId ? { barberId } : {}),
      startsAt: { lt: slots[slots.length - 1].end },
      endsAt: { gt: slots[0].start },
    },
    select: { startsAt: true, endsAt: true },
  });

  const now = Date.now();
  return slots.filter(
    (s) => s.start.getTime() > now && !booked.some((b) => s.start < b.endsAt && s.end > b.startsAt)
  );
}

function buildSlots(
  day: { y: number; m: number; d: number },
  open: string,
  close: string,
  minutes: number
) {
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  const closeAt = zonedInstant(day.y, day.m, day.d, ch, cm);
  const slots: { start: Date; end: Date }[] = [];
  let start = zonedInstant(day.y, day.m, day.d, oh, om);

  while (start < closeAt) {
    const end = new Date(start.getTime() + minutes * 60_000);
    if (end <= closeAt) slots.push({ start, end });
    start = end;
  }
  return slots;
}
