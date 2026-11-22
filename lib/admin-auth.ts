/**
 * Admin authentication: one password (ADMIN_PASSWORD) -> signed, HTTP-only session cookie.
 * Uses Web Crypto so the same code works in proxy.ts and in route handlers/pages.
 */
import { cookies } from "next/headers";

export const SESSION_COOKIE = "gw_admin";
const SESSION_SECONDS = 60 * 60 * 24 * 7; // 7 days

const enc = new TextEncoder();

function secretKey(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return (process.env.ADMIN_SESSION_SECRET || "") + "|" + pw;
}

async function hmacHex(key: string, message: string): Promise<string> {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

/** Constant-time password check. */
export async function checkPassword(input: string): Promise<boolean> {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  const [a, b] = await Promise.all([hmacHex("pw-check", input), hmacHex("pw-check", real)]);
  return safeEqual(a, b);
}

export async function createSessionToken(): Promise<string> {
  const key = secretKey();
  if (!key) throw new Error("ADMIN_PASSWORD is not set");
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  return `${exp}.${await hmacHex(key, String(exp))}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const key = secretKey();
  if (!key || !token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || exp < Date.now() / 1000) return false;
  return safeEqual(sig, await hmacHex(key, String(exp)));
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_SECONDS,
};

/** Use at the top of every admin page and route handler (defense in depth on top of proxy.ts). */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
