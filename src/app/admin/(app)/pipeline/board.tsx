"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Eye, Search } from "lucide-react";
import { useToast } from "@/components/admin/toast";
import { Badge, ScoreDot, money, timeAgo } from "@/components/admin/ui";
import { moveStage } from "@/lib/crm/actions";
import { allStages, boardColumns, nextActionLabels, stageLabels, stageTone, tierLabels } from "@/lib/crm/stages";
import type { Lead, Stage } from "@/lib/crm/types";
import { cn } from "@/lib/utils";

const select = "rounded-full border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-none";

export function Board({ leads: initial }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initial);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [tier, setTier] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [, start] = useTransition();
  const toast = useToast();

  const cities = useMemo(() => [...new Set(initial.map((l) => l.city).filter(Boolean))].sort() as string[], [initial]);
  const categories = useMemo(() => [...new Set(initial.map((l) => l.category).filter(Boolean))].sort() as string[], [initial]);

  const filtered = leads.filter(
    (l) =>
      (!q || l.name.toLowerCase().includes(q.toLowerCase())) &&
      (!city || l.city === city) &&
      (!category || l.category === category) &&
      (!tier || l.assessment?.recommended_tier === tier) &&
      l.lead_score >= minScore,
  );

  function move(id: string, stage: Stage) {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage, stage_changed_at: new Date().toISOString() } : l)));
    start(async () => {
      const r = await moveStage(id, stage);
      toast(r);
      if (!r.ok) setLeads(prev);
    });
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <label className="flex min-w-48 flex-1 items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 sm:flex-none">
          <Search size={15} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="w-full bg-transparent text-sm focus:outline-none" />
        </label>
        <select value={city} onChange={(e) => setCity(e.target.value)} className={select} aria-label="City">
          <option value="">All cities</option>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={select} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={tier} onChange={(e) => setTier(e.target.value)} className={select} aria-label="Tier">
          <option value="">All tiers</option>
          {Object.entries(tierLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className={select} aria-label="Minimum score">
          <option value={0}>Any score</option>
          <option value={50}>Score 50+</option>
          <option value={70}>Score 70+</option>
          <option value={85}>Score 85+</option>
        </select>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
        {boardColumns.map((col) => {
          const cards = filtered.filter((l) => col.stages.includes(l.stage)).sort((a, b) => b.lead_score - a.lead_score);
          return (
            <section
              key={col.key}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col.key);
              }}
              onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
              onDrop={() => {
                const lead = leads.find((l) => l.id === dragId);
                if (lead && !col.stages.includes(lead.stage)) move(lead.id, col.stages[0]);
                setDragId(null);
                setOverCol(null);
              }}
              className={cn(
                "flex w-[82vw] shrink-0 snap-start flex-col rounded-2xl border bg-[#0d0f0e] sm:w-72",
                overCol === col.key ? "border-emerald-400/40" : "border-line",
              )}
            >
              <header className="flex items-center justify-between px-4 py-3">
                <h2 className="text-sm font-medium">{col.label}</h2>
                <span className="text-xs tabular-nums text-muted">{cards.length}</span>
              </header>
              <div className="flex max-h-[68vh] flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
                {cards.map((l) => (
                  <article
                    key={l.id}
                    draggable
                    onDragStart={() => setDragId(l.id)}
                    onDragEnd={() => setDragId(null)}
                    className={cn("rounded-xl border border-line bg-surface p-3 transition-opacity", dragId === l.id && "opacity-40")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/admin/leads/${l.id}`} className="text-sm font-medium leading-snug hover:underline">{l.name}</Link>
                      <ScoreDot score={l.lead_score} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{[l.category, l.city].filter(Boolean).join(" · ")}</p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <Badge tone={stageTone(l.stage)}>{stageLabels[l.stage]}</Badge>
                      {l.assessment?.recommended_tier && (
                        <Badge>{tierLabels[l.assessment.recommended_tier]} · {money(l.assessment.setup_price)}</Badge>
                      )}
                      {l.demo && l.demo.views > 0 && (
                        <Badge tone="green"><Eye size={11} /> {l.demo.views}</Badge>
                      )}
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2.5 text-xs text-muted">
                      <span className="truncate">
                        {l.next_action ? `${l.owner === "acen" ? "You: " : ""}${nextActionLabels[l.next_action] ?? l.next_action}` : "No next step"}
                        {l.next_action_at && ` · ${timeAgo(l.next_action_at)}`}
                      </span>
                      <select
                        value={l.stage}
                        onChange={(e) => move(l.id, e.target.value as Stage)}
                        className="max-w-[5.5rem] shrink-0 rounded-md border border-line bg-transparent px-1 py-0.5 text-[11px] text-muted focus:outline-none"
                        aria-label={`Move ${l.name}`}
                      >
                        {allStages.map((s) => <option key={s} value={s}>{stageLabels[s]}</option>)}
                      </select>
                    </div>
                  </article>
                ))}
                {cards.length === 0 && <p className="px-2 py-6 text-center text-xs text-muted">Nothing here</p>}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
