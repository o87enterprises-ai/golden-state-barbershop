#!/usr/bin/env node
// One-command launch. Run:  npm run launch
//
// Asks for the few things only the shop owner has (Stripe keys, Resend key,
// Google review link), then does everything else: creates the Stripe webhook,
// stores the settings in Vercel, builds the database, creates the staff logins,
// and publishes the live site.
//
// Safe to re-run: existing accounts are kept, settings are overwritten.
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import readline from "node:readline";
import Stripe from "stripe";

const sh = (cmd, opts = {}) =>
  execSync(cmd, { stdio: opts.quiet ? "pipe" : "inherit", encoding: "utf8", ...opts });
const out = (cmd) => sh(cmd, { quiet: true }).toString();
const say = (m) => console.log(`\n▶ ${m}`);
const die = (m) => {
  console.error(`\n✖ ${m}\n`);
  process.exit(1);
};

function ask(question, { secret = false, optional = false, def = "" } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (secret) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s);
        else rl.output.write("*".repeat(s.replace(/[\r\n]/g, "").length));
      };
    }
    const hint = def ? ` [${def}]` : optional ? " (press Enter to skip)" : "";
    rl.question(`${question}${hint}: `, (a) => {
      rl.close();
      if (secret) console.log("");
      const v = a.trim() || def;
      if (!v && !optional) {
        console.log("  This one is required.");
        return resolve(ask(question, { secret, optional, def }));
      }
      resolve(v);
    });
  });
}

function setEnv(name, value, { secret = false } = {}) {
  if (!value) return;
  sh(`vercel env add ${name} production --force --yes ${secret ? "--sensitive" : ""}`.trim(), {
    input: value,
    stdio: ["pipe", "pipe", "pipe"],
  });
  console.log(`  saved ${name}`);
}

async function main() {
  console.log("\nGolden State Barbershop — launch\n");

  // ---- Checks -----------------------------------------------------------
  try {
    out("vercel whoami");
  } catch {
    die("You're not signed in to Vercel. Run `vercel login`, then `npm run launch` again.");
  }
  if (!existsSync(".vercel/project.json")) die("Project isn't linked. Run `vercel link` first.");

  const existing = out("vercel env ls production");
  if (!/\bDATABASE_URL\b/.test(existing)) {
    die(
      "No database yet. In the Vercel dashboard open this project → Storage → Create Database → " +
        "Neon → Connect Project. Then run `npm run launch` again."
    );
  }

  // ---- Questions (the only things we can't do for the owner) ------------
  console.log("Have your Stripe, Resend and Google review details handy. Typing is hidden for keys.\n");
  const stripeSecret = await ask("Stripe secret key (starts with sk_live_)", { secret: true });
  if (!/^sk_(live|test)_/.test(stripeSecret)) die("That doesn't look like a Stripe secret key.");
  const stripePublic = await ask("Stripe publishable key (starts with pk_live_)");
  if (!/^pk_(live|test)_/.test(stripePublic)) die("That doesn't look like a Stripe publishable key.");
  const resendKey = await ask("Resend API key (starts with re_)", { secret: true });
  const reviewUrl = await ask("Google review link", { optional: true });
  const amazonTag = await ask("Amazon Associates store ID", { optional: true });
  const siteUrl = (
    await ask("Website address", { def: "https://goldenstatebarbershop.com" })
  ).replace(/\/$/, "");
  const fromEmail = await ask("Email receipts are sent from", {
    def: "Golden State Barbershop <hello@goldenstatebarbershop.com>",
  });

  if (stripeSecret.startsWith("sk_test_")) console.log("\n  Note: these are Stripe TEST keys. No real money will move.");

  // ---- Stripe webhook ---------------------------------------------------
  say("Connecting Stripe...");
  const stripe = new Stripe(stripeSecret);
  const hookUrl = `${siteUrl}/api/stripe/webhook`;
  let whsec;
  try {
    for (const w of (await stripe.webhookEndpoints.list({ limit: 100 })).data) {
      if (w.url === hookUrl) await stripe.webhookEndpoints.del(w.id);
    }
    const created = await stripe.webhookEndpoints.create({
      url: hookUrl,
      enabled_events: ["checkout.session.completed", "checkout.session.expired"],
    });
    whsec = created.secret;
  } catch (e) {
    die(`Stripe rejected the key: ${e.message}`);
  }
  console.log("  webhook created");

  // ---- Vercel settings --------------------------------------------------
  say("Saving settings...");
  setEnv("STRIPE_SECRET_KEY", stripeSecret, { secret: true });
  setEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", stripePublic);
  setEnv("STRIPE_WEBHOOK_SECRET", whsec, { secret: true });
  setEnv("RESEND_API_KEY", resendKey, { secret: true });
  setEnv("RECEIPT_FROM_EMAIL", fromEmail);
  setEnv("NEXT_PUBLIC_SITE_URL", siteUrl);
  setEnv("NEXT_PUBLIC_BUSINESS_NAME", "Golden State Barbershop");
  setEnv("GOOGLE_REVIEW_URL", reviewUrl);
  setEnv("NEXT_PUBLIC_GOOGLE_REVIEW_URL", reviewUrl);
  setEnv("NEXT_PUBLIC_AMAZON_TAG", amazonTag);
  if (!/\bCRON_SECRET\b/.test(existing)) setEnv("CRON_SECRET", randomBytes(32).toString("hex"), { secret: true });

  // ---- Database ---------------------------------------------------------
  say("Setting up the database...");
  sh("vercel env pull .env.launch --environment production --yes", { quiet: true });
  const dbLine = readFileSync(".env.launch", "utf8").match(/^DATABASE_URL="?([^"\r\n]+)"?/m);
  if (!dbLine) die("Couldn't read DATABASE_URL from Vercel.");
  const env = { ...process.env, DATABASE_URL: dbLine[1] };
  try {
    sh("npx prisma migrate deploy", { env });
    const seeded = sh("node prisma/seed.mjs", { env, quiet: true });
    if (seeded.includes("Created")) {
      writeFileSync("LAUNCH-CREDENTIALS.txt", seeded);
      console.log("  staff logins created → saved to LAUNCH-CREDENTIALS.txt (keep private)");
    } else console.log("  staff logins already exist");
  } finally {
    rmSync(".env.launch", { force: true });
  }

  // ---- Publish ----------------------------------------------------------
  say("Publishing the site...");
  sh("vercel deploy --prod --yes");

  say("Done.");
  console.log(`  Site:   ${siteUrl}`);
  console.log("  Health: " + siteUrl + "/api/health  (should say {\"ok\":true})");
  console.log("  Staff logins: LAUNCH-CREDENTIALS.txt\n");
}

main().catch((e) => die(e.message));
