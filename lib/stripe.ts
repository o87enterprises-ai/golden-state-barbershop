import Stripe from "stripe";

// Created on first use so builds don't need STRIPE_SECRET_KEY.
let client: Stripe | null = null;

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    client ??= new Stripe(process.env.STRIPE_SECRET_KEY!);
    return Reflect.get(client, prop);
  },
});
