import type { User } from "@/lib/auth/AuthStore";
import type { Appointment } from "@/lib/mock/data";

// A customer's appointments: ones booked while signed in, plus guest bookings
// made earlier with the same email.
export function mineOf(appointments: Appointment[], user: User): Appointment[] {
  const email = user.email.toLowerCase();
  return appointments.filter((a) => a.customerId === user.id || a.customerEmail?.toLowerCase() === email);
}
