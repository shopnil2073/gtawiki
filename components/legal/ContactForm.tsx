"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/lib/site";

const TOPICS = ["Correction or fact-check", "Guide suggestion", "Partnership or press", "Copyright or takedown", "Privacy request", "Other"];

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("website")) return; // honeypot: bots fill this hidden field
    const subject = `[GTA Wiki] ${String(f.get("topic"))}`;
    const body = `Name: ${String(f.get("name"))}\nEmail: ${String(f.get("email"))}\n\n${String(f.get("message"))}`;
    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  const field =
    "mt-1.5 w-full border border-line bg-panel px-3.5 py-2.5 text-sm text-paper placeholder:text-mute focus:border-sunset focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-line bg-panel p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="mono-label block text-paper">
          Your name
          <input name="name" required maxLength={80} autoComplete="name" className={field} />
        </label>
        <label className="mono-label block text-paper">
          Your email
          <input name="email" type="email" required maxLength={120} autoComplete="email" className={field} />
        </label>
      </div>

      <label className="block mono-label block text-paper">
        Topic
        <select name="topic" className={field} defaultValue={TOPICS[0]}>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="block mono-label block text-paper">
        Message
        <textarea name="message" required minLength={10} maxLength={3000} rows={6} className={field} />
      </label>

      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <button
        type="submit"
        className="mono-label bg-sunset px-6 py-4 text-base hover:brightness-110"
      >
        Send message
      </button>

      {sent && (
        <p className="flex items-start gap-2 text-sm text-neon-cyan" role="status">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          Your email app should open with the message ready to send. If nothing opened, write to{" "}
          {siteConfig.email} directly.
        </p>
      )}
    </form>
  );
}
