// Ownership + NDA copy shared by the gate overlay and the /nda page.
// This is a preview/approval build. All rights remain with o87 Enterprises
// until a signed service agreement transfers them.

export const OWNER = "o87 Enterprises";

export const NDA_VERSION = "1.0";

export const ownershipNotice =
  `This website, including all designs, code, copy, animations, and assets, ` +
  `is the exclusive property of ${OWNER}. It is provided solely for private ` +
  `review and approval. Ownership does not transfer to Golden State Barbershop ` +
  `or any other party until a written service agreement has been signed.`;

export const ndaClauses = [
  {
    heading: "1. Confidential Preview",
    body:
      `You are being given access to a confidential, pre-release preview of a ` +
      `website built by ${OWNER} for Golden State Barbershop. The preview is for ` +
      `evaluation and approval purposes only.`,
  },
  {
    heading: "2. Ownership",
    body: ownershipNotice,
  },
  {
    heading: "3. Non-Use",
    body:
      `You agree not to copy, reproduce, publish, deploy, repurpose, or otherwise ` +
      `use any part of this preview — in whole or in part — for any purpose other ` +
      `than reviewing it. You will not share access links or screenshots with any ` +
      `third party without written permission from ${OWNER}.`,
  },
  {
    heading: "4. No License Granted",
    body:
      `Nothing in this preview grants you any license, right, or interest in the ` +
      `work. Any such rights are granted only through a separate, signed service ` +
      `agreement with ${OWNER}.`,
  },
  {
    heading: "5. Mock / Non-Functional",
    body:
      `This is a visual mock. Booking, shop, checkout, and payment features are ` +
      `demonstrations only and do not process real data, appointments, or payments.`,
  },
];
