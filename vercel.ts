import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  buildCommand: "npm run build",
  // Daily job that sends post-visit Google review requests.
  crons: [{ path: "/api/cron/reviews", schedule: "0 20 * * *" }],
};
