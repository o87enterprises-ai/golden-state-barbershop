"use client";

// Shop state: chairs, time clock, private (incognito) sessions, queue,
// appointments, messages, and sales. Persisted on this device and synced
// across tabs; swap the setters for API calls when a backend is wired in.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Appointment,
  Barber,
  Chair,
  ChairState,
  Message,
  PrivateSession,
  QueueEntry,
  QueueStatus,
  Sale,
  StyleProfile,
  TimeEntry,
  emptyStyleProfile,
  initialsOf,
  uid,
} from "./data";
import { buildDemo, demoBarbers } from "./demo";
import { SEED_DEMO } from "@/lib/config";
import { useAuth } from "@/lib/auth/AuthStore";

export type OverlayType = "tap" | "share" | null;
export type OverlayState = {
  type: OverlayType;
  amount?: number;
  context?: string;
  onDone?: () => void;
};

export type Toast = { id: string; title: string; body?: string; kind?: "info" | "success" | "buzz" };

type Shared = {
  queue: QueueEntry[];
  chairs: Chair[];
  appointments: Appointment[];
  messages: Message[];
  timeEntries: TimeEntry[];
  privateSessions: PrivateSession[];
  sales: Sale[];
  styleProfiles: Record<string, StyleProfile>;
};

type Err = string | null;

type DemoContextValue = Shared & {
  hydrated: boolean;
  barbers: Barber[];
  barberById: (id: string) => Barber | undefined;
  overlay: OverlayState;
  toasts: Toast[];
  notificationsOn: boolean;
  styleProfile: StyleProfile;
  // overlays + toasts
  openOverlay: (o: OverlayState) => void;
  closeOverlay: () => void;
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  // booking + sales
  addAppointment: (a: Omit<Appointment, "id">) => string;
  cancelAppointment: (id: string) => void;
  recordSale: (s: Omit<Sale, "id" | "at"> & { at?: string }) => void;
  // queue
  setQueueStatus: (id: string, status: QueueStatus) => void;
  callNext: (barberId: string) => void;
  addWalkIn: (name: string, barberId: string) => void;
  // chairs
  setChairState: (chairId: string, state: ChairState) => void;
  buzzChair: (chairId: string) => void;
  addChair: () => void;
  removeChair: (chairId: string) => Err;
  // time clock + incognito
  openEntryFor: (barberId: string) => TimeEntry | undefined;
  chairOf: (barberId: string) => Chair | undefined;
  clockIn: (barberId: string, chairId: string, incognito: boolean) => Err;
  clockOut: (barberId: string) => Err;
  setIncognito: (barberId: string, on: boolean) => Err;
  startPrivateSession: (barberId: string, s: { client: string; note: string; price: number }) => Err;
  completePrivateSession: (id: string) => void;
  cancelPrivateSession: (id: string) => void;
  // messages / style / notifications
  sendMessage: (m: { customerName: string; customerEmail?: string; body: string }) => void;
  markRead: (id: string) => void;
  updateStyleProfile: (sp: StyleProfile) => void;
  enableNotifications: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);
export const useDemo = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within <DemoStore>");
  return ctx;
};

const LS_KEY = "gsb-shop-v2";
const BUZZ_CHANNEL = "gsb-buzz";
const DEFAULT_CHAIRS = 4;

const makeChairs = (n: number): Chair[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `chair-${i + 1}`,
    name: `Chair ${i + 1}`,
    barberId: null,
    state: "IDLE",
    incognito: false,
  }));

const emptyShared = (): Shared => ({
  queue: [],
  chairs: makeChairs(DEFAULT_CHAIRS),
  appointments: [],
  messages: [],
  timeEntries: [],
  privateSessions: [],
  sales: [],
  styleProfiles: {},
});

export default function DemoStore({ children }: { children: React.ReactNode }) {
  const { user, users } = useAuth();

  const [hydrated, setHydrated] = useState(false);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [chairs, setChairs] = useState<Chair[]>(makeChairs(DEFAULT_CHAIRS));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [privateSessions, setPrivateSessions] = useState<PrivateSession[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [styleProfiles, setStyleProfiles] = useState<Record<string, StyleProfile>>({});

  const [overlay, setOverlay] = useState<OverlayState>({ type: null });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notificationsOn, setNotificationsOn] = useState(false);

  const buzzRef = useRef<BroadcastChannel | null>(null);
  const senderId = useRef(uid());

  const apply = useCallback((s: Partial<Shared>) => {
    if (s.queue) setQueue(s.queue);
    if (s.chairs) setChairs(s.chairs);
    if (s.appointments) setAppointments(s.appointments);
    if (s.messages) setMessages(s.messages);
    if (s.timeEntries) setTimeEntries(s.timeEntries);
    if (s.privateSessions) setPrivateSessions(s.privateSessions);
    if (s.sales) setSales(s.sales);
    if (s.styleProfiles) setStyleProfiles(s.styleProfiles);
  }, []);

  // ---- toasts ----
  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const id = uid();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5000);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts((prev) => prev.filter((x) => x.id !== id)), []);

  // ---- hydrate (client only, avoids SSR/date mismatches) ----
  useEffect(() => {
    let loaded = false;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        apply(JSON.parse(raw));
        loaded = true;
      }
    } catch {
      /* ignore */
    }
    if (!loaded) apply(SEED_DEMO ? { ...emptyShared(), ...buildDemo() } : emptyShared());
    setHydrated(true);
  }, [apply]);

  // ---- persist; other tabs pick the change up through the storage event ----
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ queue, chairs, appointments, messages, timeEntries, privateSessions, sales, styleProfiles })
      );
    } catch {
      /* ignore */
    }
  }, [hydrated, queue, chairs, appointments, messages, timeEntries, privateSessions, sales, styleProfiles]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== LS_KEY || !e.newValue) return;
      try {
        apply(JSON.parse(e.newValue));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [apply]);

  // ---- buzzer (transient, so it uses BroadcastChannel rather than state) ----
  const playBuzz = useCallback(() => {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = new Ctx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "square";
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.frequency.setValueAtTime(220, ac.currentTime);
      osc.frequency.setValueAtTime(330, ac.currentTime + 0.12);
      osc.start();
      osc.stop(ac.currentTime + 0.35);
    } catch {
      /* ignore */
    }
  }, []);

  const receiveBuzz = useCallback(
    (chairName: string) => {
      pushToast({ kind: "buzz", title: "Your chair is ready!", body: `${chairName} is ready for you.` });
      playBuzz();
      try {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Golden State Barbershop", { body: `${chairName} is ready for you.` });
        }
      } catch {
        /* ignore */
      }
    },
    [pushToast, playBuzz]
  );

  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const ch = new BroadcastChannel(BUZZ_CHANNEL);
    buzzRef.current = ch;
    ch.onmessage = (e) => {
      const d = e.data as { from?: string; buzz?: string };
      if (d.from !== senderId.current && d.buzz) receiveBuzz(d.buzz);
    };
    return () => ch.close();
  }, [receiveBuzz]);

  // ---- roster: demo barbers + signed-up barbers (+ owner who also cuts) ----
  const barbers = useMemo<Barber[]>(() => {
    const staff = users
      .filter((u) => u.role === "barber" || (u.role === "admin" && u.cutsHair))
      .map((u) => ({ id: u.id, name: u.name.split(" ")[0] || u.name, initials: initialsOf(u.name) }));
    return [...(SEED_DEMO ? demoBarbers : []), ...staff];
  }, [users]);
  const barberById = useCallback((id: string) => barbers.find((b) => b.id === id), [barbers]);

  // ---- overlays ----
  const openOverlay = useCallback((o: OverlayState) => setOverlay(o), []);
  const closeOverlay = useCallback(() => setOverlay({ type: null }), []);

  // ---- booking + sales ----
  const addAppointment = useCallback((a: Omit<Appointment, "id">) => {
    const id = uid();
    setAppointments((prev) => [{ ...a, id }, ...prev]);
    return id;
  }, []);
  const cancelAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "Cancelled" } : a)));
  }, []);
  const recordSale = useCallback((s: Omit<Sale, "id" | "at"> & { at?: string }) => {
    setSales((prev) => [{ ...s, id: uid(), at: s.at ?? new Date().toISOString() }, ...prev]);
  }, []);

  // ---- chairs ----
  const setChairState = useCallback((chairId: string, state: ChairState) => {
    setChairs((prev) => prev.map((c) => (c.id === chairId ? { ...c, state } : c)));
  }, []);
  const setBarberChairState = useCallback((barberId: string, state: ChairState) => {
    setChairs((prev) => prev.map((c) => (c.barberId === barberId ? { ...c, state } : c)));
  }, []);

  const buzzChair = useCallback(
    (chairId: string) => {
      const chair = chairs.find((c) => c.id === chairId);
      if (!chair || !chair.barberId) return;
      const chairName = `${barberById(chair.barberId)?.name ?? "Your barber"}'s chair`;
      setChairState(chairId, "ALMOST_READY");
      buzzRef.current?.postMessage({ from: senderId.current, buzz: chairName });
      pushToast({ kind: "success", title: "Buzzer sent", body: `Notified the customer that ${chairName} is ready.` });
    },
    [chairs, barberById, setChairState, pushToast]
  );

  const addChair = useCallback(() => {
    setChairs((prev) => {
      const n = prev.reduce((m, c) => Math.max(m, Number(c.id.replace("chair-", "")) || 0), 0) + 1;
      return [...prev, { id: `chair-${n}`, name: `Chair ${n}`, barberId: null, state: "IDLE", incognito: false }];
    });
  }, []);
  const removeChair = useCallback(
    (chairId: string): Err => {
      const c = chairs.find((x) => x.id === chairId);
      if (!c) return null;
      if (c.barberId) return "Clock the barber out of this chair first.";
      if (chairs.length <= 1) return "The shop needs at least one chair.";
      setChairs((prev) => prev.filter((x) => x.id !== chairId));
      return null;
    },
    [chairs]
  );

  // ---- queue (keeps chair state in step so availability updates everywhere) ----
  const setQueueStatus = useCallback(
    (id: string, status: QueueStatus) => {
      const entry = queue.find((q) => q.id === id);
      setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, status, estimatedWait: status === "WAITING" ? q.estimatedWait : 0 } : q)));
      if (entry) {
        if (status === "IN_CHAIR") setBarberChairState(entry.barberId, "IN_SERVICE");
        if (status === "DONE") setBarberChairState(entry.barberId, "IDLE");
      }
    },
    [queue, setBarberChairState]
  );
  const callNext = useCallback(
    (barberId: string) => {
      const next = queue.find((q) => q.barberId === barberId && q.status === "WAITING");
      if (next) setQueueStatus(next.id, "IN_CHAIR");
    },
    [queue, setQueueStatus]
  );
  const addWalkIn = useCallback((name: string, barberId: string) => {
    setQueue((prev) => [
      ...prev,
      { id: uid(), name: `Walk-in · ${name}`, barberId, status: "WAITING", estimatedWait: 20 },
    ]);
  }, []);

  // ---- time clock ----
  const openEntryFor = useCallback(
    (barberId: string) => timeEntries.find((e) => e.barberId === barberId && !e.clockOut),
    [timeEntries]
  );
  const chairOf = useCallback((barberId: string) => chairs.find((c) => c.barberId === barberId), [chairs]);

  const clockIn = useCallback(
    (barberId: string, chairId: string, incognito: boolean): Err => {
      if (openEntryFor(barberId)) return "You're already clocked in.";
      const chair = chairs.find((c) => c.id === chairId);
      if (!chair) return "Pick a chair.";
      if (chair.barberId) return "That chair was just taken. Pick another.";
      setChairs((prev) =>
        prev.map((c) => (c.id === chairId ? { ...c, barberId, incognito, state: "IDLE" } : c))
      );
      setTimeEntries((prev) => [
        { id: uid(), barberId, chairId, clockIn: new Date().toISOString(), clockOut: null, incognito },
        ...prev,
      ]);
      return null;
    },
    [chairs, openEntryFor]
  );

  const clockOut = useCallback(
    (barberId: string): Err => {
      const entry = openEntryFor(barberId);
      if (!entry) return "You're not clocked in.";
      if (privateSessions.some((p) => p.barberId === barberId && p.status === "ACTIVE"))
        return "Finish your active private session first.";
      if (queue.some((q) => q.barberId === barberId && q.status === "IN_CHAIR"))
        return "Finish the client in your chair first.";

      // hand any waiting walk-ins to the floor barber with the lightest line
      const others = chairs.filter((c) => c.barberId && c.barberId !== barberId && !c.incognito).map((c) => c.barberId as string);
      if (others.length) {
        const load = (id: string) => queue.filter((q) => q.barberId === id && q.status === "WAITING").length;
        const target = others.reduce((a, b) => (load(b) < load(a) ? b : a));
        setQueue((prev) => prev.map((q) => (q.barberId === barberId && q.status === "WAITING" ? { ...q, barberId: target } : q)));
      }

      setChairs((prev) =>
        prev.map((c) => (c.barberId === barberId ? { ...c, barberId: null, incognito: false, state: "IDLE" } : c))
      );
      setTimeEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, clockOut: new Date().toISOString() } : e))
      );
      return null;
    },
    [openEntryFor, privateSessions, queue, chairs]
  );

  const setIncognito = useCallback(
    (barberId: string, on: boolean): Err => {
      const entry = openEntryFor(barberId);
      if (!entry) return "Clock in first.";
      if (!on && privateSessions.some((p) => p.barberId === barberId && p.status === "ACTIVE"))
        return "Finish your active private session first.";
      if (on && queue.some((q) => q.barberId === barberId && q.status === "IN_CHAIR"))
        return "Finish the client in your chair first.";
      setChairs((prev) => prev.map((c) => (c.barberId === barberId ? { ...c, incognito: on } : c)));
      setTimeEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, incognito: on } : e)));
      return null;
    },
    [openEntryFor, privateSessions, queue]
  );

  const startPrivateSession = useCallback(
    (barberId: string, s: { client: string; note: string; price: number }): Err => {
      const chair = chairs.find((c) => c.barberId === barberId);
      if (!chair || !chair.incognito) return "Turn incognito on first.";
      if (privateSessions.some((p) => p.barberId === barberId && p.status === "ACTIVE"))
        return "You already have a private session running.";
      if (!(s.price >= 0)) return "Enter a valid price.";
      setPrivateSessions((prev) => [
        {
          id: uid(),
          barberId,
          chairId: chair.id,
          client: s.client.trim() || "Private client",
          note: s.note.trim(),
          price: Math.round(s.price * 100) / 100,
          startedAt: new Date().toISOString(),
          status: "ACTIVE",
        },
        ...prev,
      ]);
      setChairState(chair.id, "IN_SERVICE");
      return null;
    },
    [chairs, privateSessions, setChairState]
  );

  const completePrivateSession = useCallback(
    (id: string) => {
      const s = privateSessions.find((p) => p.id === id);
      if (!s || s.status === "DONE") return;
      setPrivateSessions((prev) => prev.map((p) => (p.id === id ? { ...p, status: "DONE" } : p)));
      setChairState(s.chairId, "IDLE");
      recordSale({ amount: s.price, kind: "private", label: "Private session", barberId: s.barberId });
    },
    [privateSessions, setChairState, recordSale]
  );

  const cancelPrivateSession = useCallback(
    (id: string) => {
      const s = privateSessions.find((p) => p.id === id);
      if (!s || s.status !== "ACTIVE") return;
      setPrivateSessions((prev) => prev.filter((p) => p.id !== id));
      setChairState(s.chairId, "IDLE");
    },
    [privateSessions, setChairState]
  );

  // ---- messages / style / notifications ----
  const sendMessage = useCallback((m: { customerName: string; customerEmail?: string; body: string }) => {
    const body = m.body.trim();
    if (!body) return;
    setMessages((prev) => [
      {
        id: uid(),
        customerName: m.customerName,
        customerEmail: m.customerEmail,
        preview: body.length > 60 ? `${body.slice(0, 57)}…` : body,
        body,
        unread: true,
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      },
      ...prev,
    ]);
  }, []);
  const markRead = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, unread: false } : m)));
  }, []);

  const styleProfile = (user && styleProfiles[user.id]) || emptyStyleProfile;
  const updateStyleProfile = useCallback(
    (sp: StyleProfile) => {
      if (!user) return;
      setStyleProfiles((prev) => ({ ...prev, [user.id]: sp }));
      pushToast({ kind: "success", title: "Style profile saved" });
    },
    [user, pushToast]
  );

  const enableNotifications = useCallback(() => {
    try {
      if (!("Notification" in window)) {
        pushToast({ title: "Notifications not supported in this browser" });
        return;
      }
      Notification.requestPermission().then((p) => {
        setNotificationsOn(p === "granted");
        pushToast({
          kind: p === "granted" ? "success" : "info",
          title: p === "granted" ? "Notifications enabled" : "Notifications blocked",
        });
      });
    } catch {
      /* ignore */
    }
  }, [pushToast]);

  const value: DemoContextValue = {
    hydrated,
    queue,
    chairs,
    appointments,
    messages,
    timeEntries,
    privateSessions,
    sales,
    styleProfiles,
    barbers,
    barberById,
    overlay,
    toasts,
    notificationsOn,
    styleProfile,
    openOverlay,
    closeOverlay,
    pushToast,
    dismissToast,
    addAppointment,
    cancelAppointment,
    recordSale,
    setQueueStatus,
    callNext,
    addWalkIn,
    setChairState,
    buzzChair,
    addChair,
    removeChair,
    openEntryFor,
    chairOf,
    clockIn,
    clockOut,
    setIncognito,
    startPrivateSession,
    completePrivateSession,
    cancelPrivateSession,
    sendMessage,
    markRead,
    updateStyleProfile,
    enableNotifications,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
