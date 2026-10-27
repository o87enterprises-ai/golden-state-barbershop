// Sample records for preview builds only (NEXT_PUBLIC_SEED_DEMO=1).
// Production starts empty — see lib/config.ts.

import {
  Appointment,
  Barber,
  Chair,
  Message,
  QueueEntry,
  Sale,
  TimeEntry,
  addDays,
  isoDate,
} from "./data";

export const demoBarbers: Barber[] = [
  { id: "marcus", name: "Marcus", initials: "M" },
  { id: "deon", name: "Deon", initials: "D" },
  { id: "tony", name: "Tony", initials: "T" },
];

export function buildDemo() {
  const today = isoDate();
  const tomorrow = addDays(today, 1);
  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600_000).toISOString();

  const appt = (
    id: string,
    name: string,
    serviceId: string,
    barberId: string,
    date: string,
    time: string,
    price: number,
    status: Appointment["status"] = "Upcoming"
  ): Appointment => ({ id, customerId: `demo-${id}`, customerName: name, serviceId, barberId, date, time, status, price });

  const appointments: Appointment[] = [
    appt("a1", "James Rivera", "classic", "marcus", today, "10:30", 40),
    appt("a2", "Mike Tran", "beard-lineup", "deon", today, "12:00", 20),
    appt("a3", "Sofia Reyes", "classic", "tony", today, "13:30", 40),
    appt("a4", "Andre Collins", "classic-beard", "marcus", today, "15:00", 50),
    appt("a5", "Chris Daniels", "classic", "deon", today, "11:15", 40),
    appt("a6", "Leo Park", "kids", "tony", today, "11:30", 30),
    appt("a7", "Ray Soto", "beard-lineup", "marcus", today, "13:00", 20),
    appt("a8", "Victor Hughes", "classic-beard", "deon", today, "14:00", 50),
    appt("a9", "Omar Fuentes", "senior", "tony", today, "16:00", 30),
    appt("a10", "DeShawn B.", "lineup-edge", "marcus", today, "17:00", 15),
    appt("a11", "Paul Nguyen", "classic", "deon", tomorrow, "10:30", 40),
    appt("a12", "Marcus Lee", "classic-beard", "tony", tomorrow, "12:00", 50),
    appt("a13", "Ivan Petrov", "classic", "marcus", tomorrow, "15:30", 40),
  ];

  const queue: QueueEntry[] = [
    { id: "q1", name: "James Rivera", barberId: "marcus", status: "IN_CHAIR", estimatedWait: 0 },
    { id: "q2", name: "Mike Tran", barberId: "deon", status: "IN_CHAIR", estimatedWait: 0 },
    { id: "q3", name: "Walk-in · Chris", barberId: "tony", status: "WAITING", estimatedWait: 15 },
    { id: "q4", name: "Sofia Reyes", barberId: "marcus", status: "WAITING", estimatedWait: 30 },
  ];

  const chairs: Chair[] = [
    { id: "chair-1", name: "Chair 1", barberId: "marcus", state: "IN_SERVICE", incognito: false },
    { id: "chair-2", name: "Chair 2", barberId: "deon", state: "ALMOST_READY", incognito: false },
    { id: "chair-3", name: "Chair 3", barberId: null, state: "IDLE", incognito: false },
    { id: "chair-4", name: "Chair 4", barberId: null, state: "IDLE", incognito: false },
  ];

  const timeEntries: TimeEntry[] = [
    { id: "t1", barberId: "marcus", chairId: "chair-1", clockIn: hoursAgo(3), clockOut: null, incognito: false },
    { id: "t2", barberId: "deon", chairId: "chair-2", clockIn: hoursAgo(2.5), clockOut: null, incognito: false },
  ];

  const messages: Message[] = [
    { id: "m1", customerName: "James Rivera", customerEmail: "james@example.com", preview: "Can I move my appt to 3?", body: "Hey, something came up — can I move my appointment to 3pm instead of 10:30?", unread: true, time: "9:14 AM" },
    { id: "m2", customerName: "Sofia Reyes", customerEmail: "sofia@example.com", preview: "Do you take walk-ins Saturday?", body: "Do you take walk-ins on Saturday mornings or should I book ahead?", unread: true, time: "8:52 AM" },
  ];

  const sales: Sale[] = [
    { id: "s1", at: hoursAgo(5), amount: 40, kind: "booking", label: "Classic Cut", barberId: "marcus", serviceId: "classic" },
    { id: "s2", at: hoursAgo(4), amount: 50, kind: "booking", label: "Classic Cut with Beard", barberId: "deon", serviceId: "classic-beard" },
    { id: "s3", at: hoursAgo(26), amount: 30, kind: "walk-in", label: "Kids Haircut", barberId: "tony", serviceId: "kids" },
    { id: "s4", at: hoursAgo(30), amount: 40, kind: "booking", label: "Classic Cut", barberId: "marcus", serviceId: "classic" },
    { id: "s5", at: hoursAgo(52), amount: 65, kind: "walk-in", label: "Classic Cut w/ Beard + tip", barberId: "deon", serviceId: "classic-beard" },
  ];

  return { appointments, queue, chairs, timeEntries, messages, sales };
}
