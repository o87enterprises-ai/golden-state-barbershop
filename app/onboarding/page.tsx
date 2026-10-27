"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Armchair, Bell, Check, Copy, EyeOff, Minus, Plus, Scissors, Timer, Trash2 } from "lucide-react";
import { homeFor, useAuth } from "@/lib/auth/AuthStore";
import { useDemo } from "@/lib/mock/DemoStore";
import { StyleProfile, emptyStyleProfile } from "@/lib/mock/data";
import { AuthShell, GoldButton, Label, Spinner, inputCls } from "@/components/auth/ui";

type Patch = Parameters<ReturnType<typeof useAuth>["updateUser"]>[0];

const FADES = ["Skin fade", "Taper fade", "Low fade", "Mid fade", "High fade", "Scissor cut", "Not sure — ask me"];

function Dots({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-6 flex items-center gap-2" aria-label={`Step ${step + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-brand-gold" : "bg-white/10"}`} />
      ))}
    </div>
  );
}

function Nav({ step, last, onBack, onNext, nextLabel, disabled }: { step: number; last: boolean; onBack: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean }) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      <button type="button" onClick={onBack} disabled={step === 0} className="font-sans text-sm uppercase tracking-wider text-white/50 hover:text-white disabled:opacity-20">
        Back
      </button>
      <div className="w-48">
        <GoldButton type="button" onClick={onNext} disabled={disabled}>
          {nextLabel ?? (last ? "Finish" : "Continue")}
        </GoldButton>
      </div>
    </div>
  );
}

// ---------- Customer ----------
function CustomerOnboarding({ finish }: { finish: (patch?: Patch) => void }) {
  const { updateStyleProfile, enableNotifications, notificationsOn } = useDemo();
  const [step, setStep] = useState(0);
  const [sp, setSp] = useState<StyleProfile>({ ...emptyStyleProfile, fadeType: FADES[0] });
  const set = (k: keyof StyleProfile, v: string) => setSp((p) => ({ ...p, [k]: v }));

  const done = () => {
    updateStyleProfile(sp);
    finish();
  };

  return (
    <AuthShell eyebrow="Customer onboarding" title={["Welcome", "Your Cut", "Little Things"][step]} wide>
      <Dots step={step} total={3} />
      {step === 0 && (
        <div className="space-y-4 font-sans text-sm text-white/70">
          <p>Two quick steps so your barber has your cut dialed in before you sit down.</p>
          <ul className="space-y-3">
            {[
              [Scissors, "Save your style once — every barber sees it."],
              [Timer, "Rebook your usual in a couple of taps."],
              [Bell, "Get a buzz the moment your chair is ready."],
            ].map(([Icon, text], i) => {
              const I = Icon as typeof Scissors;
              return (
                <li key={i} className="flex items-center gap-3 rounded-lg bg-brand-dark p-3">
                  <I size={18} className="shrink-0 text-brand-gold" /> {text as string}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="fade">Go-to cut</Label>
            <select id="fade" value={sp.fadeType} onChange={(e) => set("fadeType", e.target.value)} className={inputCls}>
              {FADES.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="guard">Clipper guard / length</Label>
            <input id="guard" value={sp.clipperGuard} onChange={(e) => set("clipperGuard", e.target.value)} placeholder="#2 on the sides, scissor on top" className={inputCls} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="lineup">Lineup</Label>
              <input id="lineup" value={sp.lineup} onChange={(e) => set("lineup", e.target.value)} placeholder="Sharp, natural…" className={inputCls} />
            </div>
            <div>
              <Label htmlFor="beard">Beard</Label>
              <input id="beard" value={sp.beard} onChange={(e) => set("beard", e.target.value)} placeholder="Short, defined cheek line" className={inputCls} />
            </div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="allergies">Allergies / sensitivities</Label>
            <input id="allergies" value={sp.allergies} onChange={(e) => set("allergies", e.target.value)} placeholder="Fragrance, certain products…" className={inputCls} />
          </div>
          <div>
            <Label htmlFor="notes">Anything else your barber should know?</Label>
            <textarea id="notes" rows={2} value={sp.notes} onChange={(e) => set("notes", e.target.value)} className={inputCls} />
          </div>
          <button type="button" onClick={enableNotifications} className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-brand-dark p-3 text-left font-sans text-sm text-white/70 hover:border-brand-gold/40">
            {notificationsOn ? <Check size={18} className="text-emerald-400" /> : <Bell size={18} className="text-brand-gold" />}
            {notificationsOn ? "Chair-ready alerts are on" : "Turn on chair-ready alerts (optional)"}
          </button>
        </div>
      )}
      <Nav step={step} last={step === 2} onBack={() => setStep((s) => s - 1)} onNext={() => (step === 2 ? done() : setStep((s) => s + 1))} nextLabel={step === 2 ? "Go to my account" : undefined} />
    </AuthShell>
  );
}

// ---------- Barber ----------
function BarberOnboarding({ finish }: { finish: (patch?: Patch) => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [specialties, setSpecialties] = useState(user?.profile?.specialties ?? "");
  const [bio, setBio] = useState(user?.profile?.bio ?? "");
  const [rate, setRate] = useState(String(user?.profile?.privateRate ?? ""));

  const done = () => {
    const n = Number(rate);
    finish({ profile: { specialties, bio, privateRate: rate && n >= 0 ? n : undefined } });
  };

  return (
    <AuthShell eyebrow="Barber onboarding" title={["Welcome to the Crew", "Your Profile", "How the Floor Works"][step]} wide>
      <Dots step={step} total={3} />
      {step === 0 && (
        <p className="font-sans text-sm leading-relaxed text-white/70">
          Hey {user?.name.split(" ")[0]} — you&apos;re on the team. Let&apos;s set up your profile, then show you how
          clocking in and picking your chair works.
        </p>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="spec">Specialties</Label>
            <input id="spec" value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="Skin fades, waves, beard sculpting…" className={inputCls} />
          </div>
          <div>
            <Label htmlFor="bio">Short bio</Label>
            <textarea id="bio" rows={2} value={bio} onChange={(e) => setBio(e.target.value)} className={inputCls} />
          </div>
          <div>
            <Label htmlFor="rate">Default private-client rate ($, optional)</Label>
            <input id="rate" type="number" min="0" step="1" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="80" className={inputCls} />
            <p className="mt-1 font-sans text-xs text-white/40">You can set a different price for every private session.</p>
          </div>
        </div>
      )}
      {step === 2 && (
        <ul className="space-y-3 font-sans text-sm text-white/70">
          {[
            [Timer, "Clock in", "Start your shift on the Time Clock and pick an open chair. Your chair and availability update across the app instantly."],
            [Armchair, "One barber per chair", "A taken chair can't be picked by anyone else until you clock out."],
            [EyeOff, "Incognito mode", "Reserve your chair for private or VIP clients. It shows as unavailable to the public — with no name attached — and you set your own price."],
          ].map(([Icon, h, t], i) => {
            const I = Icon as typeof Timer;
            return (
              <li key={i} className="flex gap-3 rounded-lg bg-brand-dark p-3">
                <I size={18} className="mt-0.5 shrink-0 text-brand-gold" />
                <span><span className="block font-semibold text-white">{h as string}</span>{t as string}</span>
              </li>
            );
          })}
        </ul>
      )}
      <Nav step={step} last={step === 2} onBack={() => setStep((s) => s - 1)} onNext={() => (step === 2 ? done() : setStep((s) => s + 1))} nextLabel={step === 2 ? "Open Time Clock" : undefined} />
    </AuthShell>
  );
}

// ---------- Owner ----------
function AdminOnboarding({ finish }: { finish: (patch?: Patch) => void }) {
  const { user, createInvite, invites, revokeInvite } = useAuth();
  const { chairs, addChair, removeChair, pushToast } = useDemo();
  const [step, setStep] = useState(0);
  const [cuts, setCuts] = useState(!!user?.cutsHair);
  const [inviteName, setInviteName] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = (code: string) => `${origin}/signup?role=barber&code=${code}`;

  const done = () => {
    finish({ cutsHair: cuts });
  };

  return (
    <AuthShell eyebrow="Owner setup" title={["Welcome, Boss", "Your Chairs", "Invite Your Barbers"][step]} wide>
      <Dots step={step} total={3} />
      {step === 0 && (
        <p className="font-sans text-sm leading-relaxed text-white/70">
          Let&apos;s get {user?.name.split(" ")[0]}&apos;s shop running. You&apos;ll set the number of chairs, then invite
          your barbers. You can change all of this later from the admin app.
        </p>
      )}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <Label>How many chairs does the shop have?</Label>
            <div className="flex items-center gap-4">
              <button type="button" aria-label="Fewer chairs" onClick={() => { const last = [...chairs].reverse().find((c) => !c.barberId); if (last) { const err = removeChair(last.id); if (err) pushToast({ title: err }); } }} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white/70 hover:border-brand-gold"><Minus size={16} /></button>
              <span className="w-10 text-center font-display text-4xl text-brand-gold">{chairs.length}</span>
              <button type="button" aria-label="More chairs" onClick={addChair} disabled={chairs.length >= 20} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white/70 hover:border-brand-gold disabled:opacity-30"><Plus size={16} /></button>
            </div>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-brand-dark p-3 font-sans text-sm text-white/70">
            <input type="checkbox" checked={cuts} onChange={(e) => setCuts(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-gold" />
            <span>I also cut hair — add me to the barber roster so I can use the time clock.</span>
          </label>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <p className="font-sans text-sm text-white/60">Create a one-time invite code for each barber. They sign up with it, so only people you invite can join the team.</p>
          <div className="flex gap-2">
            <input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Barber's name" className={inputCls} />
            <button type="button" onClick={() => { createInvite(inviteName); setInviteName(""); }} className="shrink-0 rounded-lg bg-brand-gold px-4 font-sans text-sm font-semibold text-black">Create</button>
          </div>
          <ul className="space-y-2">
            {invites.filter((i) => !i.usedBy).map((i) => (
              <li key={i.code} className="flex items-center justify-between gap-2 rounded-lg bg-brand-dark p-3 font-sans text-sm">
                <span><span className="text-white">{i.name}</span> · <span className="tracking-widest text-brand-gold">{i.code}</span></span>
                <span className="flex gap-1">
                  <button type="button" aria-label="Copy invite link" onClick={() => navigator.clipboard?.writeText(link(i.code)).then(() => pushToast({ kind: "success", title: "Invite link copied" }))} className="rounded p-1.5 text-white/50 hover:text-brand-gold"><Copy size={16} /></button>
                  <button type="button" aria-label="Revoke invite" onClick={() => revokeInvite(i.code)} className="rounded p-1.5 text-white/50 hover:text-brand-red"><Trash2 size={16} /></button>
                </span>
              </li>
            ))}
          </ul>
          <p className="font-sans text-xs text-white/40">Skip for now — you can invite barbers any time from Team in the admin app.</p>
        </div>
      )}
      <Nav step={step} last={step === 2} onBack={() => setStep((s) => s - 1)} onNext={() => (step === 2 ? done() : setStep((s) => s + 1))} nextLabel={step === 2 ? "Open Admin App" : undefined} />
    </AuthShell>
  );
}

export default function OnboardingPage() {
  const { ready, user, updateUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (user.onboarded) router.replace(homeFor(user));
  }, [ready, user, router]);

  if (!ready || !user || user.onboarded) return <Spinner label="Loading…" />;

  const finish = (patch: Patch = {}) => {
    updateUser({ ...patch, onboarded: true });
    router.replace(user.role === "admin" ? "/admin" : user.role === "barber" ? "/admin/clock" : "/portal");
  };

  if (user.role === "admin") return <AdminOnboarding finish={finish} />;
  if (user.role === "barber") return <BarberOnboarding finish={finish} />;
  return <CustomerOnboarding finish={finish} />;
}
