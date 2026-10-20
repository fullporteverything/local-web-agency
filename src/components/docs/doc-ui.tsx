import { brand } from "@/config/brand";
import { LogoMark } from "@/components/site/ui";
import { cn } from "@/lib/utils";

// Building blocks for client documents: dark and minimal on screen, clean black-on-white when printed.

export function DocPage({
  title,
  number,
  meta,
  children,
}: {
  title: string;
  number: string;
  meta: [string, string][];
  children: React.ReactNode;
}) {
  return (
    <article className="doc-page mx-auto w-full max-w-[52rem] rounded-2xl border border-line bg-[#0e0f0e] px-6 py-10 sm:px-12 sm:py-14">
      <header className="flex flex-col justify-between gap-6 border-b border-line pb-8 sm:flex-row">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark size={20} />
            <span className="label !text-[0.72rem] !tracking-[0.3em] text-ink">{brand.name}</span>
          </div>
          <p className="mt-2 text-xs text-muted">{brand.email}{brand.phone && ` · ${brand.phone}`}</p>
        </div>
        <div className="sm:text-right">
          <p className="label text-white/40">{number}</p>
          <h1 className="mt-1 font-display text-4xl leading-none sm:text-5xl">{title}</h1>
          <dl className="mt-3 space-y-0.5 text-xs text-muted">
            {meta.map(([k, v]) => (
              <div key={k} className="flex gap-2 sm:justify-end">
                <dt className="text-white/35">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>
      <div className="space-y-10 pt-10">{children}</div>
      <footer className="mt-14 flex flex-col justify-between gap-2 border-t border-line pt-5 text-[11px] text-white/35 sm:flex-row">
        <span>{brand.name}{brand.mailingAddress && ` · ${brand.mailingAddress}`}</span>
        <span>Questions? {brand.email}</span>
      </footer>
    </article>
  );
}

export function Section({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("doc-section", className)}>
      <h2 className="label mb-4 text-white/40">{label}</h2>
      {children}
    </section>
  );
}

export function Fields({ items, cols = 2 }: { items: [string, React.ReactNode][]; cols?: 2 | 3 }) {
  return (
    <dl className={cn("grid gap-x-8 gap-y-5", cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      {items.map(([k, v]) => (
        <div key={k} className="border-b border-line pb-3">
          <dt className="text-[11px] uppercase tracking-[0.18em] text-white/35">{k}</dt>
          <dd className="mt-1.5 text-sm text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Steps({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ol className="border-t border-line">
      {items.map((s, i) => (
        <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-line py-4 sm:grid-cols-[3rem_12rem_1fr]">
          <span className="font-display text-xl italic text-white/30">{String(i + 1).padStart(2, "0")}</span>
          <span className="text-sm font-medium">{s.title}</span>
          <span className="col-span-2 text-sm text-muted sm:col-span-1">{s.body}</span>
        </li>
      ))}
    </ol>
  );
}

export function Callout({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "accent" }) {
  return (
    <div className={cn("rounded-xl border px-5 py-4 text-sm leading-relaxed", tone === "accent" ? "border-[var(--pine)]/40 bg-[var(--pine)]/[0.06]" : "border-line bg-white/[0.02]")}>
      {children}
    </div>
  );
}

export function Checklist({ items }: { items: { label: string; note?: string }[] }) {
  return (
    <ul className="grid gap-x-8 sm:grid-cols-2">
      {items.map((it) => (
        <li key={it.label} className="flex gap-3 border-b border-line py-3 text-sm">
          <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/30" aria-hidden />
          <span>
            {it.label}
            {it.note && <span className="block text-xs text-muted">{it.note}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[30rem] text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            {head.map((h) => (
              <th key={h} className="pb-3 pr-4 text-[11px] font-normal uppercase tracking-[0.18em] text-white/35">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line">
              {r.map((c, j) => (
                <td key={j} className="py-3 pr-4 align-top">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Shows a value, or a visible placeholder when we don't have it yet. */
export function V({ children, fallback = "To be confirmed" }: { children: React.ReactNode; fallback?: string }) {
  const empty = children === null || children === undefined || children === "" || (Array.isArray(children) && children.length === 0);
  return empty ? <span className="text-white/35">[{fallback}]</span> : <>{children}</>;
}
