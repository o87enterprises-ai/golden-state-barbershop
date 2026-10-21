"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Role,
  QueueEntry,
  QueueStatus,
  Chair,
  ChairState,
  Appointment,
  Message,
  StyleProfile,
  Product,
  barberById,
  seedAppointments,
  seedQueue,
  seedChairs,
  seedMessages,
  defaultStyleProfile,
} from "./data";

export type CartItem = { product: Product; qty: number };

export type OverlayType = "book" | "shop" | "tap" | "stripe" | "share" | null;
export type OverlayState = {
  type: OverlayType;
  amount?: number;
  context?: string;
  onDone?: () => void;
};

export type Toast = { id: string; title: string; body?: string; kind?: "info" | "success" | "buzz" };

type Shareable = {
  queue: QueueEntry[];
  chairs: Chair[];
  appointments: Appointment[];
  messages: Message[];
};

type DemoState = Shareable & {
  role: Role;
  cart: CartItem[];
  styleProfile: StyleProfile;
  overlay: OverlayState;
  toasts: Toast[];
  notificationsOn: boolean;
};

type DemoContextValue = DemoState & {
  setRole: (r: Role) => void;
  // cart
  addToCart: (p: Product) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  // overlays
  openOverlay: (o: OverlayState) => void;
  closeOverlay: () => void;
  // toasts
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  // booking
  addAppointment: (a: Omit<Appointment, "id">) => void;
  // queue
  setQueueStatus: (id: string, status: QueueStatus) => void;
  callNext: (barberId: string) => void;
  addWalkIn: (name: string, barberId: string) => void;
  // chairs
  setChairState: (barberId: string, state: ChairState) => void;
  buzzChair: (barberId: string) => void;
  // messages
  markRead: (id: string) => void;
  // style
  updateStyleProfile: (sp: StyleProfile) => void;
  // notifications
  enableNotifications: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);
export const useDemo = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within <DemoStore>");
  return ctx;
};

const LS_KEY = "gsb-demo-state-v1";
const CHANNEL = "gsb-demo";
const uid = () => Math.random().toString(36).slice(2, 9);

export default function DemoStore({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("public");
  const [queue, setQueue] = useState<QueueEntry[]>(seedQueue);
  const [chairs, setChairs] = useState<Chair[]>(seedChairs);
  const [appointments, setAppointments] = useState<Appointment[]>(seedAppointments);
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [styleProfile, setStyleProfile] = useState<StyleProfile>(defaultStyleProfile);
  const [overlay, setOverlay] = useState<OverlayState>({ type: null });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notificationsOn, setNotificationsOn] = useState(false);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const senderId = useRef(uid());
  const applyingRemote = useRef(false);

  // ---- toasts ----
  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const id = uid();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5000);
  }, []);
  const dismissToast = useCallback(
    (id: string) => setToasts((prev) => prev.filter((x) => x.id !== id)),
    []
  );

  // ---- hydrate from localStorage ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.role) setRoleState(s.role);
        if (s.queue) setQueue(s.queue);
        if (s.chairs) setChairs(s.chairs);
        if (s.appointments) setAppointments(s.appointments);
        if (s.messages) setMessages(s.messages);
        if (s.cart) setCart(s.cart);
        if (s.styleProfile) setStyleProfile(s.styleProfile);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // ---- persist ----
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ role, queue, chairs, appointments, messages, cart, styleProfile })
      );
    } catch {
      /* ignore */
    }
  }, [role, queue, chairs, appointments, messages, cart, styleProfile]);

  // ---- broadcast channel for cross-tab live sync ----
  const broadcast = useCallback((payload: Record<string, unknown>) => {
    channelRef.current?.postMessage({ from: senderId.current, ...payload });
  }, []);

  const playBuzz = useCallback(() => {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = new Ctx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "square";
      osc.frequency.value = 220;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
      osc.frequency.setValueAtTime(220, ac.currentTime);
      osc.frequency.setValueAtTime(330, ac.currentTime + 0.12);
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
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const ch = new BroadcastChannel(CHANNEL);
    channelRef.current = ch;
    ch.onmessage = (e) => {
      const d = e.data as Record<string, unknown> & { from?: string };
      if (d.from === senderId.current) return;
      applyingRemote.current = true;
      if (d.queue) setQueue(d.queue as QueueEntry[]);
      if (d.chairs) setChairs(d.chairs as Chair[]);
      if (d.appointments) setAppointments(d.appointments as Appointment[]);
      if (d.messages) setMessages(d.messages as Message[]);
      if (d.buzz) receiveBuzz(d.buzz as string);
      applyingRemote.current = false;
    };
    return () => ch.close();
  }, [receiveBuzz]);

  // broadcast shareable slices when they change locally
  useEffect(() => {
    if (applyingRemote.current) return;
    broadcast({ queue });
  }, [queue, broadcast]);
  useEffect(() => {
    if (applyingRemote.current) return;
    broadcast({ chairs });
  }, [chairs, broadcast]);
  useEffect(() => {
    if (applyingRemote.current) return;
    broadcast({ appointments });
  }, [appointments, broadcast]);
  useEffect(() => {
    if (applyingRemote.current) return;
    broadcast({ messages });
  }, [messages, broadcast]);

  // ---- actions ----
  const setRole = useCallback((r: Role) => setRoleState(r), []);

  const addToCart = useCallback((p: Product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.product.id === p.id);
      if (found) return prev.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { product: p, qty: 1 }];
    });
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.product.id === id ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);
  const removeFromCart = useCallback(
    (id: string) => setCart((prev) => prev.filter((i) => i.product.id !== id)),
    []
  );
  const clearCart = useCallback(() => setCart([]), []);
  const cartCount = cart.reduce((n, i) => n + i.qty, 0);
  const cartTotal = cart.reduce((n, i) => n + i.qty * i.product.price, 0);

  const openOverlay = useCallback((o: OverlayState) => setOverlay(o), []);
  const closeOverlay = useCallback(() => setOverlay({ type: null }), []);

  const addAppointment = useCallback((a: Omit<Appointment, "id">) => {
    setAppointments((prev) => [{ ...a, id: uid() }, ...prev]);
  }, []);

  const setQueueStatus = useCallback((id: string, status: QueueStatus) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
  }, []);
  const callNext = useCallback((barberId: string) => {
    setQueue((prev) => {
      const idx = prev.findIndex((q) => q.barberId === barberId && q.status === "WAITING");
      if (idx === -1) return prev;
      return prev.map((q, i) => (i === idx ? { ...q, status: "IN_CHAIR", estimatedWait: 0 } : q));
    });
  }, []);
  const addWalkIn = useCallback((name: string, barberId: string) => {
    setQueue((prev) => [
      ...prev,
      { id: uid(), name: `Walk-in · ${name}`, barberId, status: "WAITING", estimatedWait: 20 },
    ]);
  }, []);

  const setChairState = useCallback((barberId: string, state: ChairState) => {
    setChairs((prev) => prev.map((c) => (c.barberId === barberId ? { ...c, state } : c)));
  }, []);

  const buzzChair = useCallback(
    (barberId: string) => {
      const name = barberById(barberId)?.name ?? "Your barber";
      const chairName = `${name}'s chair`;
      setChairState(barberId, "ALMOST_READY");
      broadcast({ buzz: chairName });
      pushToast({ kind: "success", title: "Buzzer sent", body: `Notified the customer that ${chairName} is ready.` });
    },
    [broadcast, pushToast, setChairState]
  );

  const markRead = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, unread: false } : m)));
  }, []);

  const updateStyleProfile = useCallback((sp: StyleProfile) => {
    setStyleProfile(sp);
    pushToast({ kind: "success", title: "Style profile saved" });
  }, [pushToast]);

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
    role,
    queue,
    chairs,
    appointments,
    messages,
    cart,
    styleProfile,
    overlay,
    toasts,
    notificationsOn,
    setRole,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal,
    openOverlay,
    closeOverlay,
    pushToast,
    dismissToast,
    addAppointment,
    setQueueStatus,
    callNext,
    addWalkIn,
    setChairState,
    buzzChair,
    markRead,
    updateStyleProfile,
    enableNotifications,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
