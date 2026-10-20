import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-line bg-surface", className)}>{children}</div>;
}

export function CardHeader({ title, action, sub }: { title: React.ReactNode; action?: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const tones = {
  green: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
  amber: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
  red: "bg-rose-400/10 text-rose-300 ring-rose-400/20",
  blue: "bg-sky-400/10 text-sky-300 ring-sky-400/20",
  muted: "bg-white/5 text-muted ring-white/10",
} as const;
export type Tone = keyof typeof tones;

export function Badge({ tone = "muted", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Stat({ label, value, hint, accent }: { label: string; value: React.ReactNode; hint?: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-3.5">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={cn("mt-1.5 font-display text-3xl leading-none", accent && "text-[var(--pine-strong)]")}>{value}</p>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function ScoreDot({ score }: { score: number }) {
  const tone = score >= 85 ? "bg-emerald-400" : score >= 65 ? "bg-amber-400" : "bg-white/30";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs tabular-nums text-muted" title="Lead score">
      <span className={cn("h-1.5 w-1.5 rounded-full", tone)} />
      {score}
    </span>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-4xl leading-none sm:text-5xl">{title}</h1>
        {sub && <p className="mt-2 text-sm text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ title, body }: { title: string; body?: string }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="font-display text-2xl">{title}</p>
      {body && <p className="mt-1 text-sm text-muted">{body}</p>}
    </div>
  );
}

export function money(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: n % 1 ? 2 : 0 })}`;
}

export function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const future = diff < 0;
  const s = Math.abs(diff) / 1000;
  const v = s < 60 ? "now" : s < 3600 ? `${Math.round(s / 60)}m` : s < 86400 ? `${Math.round(s / 3600)}h` : `${Math.round(s / 86400)}d`;
  if (v === "now") return "just now";
  return future ? `in ${v}` : `${v} ago`;
}
