import { ArrowRight } from "lucide-react";
import { Aurora, Reveal } from "./motion";
import { ButtonLink } from "./ui";

export function CtaPanel({ title = "See yours", accent = "before you pay." }: { title?: string; accent?: string }) {
  return (
    <Reveal>
      <div className="hairline-frame relative isolate overflow-hidden rounded-[2.5rem] border border-line px-6 py-24 text-center sm:px-12 sm:py-32">
        <Aurora />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 floor-grid" />
        <p className="label text-white/50">Free · No contract · Live in days</p>
        <h2 className="mx-auto mt-8 max-w-3xl font-display text-4xl leading-[1.02] sm:text-7xl">
          {title} <span className="italic glow-text">{accent}</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-muted">
          Tell us a little about your business and we&apos;ll build a free preview. No pressure.
        </p>
        <ButtonLink href="/free-preview" className="mt-12">
          Get my free preview <ArrowRight size={14} />
        </ButtonLink>
      </div>
    </Reveal>
  );
}
