import { Resend } from "resend";
import { brand } from "./branding";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RECEIPT_FROM_EMAIL ?? `${brand.name} <hello@example.com>`;

export async function sendReceipt(opts: {
  to: string;
  customerName: string;
  serviceName: string;
  amountCents: number;
  when: Date;
}) {
  const amount = (opts.amountCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Your ${brand.name} receipt`,
    html: `
      <div style="font-family:system-ui;max-width:480px;margin:auto">
        <h2 style="color:${brand.colors.crimson}">${brand.name}</h2>
        <p>Thanks, ${opts.customerName} — here's your digital receipt.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td>Service</td><td style="text-align:right">${opts.serviceName}</td></tr>
          <tr><td>Date</td><td style="text-align:right">${opts.when.toLocaleString("en-US")}</td></tr>
          <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>${amount}</strong></td></tr>
        </table>
      </div>`,
  });
}

export async function sendReviewRequest(opts: {
  to: string;
  customerName: string;
}) {
  const reviewUrl = process.env.GOOGLE_REVIEW_URL ?? "#";
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `How was your cut at ${brand.name}?`,
    html: `
      <div style="font-family:system-ui;max-width:480px;margin:auto;text-align:center">
        <h2 style="color:${brand.colors.crimson}">${brand.name}</h2>
        <p>Hey ${opts.customerName} — hope you're loving the fresh cut.</p>
        <p>A 30-second Google review helps us a ton.</p>
        <a href="${reviewUrl}"
           style="display:inline-block;background:${brand.colors.crimson};color:#fff;
                  padding:12px 24px;border-radius:8px;text-decoration:none">
          Leave a review ★★★★★
        </a>
      </div>`,
  });
}
