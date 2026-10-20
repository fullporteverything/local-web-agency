"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

type Kind = "contact" | "free_preview";

const inputClass =
  "w-full border-0 border-b border-white/15 bg-transparent px-0 py-3 text-lg text-ink placeholder:text-white/25 transition-colors focus:border-white/60 focus:outline-none focus:ring-0";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label text-white/45">{label}</span>
      {children}
      {hint && <span className="mt-2 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function LeadForm({ kind }: { kind: Kind }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, kind }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="glass hairline-frame rounded-3xl p-10 text-center">
        <CheckCircle2 className="mx-auto text-[var(--pine-strong)]" size={44} />
        <h3 className="mt-6 font-display text-4xl">Got it, thanks.</h3>
        <p className="mx-auto mt-3 max-w-md text-muted">
          {kind === "free_preview"
            ? "I'll put together a preview of your site and email you the link, usually within a day or two."
            : "I'll get back to you soon, usually the same business day."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass hairline-frame space-y-9 rounded-3xl p-7 sm:p-10">
      {/* Honeypot: real people never see or fill this. */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-9 sm:grid-cols-2">
        <Field label="Your name">
          <input name="name" required autoComplete="name" className={inputClass} />
        </Field>
        <Field label="Business name">
          <input name="business_name" required={kind === "free_preview"} autoComplete="organization" className={inputClass} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </Field>
        <Field label="Phone (optional)">
          <input name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </Field>
        <Field label="City">
          <input name="city" required={kind === "free_preview"} autoComplete="address-level2" placeholder="High Point" className={inputClass} />
        </Field>
        <Field label="Website or Facebook (optional)">
          <input name="current_url" type="text" inputMode="url" placeholder="facebook.com/yourbusiness" className={inputClass} />
        </Field>
      </div>
      <Field
        label={kind === "free_preview" ? "What does your business do?" : "How can I help?"}
        hint={kind === "free_preview" ? "A sentence or two is plenty. Services, area you cover, anything you're proud of." : undefined}
      >
        <textarea name="message" rows={3} required className={`${inputClass} resize-none`} />
      </Field>
      {state === "error" && <p className="text-sm text-[var(--clay)]">{error}</p>}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">No spam, no sharing your info. Opt out anytime.</p>
        <button
          type="submit"
          disabled={state === "sending"}
          className="btn-chrome label inline-flex w-full items-center justify-center gap-2.5 rounded-full px-7 py-4 !tracking-[0.22em] transition-transform hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto"
        >
          {state === "sending" ? <Loader2 size={14} className="animate-spin" /> : null}
          {kind === "free_preview" ? "Build my free preview" : "Send message"}
          {state !== "sending" && <ArrowRight size={14} />}
        </button>
      </div>
    </form>
  );
}
