// The shop runs on Pacific time, but serverless functions run in UTC. All slot
// math goes through here so "10:30" means 10:30 in Tracy, not 10:30 UTC.
export const SHOP_TZ = "America/Los_Angeles";

// How long an unpaid PENDING booking holds its slot before it is released.
export const HOLD_MINUTES = 15;

function offsetMs(utcMs: number, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const v = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"), v("second"));
  return asUtc - utcMs;
}

/** The instant at which the wall clock in `tz` reads y-m-d h:mi. */
export function zonedInstant(y: number, m: number, d: number, h: number, mi: number, tz = SHOP_TZ): Date {
  const guess = Date.UTC(y, m - 1, d, h, mi);
  let t = guess - offsetMs(guess, tz);
  t = guess - offsetMs(t, tz); // second pass handles DST boundaries
  return new Date(t);
}

/** Parse "YYYY-MM-DD"; returns null if malformed or not a real date. */
export function parseDateOnly(s: string): { y: number; m: number; d: number; dow: number } | null {
  const mt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!mt) return null;
  const [y, m, d] = [Number(mt[1]), Number(mt[2]), Number(mt[3])];
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) return null;
  return { y, m, d, dow: probe.getUTCDay() };
}
