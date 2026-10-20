"use client";

import { useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { btn } from "@/components/admin/action-button";
import { useToast } from "@/components/admin/toast";
import { moveStage, overridePrice, sendManualMessage } from "@/lib/crm/actions";
import { allStages, stageLabels } from "@/lib/crm/stages";
import type { Stage } from "@/lib/crm/types";
import { cn } from "@/lib/utils";

const input = "w-full rounded-xl border border-line bg-transparent px-3 py-2 text-sm focus:border-white/30 focus:outline-none";

export function PriceOverride({ businessId, setup, monthly, familyCap }: { businessId: string; setup: number | null; monthly: number | null; familyCap: boolean }) {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState(String(setup ?? ""));
  const [m, setM] = useState(String(monthly ?? ""));
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const toast = useToast();
  const overCap = familyCap && (Number(s) > 500 || Number(m) > 100);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={cn(btn.base, btn.ghost)}>
        Change price
      </button>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await overridePrice({ businessId, setup: Number(s), monthly: Number(m), note });
          toast(r);
          if (r.ok) setOpen(false);
        });
      }}
      className="space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-muted">Setup ($)<input inputMode="numeric" value={s} onChange={(e) => setS(e.target.value.replace(/\D/g, ""))} className={cn(input, "mt-1")} /></label>
        <label className="text-xs text-muted">Monthly ($)<input inputMode="numeric" value={m} onChange={(e) => setM(e.target.value.replace(/\D/g, ""))} className={cn(input, "mt-1")} /></label>
      </div>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why? (teaches the AI, e.g. “barbers here can't do $400”)" className={input} />
      {overCap && <p className="text-xs text-rose-300">Family/solo businesses are capped at $500 setup and $100/month.</p>}
      <div className="flex gap-2">
        <button disabled={pending || overCap || !s || !m} className={cn(btn.base, btn.primary)}>
          {pending && <Loader2 size={14} className="animate-spin" />} Save price
        </button>
        <button type="button" onClick={() => setOpen(false)} className={cn(btn.base, "text-muted hover:text-ink")}>Cancel</button>
      </div>
      <p className="text-xs text-muted">A price already sent in an email never goes up. This applies to future emails and links.</p>
    </form>
  );
}

export function ManualMessage({ businessId, disabled }: { businessId: string; disabled: boolean }) {
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();
  const toast = useToast();
  if (disabled) return <p className="text-sm text-muted">No email on file. Use the Call Queue for this one.</p>;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await sendManualMessage(businessId, body);
          toast(r);
          if (r.ok) setBody("");
        });
      }}
      className="flex items-end gap-2"
    >
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} placeholder="Write them a message yourself…" className={cn(input, "resize-none")} />
      <button disabled={pending || !body.trim()} className={cn(btn.base, btn.primary, "h-10 w-10 shrink-0 p-0")} aria-label="Send">
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
      </button>
    </form>
  );
}

export function StagePicker({ businessId, stage }: { businessId: string; stage: Stage }) {
  const [value, setValue] = useState(stage);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      {pending && <Loader2 size={14} className="animate-spin" />}
      Move to
      <select
        value={value}
        onChange={(e) => {
          const next = e.target.value as Stage;
          const prev = value;
          setValue(next);
          start(async () => {
            const r = await moveStage(businessId, next);
            toast(r);
            if (!r.ok) setValue(prev);
          });
        }}
        className="rounded-full border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-none"
      >
        {allStages.map((s) => <option key={s} value={s}>{stageLabels[s]}</option>)}
      </select>
    </label>
  );
}
