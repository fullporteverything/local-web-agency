import { ArrowRight, MapPin, Phone, Search, Smartphone, Star, Zap } from "lucide-react";
import { brand } from "@/config/brand";
import { Aurora, Marquee, Parallax, Reveal, SpotlightCard } from "@/components/site/motion";
import { FaqList, PricingCards, SampleCard, Steps, sampleDesigns } from "@/components/site/sections";
import { ButtonLink, Container, Eyebrow } from "@/components/site/ui";

const businessTypes = [
  "Roofers", "Barbers", "Bakeries", "Landscapers", "Nail salons", "HVAC", "Restaurants",
  "Auto shops", "Florists", "Painters", "Cleaners", "Pet groomers", "Plumbers", "Food trucks",
] as const;

export default function HomePage() {
  return (
    <>
      {/* Hero (pulled up under the transparent header) */}
      <section className="relative isolate -mt-16 overflow-hidden pt-16">
        <Aurora />
        <Container className="grid items-center gap-14 pb-16 pt-14 sm:pb-24 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pine/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-pine" />
                </span>
                Websites for local businesses
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-7xl">
                A real website for your business, <span className="text-shimmer">without the runaround.</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-xl text-lg text-muted">
                We build you a working preview first, for free. If you like it, it goes live on your own
                domain in a few days. We handle hosting, updates, and changes after that. No contract.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/free-preview" className="px-6 py-3.5 text-base">
                  Get a free preview <ArrowRight size={18} />
                </ButtonLink>
                <ButtonLink href="/how-it-works" variant="secondary" className="px-6 py-3.5 text-base">
                  See how it works
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={400}>
              <p className="mt-6 text-sm text-muted">Small family businesses never pay more than $500 to get started.</p>
            </Reveal>
          </div>
          <Reveal delay={250}>
            <Parallax speed={0.08}>
              <PhoneMockup />
            </Parallax>
          </Reveal>
        </Container>
      </section>

      {/* Ticker */}
      <section className="border-y border-line bg-surface/60 py-7">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted">Built for</p>
        <Marquee items={businessTypes} />
      </section>

      {/* Why */}
      <section>
        <Container className="grid gap-6 py-20 sm:grid-cols-3">
          {[
            { icon: Smartphone, title: "Built for phones", body: "Most of your customers will find you on their phone. Every site we build is made for that first." },
            { icon: Phone, title: "Calls, not clicks", body: "Tap-to-call, your hours, and directions right up top, so people can reach you in one tap." },
            { icon: MapPin, title: "Local, real people", body: `We're based in ${brand.homeCity} and work with local businesses like yours. You'll always talk to a person.` },
          ].map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 120}>
              <SpotlightCard className="h-full rounded-2xl border border-line bg-surface p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pine-soft text-pine">
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-muted">{body}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </Container>
      </section>

      {/* How it works (dark) */}
      <section className="relative isolate overflow-hidden bg-[#10261b] text-white">
        <Aurora dark />
        <Container className="py-24">
          <Reveal>
            <Eyebrow className="text-[#e7a27f]">How it works</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold sm:text-5xl">
              You see your site before you pay a cent.
            </h2>
          </Reveal>
          <div className="mt-14">
            <Steps dark />
          </div>
          <Reveal delay={200} className="mt-12">
            <ButtonLink href="/how-it-works" variant="light">
              The full process <ArrowRight size={16} />
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      {/* Pricing */}
      <section className="relative isolate overflow-hidden">
        <Container className="py-24">
          <Reveal>
            <Eyebrow>Pricing</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold sm:text-5xl">
              Fair prices for what your business actually needs.
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-4 max-w-2xl text-muted">Every quote is personal. These are starting ranges, and smaller businesses pay less.</p>
          </Reveal>
          <div className="mt-12">
            <PricingCards />
          </div>
        </Container>
      </section>

      {/* Work */}
      <section className="bg-surface-2/60">
        <Container className="py-24">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <Reveal>
              <Eyebrow>Our work</Eyebrow>
              <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Simple, clean, made to get calls.</h2>
            </Reveal>
            <ButtonLink href="/work" variant="ghost">See more →</ButtonLink>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sampleDesigns.map((s, i) => (
              <Reveal key={s.business} delay={i * 120}>
                <SampleCard {...s} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section>
        <Container className="grid gap-12 py-24 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <Eyebrow>Questions</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Straight answers.</h2>
            <p className="mt-4 text-muted">Don&apos;t see yours? Just ask. You&apos;ll hear back from a real person.</p>
            <ButtonLink href="/contact" variant="secondary" className="mt-6">Ask a question</ButtonLink>
          </Reveal>
          <Reveal delay={120}>
            <FaqList limit={4} />
          </Reveal>
        </Container>
      </section>

      {/* CTA */}
      <section>
        <Container className="pb-8">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#10261b] px-6 py-20 text-center text-white sm:px-12">
              <Aurora dark />
              <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold sm:text-5xl">
                Want to see what yours would look like?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-white/75">
                Tell us a little about your business and we&apos;ll build a free preview. No pressure, no contract.
              </p>
              <ButtonLink href="/free-preview" variant="light" className="mt-9 px-7 py-3.5 text-base">
                Get my free preview <ArrowRight size={18} />
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[22rem]">
      <div className="float-slow">
        <div className="rounded-[2.75rem] border-[10px] border-ink bg-ink shadow-[0_50px_100px_-30px_rgb(16_38_27/0.55)]">
          <div className="overflow-hidden rounded-[2rem] bg-white">
            <div className="relative overflow-hidden bg-pine px-5 pb-6 pt-8 text-white">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <p className="text-[11px] uppercase tracking-widest opacity-75">Your business</p>
              <p className="mt-1 font-display text-2xl font-semibold leading-tight">Family-owned. Done right.</p>
              <div className="mt-4 flex gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-pine">
                  <Phone size={12} /> Call now
                </span>
                <span className="rounded-full border border-white/40 px-3 py-1.5 text-xs">Directions</span>
              </div>
            </div>
            <div className="space-y-3 p-5 text-neutral-800">
              <div className="flex items-center gap-1 text-amber-500">
                {[0, 1, 2, 3, 4].map((n) => <Star key={n} size={14} fill="currentColor" />)}
                <span className="ml-1 text-xs text-neutral-500">from Google reviews</span>
              </div>
              <div className="rounded-lg bg-neutral-100 p-3 text-xs leading-relaxed text-neutral-600">
                Your best Google reviews show up right here, so new customers see them first.
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {["Services", "Hours", "Photos", "Contact"].map((label) => (
                  <div key={label} className="rounded-lg border border-neutral-200 px-3 py-2.5 font-medium">{label}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating feature chips */}
      <div className="absolute -left-14 bottom-32 hidden rounded-2xl border border-line bg-surface/90 px-4 py-3 shadow-xl backdrop-blur sm:block" style={{ animation: "float 6s ease-in-out infinite", animationDelay: "-2s" }}>
        <p className="flex items-center gap-2 text-sm font-semibold"><Search size={15} className="text-pine" /> Shows up on Google</p>
      </div>
      <div className="absolute -right-8 top-10 hidden rounded-2xl border border-line bg-surface/90 px-4 py-3 shadow-xl backdrop-blur sm:block" style={{ animation: "float 7s ease-in-out infinite", animationDelay: "-4s" }}>
        <p className="flex items-center gap-2 text-sm font-semibold"><Zap size={15} className="text-clay" /> Live in a few days</p>
      </div>
      <p className="mt-6 text-center text-xs text-muted">Example layout</p>
    </div>
  );
}
