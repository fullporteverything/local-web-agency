"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, Phone, Star } from "lucide-react";
import { useToast } from "@/components/admin/toast";
import { Badge, Card, money, timeAgo } from "@/components/admin/ui";
import { logCallOutcome } from "@/lib/crm/actions";
import { callOutcomes, type CallOutcome } from "@/lib/crm/call-outcomes";
import type { callScript } from "@/lib/crm/script";
import { presenceLabels, stageLabels, tierLabels } from "@/lib/crm/stages";
import type { CallLog, Lead, Message } from "@/lib/crm/types";
import { cn } from "@/lib/utils";

type Item = { lead: Lead; script: ReturnType<typeof callScript>; calls: CallLog[]; lastMessages: Message[] };

export function CallQueue({ items, startIndex }: { items: Item[]; startIndex: number }) {
  const [i, setI] = useState(startIndex);
  const [notes, setNotes] = useState("");
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<CallOutcome | null>(null);
  const toast = useToast();
  const { lead, script, calls, lastMessages } = items[i];
  const a = lead.assessment;

  function log(outcome: CallOutcome) {
    setBusy(outcome);
    start(async () => {
      const r = await logCallOutcome(lead.id, outcome, notes);
      toast(r);
      setBusy(null);
      if (r.ok) {
        setNotes("");
        if (i < items.length - 1) setI(i + 1);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-3 flex items-center justify-between text-sm text-muted">
        <button disabled={i === 0} onClick={() => setI(i - 1)} className="flex items-center gap-1 disabled:opacity-30"><ChevronLeft size={16} /> Prev</button>
        <span className="tabular-nums">{i + 1} of {items.length}</span>
        <button disabled={i === items.length - 1} onClick={() => setI(i + 1)} className="flex items-center gap-1 disabled:opacity-30">Next <ChevronRight size={16} /></button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={lead.stage === "call_booked" ? "green" : "amber"}>{stageLabels[lead.stage]}</Badge>
            {lead.web_presence && <Badge>{presenceLabels[lead.web_presence]}</Badge>}
            {lead.is_family_business && <Badge>Family business</Badge>}
          </div>
          <h2 className="mt-3 font-display text-4xl leading-tight">{lead.name}</h2>
          <p className="mt-1 text-sm text-muted">
            {[lead.category, lead.city].filter(Boolean).join(" · ")}
            {lead.contact_name && ` · Ask for ${lead.contact_name.split(" ")[0]}`}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <Star size={14} className="fill-amber-400 text-amber-400" /> {lead.google_rating} · {lead.review_count} reviews
          </p>

          {lead.phone ? (
            <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 py-4 text-lg font-semibold text-[#04140b] active:scale-[0.99]">
              <Phone size={20} /> Call {lead.phone}
            </a>
          ) : (
            <p className="mt-5 rounded-2xl border border-line py-4 text-center text-sm text-muted">No phone number on file.</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted">Price</p>
              <p className="mt-1 font-display text-2xl">{money(a?.setup_price)} <span className="text-base text-muted">+ {money(a?.monthly_price)}/mo</span></p>
              {a?.recommended_tier && <p className="text-xs text-muted">{tierLabels[a.recommended_tier]} tier</p>}
            </div>
            <div className="rounded-xl border border-line p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted">Demo</p>
              {lead.demo?.url ? (
                <>
                  <a href={lead.demo.url} target="_blank" rel="noopener" className="mt-1 flex items-center gap-1 text-sm hover:underline">Open preview <ExternalLink size={12} /></a>
                  <p className="text-xs text-muted">{lead.demo.views} views{lead.demo.last_viewed_at && `, last ${timeAgo(lead.demo.last_viewed_at)}`}</p>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted">Not built yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-line bg-white/[0.02] p-5">
          <p className="text-[11px] uppercase tracking-wider text-muted">Script</p>
          <ol className="mt-3 space-y-3 text-[15px] leading-relaxed">
            {[script.opener, script.pitch, script.price, script.close].map((line, n) => (
              <li key={n} className="flex gap-3"><span className="text-muted">{n + 1}.</span><span>{line}</span></li>
            ))}
          </ol>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted hover:text-ink">If they say…</summary>
            <dl className="mt-3 space-y-2.5 text-sm">
              {script.objections.map((o) => (
                <div key={o.q}>
                  <dt className="font-medium">“{o.q}”</dt>
                  <dd className="text-muted">{o.a}</dd>
                </div>
              ))}
            </dl>
          </details>
        </div>

        <div className="border-t border-line p-5">
          <p className="text-[11px] uppercase tracking-wider text-muted">How did it go?</p>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="mt-3 w-full rounded-xl border border-line bg-transparent px-3 py-2 text-sm focus:border-white/30 focus:outline-none" />
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(Object.keys(callOutcomes) as CallOutcome[]).map((k) => (
              <button
                key={k}
                disabled={pending}
                onClick={() => log(k)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm transition-colors disabled:opacity-50",
                  k === "wants_payment_link" || k === "interested_send_link" ? "border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/10"
                    : k === "not_interested" || k === "wrong_number" ? "border-rose-400/25 text-rose-200 hover:bg-rose-400/10"
                    : "border-line hover:bg-white/5",
                )}
              >
                {busy === k && <Loader2 size={14} className="animate-spin" />}
                {callOutcomes[k].label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Each button sends the right follow-up automatically and moves to the next call.</p>
        </div>

        {(calls.length > 0 || lastMessages.length > 0) && (
          <div className="border-t border-line p-5">
            <p className="text-[11px] uppercase tracking-wider text-muted">History</p>
            <ul className="mt-3 space-y-2 text-sm">
              {calls.map((c) => (
                <li key={c.id} className="text-muted">
                  Call {c.outcome ? c.outcome.replaceAll("_", " ") : c.scheduled_at ? `booked for ${new Date(c.scheduled_at).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })}` : ""} · {timeAgo(c.created_at)}
                </li>
              ))}
              {lastMessages.map((m) => (
                <li key={m.id} className="truncate text-muted">
                  {m.direction === "inbound" ? "They wrote" : "We sent"}: {m.body} · {timeAgo(m.created_at)}
                </li>
              ))}
            </ul>
            <Link href={`/admin/leads/${lead.id}`} className="mt-3 inline-block text-sm text-muted hover:text-ink">Full lead details →</Link>
          </div>
        )}
      </Card>
    </div>
  );
}
