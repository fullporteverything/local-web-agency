import { MapPin, Phone, Smartphone, Star } from "lucide-react";
import { brand } from "@/config/brand";
import { FaqList, PricingCards, SampleCard, Steps, sampleDesigns } from "@/components/site/sections";
import { ButtonLink, Container, Eyebrow } from "@/components/site/ui";

export default function HomePage() {
  return (
    <>
      <section className="overflow-hidden">
        <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <Eyebrow>Websites for local {brand.state} businesses</Eyebrow>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] sm:text-6xl">
              A real website for your business, without the runaround.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              We build you a working preview first, for free. If you like it, it goes live on your own
              domain in a few days. We handle hosting, updates, and changes after that. No contract.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/free-preview">Get a free preview</ButtonLink>
              <ButtonLink href="/how-it-works" variant="secondary">See how it works</ButtonLink>
            </div>
            <p className="mt-6 text-sm text-muted">
              Small family businesses never pay more than $500 to get started.
            </p>
          </div>
          <PhoneMockup />
        </Container>
      </section>

      <section className="border-y border-line bg-surface">
        <Container className="grid gap-8 py-12 sm:grid-cols-3">
          {[
            { icon: Smartphone, title: "Built for phones", body: "Most of your customers will find you on their phone. Every site we build is made for that first." },
            { icon: Phone, title: "Calls, not clicks", body: "Tap-to-call, your hours, and directions right up top, so people can reach you in one tap." },
            { icon: MapPin, title: "Local, real people", body: `We're based in ${brand.homeCity} and work with businesses across ${brand.state}. You'll always talk to a person.` },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon className="text-pine" size={24} />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{body}</p>
            </div>
          ))}
        </Container>
      </section>

      <section>
        <Container className="py-20">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
            You see your site before you pay a cent.
          </h2>
          <div className="mt-10">
            <Steps />
          </div>
        </Container>
      </section>

      <section className="bg-surface-2/60">
        <Container className="py-20">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
            Fair prices for what your business actually needs.
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            Every quote is personal. These are starting ranges, and smaller businesses pay less.
          </p>
          <div className="mt-10">
            <PricingCards />
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Eyebrow>Our work</Eyebrow>
              <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Simple, clean, made to get calls.</h2>
            </div>
            <ButtonLink href="/work" variant="ghost">See more →</ButtonLink>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sampleDesigns.map((s) => (
              <SampleCard key={s.business} {...s} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface-2/60">
        <Container className="grid gap-12 py-20 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Eyebrow>Questions</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Straight answers.</h2>
            <p className="mt-4 text-muted">Don&apos;t see yours? Just ask. You&apos;ll hear back from a real person.</p>
            <ButtonLink href="/contact" variant="secondary" className="mt-6">Ask a question</ButtonLink>
          </div>
          <FaqList limit={4} />
        </Container>
      </section>

      <section>
        <Container className="py-20">
          <div className="rounded-3xl bg-pine px-6 py-14 text-center text-white sm:px-12">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Want to see what yours would look like?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Tell us a little about your business and we&apos;ll build a free preview. No pressure, no contract.
            </p>
            <ButtonLink href="/free-preview" variant="secondary" className="mt-8 border-transparent">
              Get my free preview
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-8 -z-10 rounded-full bg-pine-soft blur-3xl" />
      <div className="rounded-[2.5rem] border-8 border-ink bg-surface p-3 shadow-2xl">
        <div className="overflow-hidden rounded-[1.75rem] bg-white">
          <div className="bg-pine px-5 py-6 text-white">
            <p className="text-xs uppercase tracking-widest opacity-75">Your business</p>
            <p className="mt-1 font-display text-2xl font-semibold">Family-owned. Done right.</p>
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
      <p className="mt-4 text-center text-xs text-muted">Example layout</p>
    </div>
  );
}
