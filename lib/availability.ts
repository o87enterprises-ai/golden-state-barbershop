// Shop hours + availability rules shared by every booking surface.
//
// Rules:
//  - Future days assume the full roster is available.
//  - Today follows the floor: once anyone has clocked in, only barbers
//    currently clocked in at a PUBLIC chair can take bookings.
//  - Incognito (private) chairs never count toward public availability.

import {
  Appointment,
  Barber,
  Chair,
  TimeEntry,
  isoDate,
  parseIsoDate,
} from "@/lib/mock/data";

// Open/close in decimal hours, by weekday (0 = Sun). null = closed.
export const DAY_HOURS: Record<number, { start: number; end: number } | null> = {
  0: null,
  1: null,
  2: { start: 10.5, end: 18.5 },
  3: { start: 10.5, end: 18.5 },
  4: { start: 10.5, end: 18.5 },
  5: { start: 10.5, end: 19.5 },
  6: { start: 9.5, end: 15.5 },
};

export const shopOpen = (iso: string) => DAY_HOURS[parseIsoDate(iso).getDay()] !== null;

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// Hourly start times for a date ("10:30", "11:30", …), last start one hour before close.
export function slotTimes(iso: string): string[] {
  const hrs = DAY_HOURS[parseIsoDate(iso).getDay()];
  if (!hrs) return [];
  const out: string[] = [];
  for (let t = hrs.start; t + 1 <= hrs.end; t += 1) {
    const h = Math.floor(t);
    const m = t % 1 === 0.5 ? "30" : "00";
    out.push(`${String(h).padStart(2, "0")}:${m}`);
  }
  return out;
}

export type AvailabilityCtx = {
  barbers: Barber[];
  chairs: Chair[];
  timeEntries: TimeEntry[];
  appointments: Appointment[];
  now?: Date;
};

// Barbers on the floor right now at a public (non-incognito) chair.
export function floorBarbers(ctx: Pick<AvailabilityCtx, "barbers" | "chairs">): Barber[] {
  const ids = new Set(
    ctx.chairs.filter((c) => c.barberId && !c.incognito).map((c) => c.barberId as string)
  );
  return ctx.barbers.filter((b) => ids.has(b.id));
}

// Barbers who can take a booking on the given date.
export function eligibleBarbers(iso: string, ctx: AvailabilityCtx): Barber[] {
  const now = ctx.now ?? new Date();
  if (iso === isoDate(now)) {
    const started = ctx.timeEntries.some((e) => isoDate(new Date(e.clockIn)) === iso);
    if (started) return floorBarbers(ctx);
  }
  return ctx.barbers;
}

const inSlot = (apptTime: string, slot: string) => {
  const a = toMinutes(apptTime);
  const s = toMinutes(slot);
  return a >= s && a < s + 60;
};

export function barberFree(
  barberId: string,
  iso: string,
  slot: string,
  appointments: Appointment[]
): boolean {
  return !appointments.some(
    (a) => a.status === "Upcoming" && a.barberId === barberId && a.date === iso && inSlot(a.time, slot)
  );
}

export function slotInPast(iso: string, slot: string, now: Date = new Date()): boolean {
  if (iso < isoDate(now)) return true;
  if (iso > isoDate(now)) return false;
  return toMinutes(slot) <= now.getHours() * 60 + now.getMinutes();
}

// Barbers still free for a slot (optionally restricted to one barber).
export function freeBarbersFor(
  iso: string,
  slot: string,
  ctx: AvailabilityCtx,
  onlyBarberId?: string
): Barber[] {
  if (slotInPast(iso, slot, ctx.now)) return [];
  return eligibleBarbers(iso, ctx).filter(
    (b) => (!onlyBarberId || b.id === onlyBarberId) && barberFree(b.id, iso, slot, ctx.appointments)
  );
}

export const slotOpen = (iso: string, slot: string, ctx: AvailabilityCtx, onlyBarberId?: string) =>
  freeBarbersFor(iso, slot, ctx, onlyBarberId).length > 0;

// Chairs the public can still sit in right now.
export const openPublicChairs = (chairs: Chair[]) =>
  chairs.filter((c) => c.barberId && !c.incognito && c.state === "IDLE");
