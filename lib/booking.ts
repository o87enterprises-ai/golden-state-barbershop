import { db } from "./db";
import { brand } from "./branding";

// Simple availability: generate slots from shop hours minus existing bookings.
// Hours are "HH:MM-HH:MM" per weekday key (see branding.contact.hours).
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export async function getAvailability(dateISO: string, serviceId: string) {
  const date = new Date(dateISO + "T00:00:00");
  const key = DAY_KEYS[date.getDay()];
  const hours = (brand.contact.hours as Record<string, string>)[key];
  if (!hours) return []; // closed

  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service) return [];

  const [open, close] = hours.split("-");
  const slots = buildSlots(date, open, close, service.minutes);

  const dayStart = new Date(date);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59);

  const booked = await db.booking.findMany({
    where: {
      startsAt: { gte: dayStart, lte: dayEnd },
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
    },
    select: { startsAt: true, endsAt: true },
  });

  return slots.filter(
    (s) =>
      !booked.some(
        (b) => s.start < b.endsAt && s.end > b.startsAt // overlap
      )
  );
}

function buildSlots(date: Date, open: string, close: string, minutes: number) {
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  const slots: { start: Date; end: Date }[] = [];
  const cursor = new Date(date);
  cursor.setHours(oh, om, 0, 0);
  const end = new Date(date);
  end.setHours(ch, cm, 0, 0);

  while (cursor < end) {
    const start = new Date(cursor);
    const slotEnd = new Date(cursor.getTime() + minutes * 60000);
    if (slotEnd <= end) slots.push({ start, end: slotEnd });
    cursor.setTime(cursor.getTime() + minutes * 60000);
  }
  return slots;
}
