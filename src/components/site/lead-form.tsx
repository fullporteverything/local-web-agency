"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

type Kind = "contact" | "free_preview";

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-muted/70 focus:border-pine focus:outline-none";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
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
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <CheckCircle2 className="mx-auto text-pine" size={40} />
        <h3 className="mt-4 font-display text-2xl font-semibold">Got it, thanks.</h3>
        <p className="mt-2 text-muted">
          {kind === "free_preview"
            ? "I'll put together a preview of your site and email you the link, usually within a day or two."
            : "I'll get back to you soon, usually the same business day."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-line bg-surface p-6 sm:p-8">
      {/* Honeypot: real people never see or fill this. */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-5 sm:grid-cols-2">
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
        <Field label="Current website or Facebook (optional)">
          <input name="current_url" type="text" inputMode="url" placeholder="facebook.com/yourbusiness" className={inputClass} />
        </Field>
      </div>
      <Field
        label={kind === "free_preview" ? "What does your business do?" : "How can I help?"}
        hint={kind === "free_preview" ? "A sentence or two is plenty. Services, area you cover, anything you're proud of." : undefined}
      >
        <textarea name="message" rows={4} required className={inputClass} />
      </Field>
      {state === "error" && <p className="text-sm text-clay">{error}</p>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pine px-5 py-3 font-semibold text-white hover:bg-pine-strong disabled:opacity-60 sm:w-auto"
      >
        {state === "sending" && <Loader2 size={16} className="animate-spin" />}
        {kind === "free_preview" ? "Build my free preview" : "Send message"}
      </button>
      <p className="text-xs text-muted">No spam, no sharing your info. You can opt out anytime.</p>
    </form>
  );
}
