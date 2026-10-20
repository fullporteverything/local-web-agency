"use client";

import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

const configured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

export function MagicLinkForm({ next = "/portal" }: { next?: string }) {
  if (!configured) return <NotYet />;
  return <Form next={next} />;
}

function NotYet() {
  return <p className="mt-8 text-sm text-muted">Login isn&apos;t switched on yet. Please email us and we&apos;ll help.</p>;
}

function Form({ next }: { next: string }) {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      await signIn("email", { email: email.trim().toLowerCase(), redirectTo: next });
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="mt-8 flex gap-3 rounded-2xl border border-line bg-white/[0.04] p-4 text-sm">
        <MailCheck size={20} className="shrink-0 text-[var(--pine-strong)]" />
        <p>Check your email for a login link. It works once and expires in an hour.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@yourbusiness.com"
        autoComplete="email"
        className="w-full border-0 border-b border-white/15 bg-transparent px-0 py-3 text-lg placeholder:text-white/25 focus:border-white/60 focus:outline-none focus:ring-0"
      />
      {state === "error" && (
        <p className="text-sm text-[var(--clay)]">We couldn&apos;t send a link to that email. Use the email you signed up with, or contact us.</p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="btn-chrome label inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 !tracking-[0.22em] disabled:opacity-60"
      >
        {state === "sending" && <Loader2 size={16} className="animate-spin" />}
        Email me a login link
      </button>
    </form>
  );
}
