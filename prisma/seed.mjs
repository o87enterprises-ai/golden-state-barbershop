// Seeds the menu services and the staff login accounts.
// Slugs match the storefront ids in lib/mock/data.ts so both stay in step.
//
// Run: npm run db:seed
//   - Passwords come from SEED_STAFF_PASSWORD when set (use this to pick one).
//   - Otherwise each new account gets a random temporary password, printed once.
//   - Existing accounts are left alone, so re-running never resets a password.
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

const SERVICES = [
  { slug: "classic", name: "Classic Cut", priceCents: 4000, minutes: 45 },
  { slug: "classic-beard", name: "Classic Cut with Beard", priceCents: 5000, minutes: 60 },
  { slug: "kids", name: "Kids Haircut", priceCents: 3000, minutes: 30 },
  { slug: "senior", name: "Seniors Haircut", priceCents: 3000, minutes: 30 },
  { slug: "beard-lineup", name: "Beard Trim & Line Up", priceCents: 2000, minutes: 30 },
  { slug: "lineup-edge", name: "Line Up & Edge", priceCents: 1500, minutes: 20 },
];

// One login per person. Andy owns the shop (and works a chair); the rest are
// barbers. Everyone lands on the shop app after signing in.
const STAFF = [
  { name: "Andy", email: "andy@goldenstatebarbershop.com", role: "ADMIN", cutsHair: true },
  { name: "Ever", email: "ever@goldenstatebarbershop.com", role: "BARBER", cutsHair: false },
  { name: "Andru", email: "andru@goldenstatebarbershop.com", role: "BARBER", cutsHair: false },
  { name: "Julio Cesar", email: "julio@goldenstatebarbershop.com", role: "BARBER", cutsHair: false },
  { name: "Marvin", email: "marvin@goldenstatebarbershop.com", role: "BARBER", cutsHair: false },
];

// Must match lib/auth/password.ts (scrypt$<saltHex>$<keyHex>).
function hashPassword(password) {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
function tempPassword(len = 14) {
  const bytes = randomBytes(len);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

async function seedServices() {
  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: { name: s.name, priceCents: s.priceCents, minutes: s.minutes, active: true },
      create: s,
    });
  }
  console.log(`Seeded ${SERVICES.length} services.`);
}

async function seedStaff() {
  const shared = process.env.SEED_STAFF_PASSWORD;
  if (shared && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(shared)) {
    throw new Error("SEED_STAFF_PASSWORD must be 8+ characters with a letter and a number.");
  }

  const created = [];
  for (const person of STAFF) {
    const existing = await prisma.user.findUnique({ where: { email: person.email } });
    if (existing) {
      console.log(`Kept existing account ${person.email}`);
      continue;
    }
    const password = shared ?? tempPassword();
    await prisma.user.create({
      data: {
        name: person.name,
        email: person.email,
        role: person.role,
        cutsHair: person.cutsHair,
        onboarded: true,
        passwordHash: hashPassword(password),
      },
    });
    created.push({ ...person, password });
  }

  if (created.length === 0) return;
  console.log(`\nCreated ${created.length} staff logins — save these now:\n`);
  for (const c of created) {
    console.log(`  ${c.name.padEnd(12)} ${c.role.padEnd(6)} ${c.email}  ${c.password}`);
  }
  console.log("\nSign in at /login. Passwords are stored only as hashes.");
}

async function main() {
  await seedServices();
  await seedStaff();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
