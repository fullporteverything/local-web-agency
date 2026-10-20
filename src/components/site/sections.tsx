import { Check } from "lucide-react";
import { faq, tiers } from "@/config/brand";
import { cn } from "@/lib/utils";
import { Reveal, SpotlightCard } from "./motion";
import { ButtonLink } from "./ui";

export function PricingCards() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {tiers.map((tier, i) => {
        const featured = tier.key === "basic";
        return (
          <Reveal key={tier.key} delay={i * 120} className="h-full">
            <SpotlightCard
              className={cn(
                "flex h-full flex-col rounded-2xl border bg-surface p-6 sm:p-8",
                featured ? "glow-border border-transparent" : "border-line",
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
            </SpotlightCard>
          </Reveal>
        );
      })}
    </div>
  );
}

export function FaqList({ limit }: { limit?: number }) {
  const items = limit ? faq.slice(0, limit) : faq;
  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {items.map((item) => (
        <details key={item.q} className="group p-5 transition-colors open:bg-surface-2/40 sm:p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
            {item.q}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-lg text-muted transition-transform duration-300 group-open:rotate-45 group-open:bg-pine group-open:text-white">
              +
            </span>
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

export function Steps({ dark = false }: { dark?: boolean }) {
  return (
    <ol className="relative grid gap-6 md:grid-cols-3">
      <div
        aria-hidden
        className={cn(
          "absolute left-[16%] right-[16%] top-[2.6rem] hidden h-px md:block",
          dark ? "bg-gradient-to-r from-white/0 via-white/25 to-white/0" : "bg-gradient-to-r from-line/0 via-line to-line/0",
        )}
      />
      {steps.map((step, i) => (
        <Reveal as="li" key={step.title} delay={i * 140}>
          <SpotlightCard
            className={cn(
              "h-full rounded-2xl border p-6",
              dark ? "border-white/10 bg-white/[0.06] backdrop-blur-md" : "border-line bg-surface",
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full font-display text-lg font-semibold",
                dark ? "bg-white text-pine" : "bg-pine-soft text-pine",
              )}
            >
              {i + 1}
            </span>
            <h3 className={cn("mt-5 font-display text-xl font-semibold", dark && "text-white")}>{step.title}</h3>
            <p className={cn("mt-2", dark ? "text-white/70" : "text-muted")}>{step.body}</p>
          </SpotlightCard>
        </Reveal>
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
    <SpotlightCard className="group overflow-hidden rounded-2xl border border-line bg-surface">
      <figure>
        <div className="aspect-[4/3] overflow-hidden p-4" style={{ background: tone }}>
          <div className="h-full overflow-hidden rounded-lg bg-white shadow-sm transition-transform duration-700 ease-out group-hover:-translate-y-3 group-hover:scale-[1.03]">
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
    </SpotlightCard>
  );
}
