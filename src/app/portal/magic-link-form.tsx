"use client";

import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      setState("error");
      setError("The client portal isn't switched on yet. Please email us and we'll help.");
      return;
    }
    setState("sending");
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email,
      // Only existing clients can log in; accounts are created automatically at payment.
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/portal/auth/callback` },
    });
    if (error) {
      setState("error");
      setError("We couldn't find an account with that email. Use the email you paid with, or contact us.");
      return;
    }
    setState("sent");
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
      {state === "error" && <p className="text-sm text-[var(--clay)]">{error}</p>}
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
