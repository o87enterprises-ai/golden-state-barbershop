import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// Server-side password hashing. scrypt with a per-user salt; the stored value is
// `scrypt$<saltHex>$<keyHex>` so parameters can change later without ambiguity.
const KEYLEN = 64;

const derive = (password: string, salt: Buffer) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEYLEN, (err, key) => (err ? reject(err) : resolve(key)));
  });

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const key = await derive(password, Buffer.from(saltHex, "hex"));
  return key.length === expected.length && timingSafeEqual(key, expected);
}

// Hash used to burn the same CPU time when the email doesn't exist, so login
// timing doesn't reveal which accounts are real.
export const DUMMY_HASH = `scrypt$${"00".repeat(16)}$${"00".repeat(KEYLEN)}`;
