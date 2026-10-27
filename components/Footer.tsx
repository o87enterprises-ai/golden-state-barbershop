"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock } from "lucide-react";
import { brand, fullAddress, telHref, mapsHref } from "@/lib/branding";
import { PREVIEW_MODE } from "@/lib/config";

// Lucide 1.x removed brand icons — inline SVG instead.
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const easing = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: easing },
  }),
};

const hoursRows = [
  { day: "Tuesday", value: brand.contact.hours.tue },
  { day: "Wednesday", value: brand.contact.hours.wed },
  { day: "Thursday", value: brand.contact.hours.thu },
  { day: "Friday", value: brand.contact.hours.fri },
  { day: "Saturday", value: brand.contact.hours.sat },
  { day: "Sunday", value: "Closed" },
  { day: "Monday", value: "Closed" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-brand-gold/20 bg-brand-dark">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-3 lg:gap-16">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <Link
            href="/"
            className="font-display text-4xl tracking-wide text-brand-gold transition-colors hover:text-brand-gold/80"
          >
            {brand.name}
          </Link>
          <p className="mt-4 max-w-xs font-sans text-sm leading-relaxed text-white/60">
            {brand.tagline} Walk-ins welcome, appointments preferred.
          </p>

          <div className="mt-6 flex items-center gap-4">
            <a
              href={brand.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Golden State Barbershop on Instagram"
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all hover:border-brand-gold hover:text-brand-gold"
            >
              <InstagramIcon size={18} />
            </a>
          </div>
        </motion.div>

        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <h3 className="font-display text-2xl tracking-wide text-white">Visit</h3>

          <ul className="mt-6 space-y-4 font-sans text-sm text-white/70">
            <li>
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 transition-colors hover:text-brand-gold"
              >
                <MapPin size={18} className="mt-0.5 shrink-0 text-brand-gold" />
                <span>{fullAddress}</span>
              </a>
            </li>
            <li>
              <a
                href={telHref}
                className="flex items-center gap-3 transition-colors hover:text-brand-gold"
              >
                <Phone size={18} className="shrink-0 text-brand-gold" />
                <span>{brand.contact.phone}</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${brand.contact.email}`}
                className="flex items-center gap-3 transition-colors hover:text-brand-gold"
              >
                <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[10px] font-bold text-brand-gold">
                  @
                </span>
                <span>{brand.contact.email}</span>
              </a>
            </li>
          </ul>
        </motion.div>

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <h3 className="flex items-center gap-2 font-display text-2xl tracking-wide text-white">
            <Clock size={18} className="text-brand-gold" />
            Hours
          </h3>

          <dl className="mt-6 space-y-2 font-sans text-sm">
            {hoursRows.map((row) => (
              <div
                key={row.day}
                className="flex items-center justify-between border-b border-white/5 pb-2 last:border-none"
              >
                <dt className="text-white/60">{row.day}</dt>
                <dd
                  className={
                    row.value === "Closed" ? "text-white/30" : "text-white/90"
                  }
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 font-sans text-xs text-white/40 sm:flex-row">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} {brand.name}.
            {PREVIEW_MODE && (
              <>
                {" "}This preview is the property of{" "}
                <span className="text-white/60">o87 Enterprises</span> until a
                service agreement is signed.
              </>
            )}
          </p>
          {PREVIEW_MODE ? (
            <Link
              href="/nda"
              className="whitespace-nowrap text-white/50 underline-offset-4 transition-colors hover:text-brand-gold hover:underline"
            >
              Non-Use Agreement
            </Link>
          ) : (
            <nav aria-label="Footer" className="flex gap-5">
              <Link href="/login" className="text-white/50 underline-offset-4 transition-colors hover:text-brand-gold hover:underline">Log in</Link>
              <Link href="/signup?role=barber" className="text-white/50 underline-offset-4 transition-colors hover:text-brand-gold hover:underline">Barber sign-up</Link>
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}