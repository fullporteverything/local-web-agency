import { Check } from "lucide-react";
import { faq, tiers } from "@/config/brand";
import { cn } from "@/lib/utils";
import { ButtonLink } from "./ui";

export function PricingCards() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {tiers.map((tier) => {
        const featured = tier.key === "basic";
        return (
          <div
            key={tier.key}
            className={cn(
              "flex flex-col rounded-2xl border bg-surface p-6 sm:p-8",
              featured ? "border-pine shadow-[0_0_0_1px_var(--pine)]" : "border-line",
            )}
          >
            {featured && (
              <span className="mb-3 w-fit rounded-full bg-pine-soft px-3 py-1 text-xs font-semibold text-pine">
                Most small businesses start here
              </span>
            )}
            <h3 className="font-display text-2xl font-semibold">{tier.name}</h3>
            <p className="mt-2 text-sm text-muted">{tier.blurb}</p>
            <div className="mt-6 space-y-1">
              <p className="text-3xl font-semibold tracking-tight">{tier.setup}</p>
              <p className="text-sm text-muted">one-time setup, then {tier.monthly}</p>
            </div>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {tier.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check size={18} className="mt-0.5 shrink-0 text-pine" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <ButtonLink href="/free-preview" variant={featured ? "primary" : "secondary"} className="mt-8 w-full">
              Get a free preview
            </ButtonLink>
          </div>
        );
      })}
    </div>
  );
}

export function FaqList({ limit }: { limit?: number }) {
  const items = limit ? faq.slice(0, limit) : faq;
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
      {items.map((item) => (
        <details key={item.q} className="group p-5 sm:p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
            {item.q}
            <span className="text-xl text-muted transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export const steps = [
  {
    title: "We build you a preview",
    body: "Using what's already public about your business, like your Google listing and reviews, we build a real working preview of your site. Free, no strings.",
  },
  {
    title: "You look it over",
    body: "Check it on your phone. Want different photos, colors, or services? Just tell us and we'll change it before anything goes live.",
  },
  {
    title: "It goes live on your domain",
    body: "Once you're happy, it goes live on your own web address within a few days. We handle hosting, updates, and changes after that.",
  },
];

export function Steps() {
  return (
    <ol className="grid gap-6 md:grid-cols-3">
      {steps.map((step, i) => (
        <li key={step.title} className="rounded-2xl border border-line bg-surface p-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pine-soft font-display font-semibold text-pine">
            {i + 1}
          </span>
          <h3 className="mt-4 font-display text-xl font-semibold">{step.title}</h3>
          <p className="mt-2 text-muted">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

// Sample designs for fictional businesses, clearly labeled as such.
// Real client sites replace these automatically once clients go live and give permission.
export const sampleDesigns = [
  { business: "Your Lawn Care Co.", category: "Lawn care", accent: "#2f6b3a", tone: "#eef4ea" },
  { business: "Your Family Kitchen", category: "Restaurant", accent: "#a33a22", tone: "#fbeee8" },
  { business: "Your Roofing Co.", category: "Roofing", accent: "#1e3a5f", tone: "#e8eef6" },
];

export function SampleCard({ business, category, accent, tone }: (typeof sampleDesigns)[number]) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="aspect-[4/3] p-4" style={{ background: tone }}>
        <div className="h-full overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="flex items-center justify-between px-3 py-2" style={{ background: accent }}>
            <span className="text-[10px] font-semibold text-white">{business}</span>
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold" style={{ color: accent }}>
              Call now
            </span>
          </div>
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 rounded" style={{ background: accent, opacity: 0.85 }} />
            <div className="h-2 w-full rounded bg-neutral-200" />
            <div className="h-2 w-5/6 rounded bg-neutral-200" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((n) => (
                <div key={n} className="aspect-square rounded" style={{ background: tone }} />
              ))}
            </div>
            <div className="mt-2 flex gap-1">
              {[0, 1, 2, 3, 4].map((n) => (
                <span key={n} className="text-[10px] text-amber-500">★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <figcaption className="flex items-center justify-between p-4 text-sm">
        <span className="font-medium">{category}</span>
        <span className="text-xs text-muted">Sample design</span>
      </figcaption>
    </figure>
  );
}
