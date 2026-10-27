// Build-time switches. Everything defaults to the production behaviour.

// Confidential-preview chrome (NDA gate, demo banner, watermark, noindex).
// Set NEXT_PUBLIC_PREVIEW_MODE=1 only for owner-approval preview deploys.
export const PREVIEW_MODE = process.env.NEXT_PUBLIC_PREVIEW_MODE === "1";

// Loads sample barbers, appointments, and sales so a preview looks lived-in.
// Never enable in production — a live shop starts empty.
export const SEED_DEMO = process.env.NEXT_PUBLIC_SEED_DEMO === "1";

// Amazon Associates store ID, e.g. "goldenstate-20". Links are untagged
// (and earn nothing) until this is set.
export const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "";

// Card payments are simulated until a processor is connected.
export const PAYMENTS_SIMULATED = process.env.NEXT_PUBLIC_PAYMENTS_LIVE !== "1";
