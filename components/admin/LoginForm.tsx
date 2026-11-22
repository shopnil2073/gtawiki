"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { btnPrimaryCls, inputCls, labelCls } from "./ui";

export default function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(j.error ?? "Login failed.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-16 w-full max-w-sm border border-line bg-panel p-6">
      <p className="mono-label text-sunset">Restricted area</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-paper">Editor login</h1>
      {!configured && (
        <p className="mt-4 border border-neon-pink p-3 text-sm text-paper">
          <b className="text-neon-pink">ADMIN_PASSWORD is not set.</b> Add it to .env.local (and Vercel), then restart.
        </p>
      )}
      <label className={`${labelCls} mt-6`} htmlFor="pw">
        Password
      </label>
      <input
        id="pw"
        type="password"
        autoComplete="current-password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputCls}
      />
      {error && <p className="mt-3 text-sm text-neon-pink">{error}</p>}
      <button type="submit" disabled={busy || !configured || !password} className={`${btnPrimaryCls} mt-5 w-full`}>
        {busy ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}
