import { Check } from "lucide-react";
import { faq, tiers } from "@/config/brand";
import { cn } from "@/lib/utils";
import { Reveal, SpotlightCard } from "./motion";
import { ButtonLink } from "./ui";

const roman = ["I", "II", "III", "IV", "V", "VI"];

export function PricingCards() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {tiers.map((tier, i) => {
        const featured = tier.key === "basic";
        return (
          <Reveal key={tier.key} delay={i * 120} className="h-full">
            <SpotlightCard
              className={cn(
                "hairline-frame flex h-full flex-col rounded-3xl p-7 sm:p-9",
                featured ? "chrome-border" : "glass",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="label text-muted">Tier {roman[i]}</p>
                {featured && <span className="label rounded-full bg-white/10 px-3 py-1.5 !text-[0.6rem] text-ink">Most start here</span>}
              </div>
              <h3 className="mt-6 font-display text-5xl">{tier.name}</h3>
              <p className="mt-3 text-sm text-muted">{tier.blurb}</p>
              <div className="mt-8 border-t border-line pt-6">
                <p className="font-display text-5xl">{tier.setup}</p>
                <p className="mt-1 text-sm text-muted">one-time setup, then {tier.monthly}</p>
              </div>
              <ul className="mt-8 flex-1 space-y-3.5 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <Check size={16} className="mt-0.5 shrink-0 text-[var(--pine)]" />
                    <span className="text-ink/85">{f}</span>
                  </li>
                ))}
              </ul>
              <ButtonLink href="/free-preview" variant={featured ? "primary" : "secondary"} className="mt-10 w-full">
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
    <div className="border-t border-line">
      {items.map((item, i) => (
        <details key={item.q} className="group border-b border-line py-6">
          <summary className="flex cursor-pointer list-none items-center gap-5">
            <span className="label w-8 shrink-0 text-white/30">{String(i + 1).padStart(2, "0")}</span>
            <span className="flex-1 font-display text-2xl sm:text-3xl">{item.q}</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-lg text-muted transition-all duration-300 group-open:rotate-45 group-open:border-white/40 group-open:text-ink">
              +
            </span>
          </summary>
          <p className="mt-4 max-w-2xl pl-[3.25rem] text-muted">{item.a}</p>
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
    <ol className="grid gap-5 md:grid-cols-3">
      {steps.map((step, i) => (
        <Reveal as="li" key={step.title} delay={i * 140}>
          <SpotlightCard className="glass hairline-frame h-full rounded-3xl p-8">
            <p className="font-display text-6xl italic text-white/15">{roman[i]}</p>
            <h3 className="mt-8 font-display text-3xl">{step.title}</h3>
            <p className="mt-3 text-muted">{step.body}</p>
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
    <SpotlightCard className="glass group overflow-hidden rounded-3xl">
      <figure>
        <div className="relative aspect-[4/3] overflow-hidden p-6">
          <div className="absolute inset-0 opacity-25 transition-opacity duration-500 group-hover:opacity-40" style={{ background: `radial-gradient(circle at 50% 120%, ${accent}, transparent 70%)` }} />
          <div className="relative h-full overflow-hidden rounded-xl bg-white shadow-2xl transition-transform duration-700 ease-out group-hover:-translate-y-3 group-hover:scale-[1.03]">
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
        <figcaption className="flex items-center justify-between border-t border-line px-6 py-4">
          <span className="font-display text-2xl">{category}</span>
          <span className="label !text-[0.6rem] text-muted">Sample design</span>
        </figcaption>
      </figure>
    </SpotlightCard>
  );
}
