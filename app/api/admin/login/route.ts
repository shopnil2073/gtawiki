import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  adminConfigured,
  checkPassword,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/admin-auth";

// Best-effort brute-force slowdown (per server instance).
const attempts = new Map<string, { count: number; first: number }>();

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not set on the server." }, { status: 500 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && now - rec.first < 15 * 60_000 && rec.count >= 8) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    /* empty body */
  }

  if (!(await checkPassword(password))) {
    const fresh = rec && now - rec.first < 15 * 60_000 ? rec : { count: 0, first: now };
    fresh.count += 1;
    attempts.set(ip, fresh);
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);
  return res;
}
