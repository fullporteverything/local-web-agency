import { ArrowRight, Hand, MapPin, Phone, Smartphone } from "lucide-react";
import { brand } from "@/config/brand";
import { Device3D, ScrollStory } from "@/components/site/device";
import { Aurora, Marquee, Parallax, Reveal, SpotlightCard } from "@/components/site/motion";
import { CtaPanel } from "@/components/site/cta";
import { FaqList, PricingCards, SampleCard, sampleDesigns } from "@/components/site/sections";
import { ButtonLink, Container, Eyebrow, SectionTitle } from "@/components/site/ui";

const businessTypes = [
  "Roofers", "Barbers", "Bakeries", "Landscapers", "Nail salons", "HVAC", "Restaurants",
  "Auto shops", "Florists", "Painters", "Cleaners", "Pet groomers", "Plumbers", "Food trucks",
] as const;

const chapters = [
  {
    label: "Chapter I — Today",
    title: "Customers search. They find your competitor.",
    body: "Most people look on their phone before they call. If all they find is a listing with no website, they usually go with whoever has one.",
  },
  {
    label: "Chapter II — The preview",
    title: "We build yours before you pay a cent.",
    body: "Using what's already public about your business, like your hours, services, and best reviews, we build a real working preview. Free.",
  },
  {
    label: "Chapter III — Live",
    title: "Like it? It goes live in days.",
    body: "Your site goes up on your own domain. We handle hosting, updates, and changes for one simple monthly price. No contract.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate -mt-20 flex min-h-dvh flex-col overflow-hidden pt-20">
        <Aurora />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[45%] floor-grid" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="light-beam left-[8%]" />
          <div className="light-beam right-[8%] [animation-delay:-4s]" />
        </div>
        {/* Giant faint wordmark behind the device */}
        <Parallax speed={0.25} className="pointer-events-none absolute inset-x-0 top-[34%] -z-10 select-none text-center">
          <p aria-hidden className="font-display text-[26vw] leading-none tracking-tight text-white/[0.035] lg:text-[19vw]">{brand.shortName}</p>
        </Parallax>

        <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-4 pb-16 pt-6 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Reveal>
              <Eyebrow>Websites for local businesses</Eyebrow>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-7 font-display text-[3.4rem] leading-[0.98] tracking-tight sm:text-8xl xl:text-[7.5rem]">
                Your business,
                <br />
                <span className="italic glow-text">finally online.</span>
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-7 max-w-lg text-lg text-muted">
                We build you a working website first, for free. If you like it, it goes live on your own domain in a
                few days. No contract, no runaround.
              </p>
            </Reveal>
            <Reveal delay={360}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/free-preview">
                  Get a free preview <ArrowRight size={14} />
                </ButtonLink>
                <ButtonLink href="/how-it-works" variant="secondary">
                  See the process
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={480}>
              <p className="mt-8 flex items-center gap-3 text-sm text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--pine)] shadow-[0_0_12px_var(--pine)]" />
                Small family businesses never pay more than $500 to start.
              </p>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <div className="[zoom:0.78] sm:[zoom:0.92] lg:[zoom:1] [--device-w:280px]">
              <Device3D stage={2} yaw={-18} />
            </div>
            <p className="label mt-2 hidden items-center justify-center gap-2 text-white/40 sm:flex">
              <Hand size={13} /> Drag to turn
            </p>
          </Reveal>
        </div>

        <div className="mx-auto hidden w-full max-w-7xl items-center justify-between px-8 pb-8 lg:flex">
          <p className="label text-white/40">Based in {brand.homeCity}</p>
          <p className="label flex items-center gap-3 text-white/40">
            Scroll <span className="h-8 w-px bg-gradient-to-b from-white/50 to-transparent" />
          </p>
        </div>
      </section>

      {/* Ticker */}
      <section className="border-y border-line py-10">
        <Marquee items={businessTypes} />
      </section>

      {/* Pinned scroll story */}
      <ScrollStory chapters={chapters} />

      {/* Why */}
      <section>
        <Container className="py-28">
          <Reveal>
            <Eyebrow>Why it works</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <SectionTitle className="mt-6 max-w-3xl">
              Built for the way <span className="italic text-muted">people actually</span> find you.
            </SectionTitle>
          </Reveal>
          <div className="mt-16 grid gap-5 sm:grid-cols-3">
            {[
              { icon: Smartphone, title: "Phone first", body: "Most of your customers will find you on their phone. Every site we build is made for that first." },
              { icon: Phone, title: "One tap to call", body: "Tap-to-call, your hours, and directions right up top, so people reach you without hunting." },
              { icon: MapPin, title: "Real local people", body: `We're based in ${brand.homeCity}. You'll always talk to a person, never a ticket system.` },
            ].map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 120}>
                <SpotlightCard className="glass hairline-frame h-full rounded-3xl p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-white/[0.04]">
                    <Icon size={20} className="text-[var(--pine-strong)]" />
                  </span>
                  <h3 className="mt-8 font-display text-3xl">{title}</h3>
                  <p className="mt-3 text-muted">{body}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section className="relative isolate overflow-hidden border-t border-line">
        <Aurora strength={0.6} />
        <Container className="py-28">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
            <div>
              <Reveal>
                <Eyebrow>Pricing</Eyebrow>
              </Reveal>
              <Reveal delay={100}>
                <SectionTitle className="mt-6">
                  Fair prices. <span className="italic text-muted">No surprises.</span>
                </SectionTitle>
              </Reveal>
            </div>
            <Reveal delay={150}>
              <p className="max-w-md text-muted lg:justify-self-end">
                Every quote is personal. These are starting ranges, and smaller businesses pay less. One setup fee, one
                monthly fee, cancel anytime.
              </p>
            </Reveal>
          </div>
          <div className="mt-16">
            <PricingCards />
          </div>
        </Container>
      </section>

      {/* Work */}
      <section className="border-t border-line">
        <Container className="py-28">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <Reveal>
                <Eyebrow>The work</Eyebrow>
              </Reveal>
              <Reveal delay={100}>
                <SectionTitle className="mt-6">
                  Simple. Clean. <span className="italic text-muted">Made to get calls.</span>
                </SectionTitle>
              </Reveal>
            </div>
            <ButtonLink href="/work" variant="ghost">
              See more <ArrowRight size={14} />
            </ButtonLink>
          </div>
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sampleDesigns.map((s, i) => (
              <Reveal key={s.business} delay={i * 120}>
                <SampleCard {...s} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-t border-line">
        <Container className="grid gap-14 py-28 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Reveal>
              <Eyebrow>Questions</Eyebrow>
            </Reveal>
            <Reveal delay={100}>
              <SectionTitle className="mt-6">
                Straight <span className="italic text-muted">answers.</span>
              </SectionTitle>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-6 text-muted">Don&apos;t see yours? Ask. You&apos;ll hear back from a real person.</p>
              <ButtonLink href="/contact" variant="secondary" className="mt-8">Ask a question</ButtonLink>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <FaqList limit={4} />
          </Reveal>
        </Container>
      </section>

      {/* Closing CTA */}
      <section>
        <Container>
          <CtaPanel />
        </Container>
      </section>
    </>
  );
}
