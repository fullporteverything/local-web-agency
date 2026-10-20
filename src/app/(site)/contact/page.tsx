import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { brand } from "@/config/brand";
import { LeadForm } from "@/components/site/lead-form";
import { Reveal } from "@/components/site/motion";
import { Container, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${brand.name}. Questions about a website for your business? You'll hear back from a real person.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={<>Talk to a <span className="italic text-muted">real person.</span></>}
        lead="Questions, changes, or just curious? Send a message and I'll get back to you, usually the same business day."
      />
      <Container className="grid gap-12 py-24 lg:grid-cols-[1.6fr_1fr]">
        <Reveal><LeadForm kind="contact" /></Reveal>
        <Reveal delay={120} className="space-y-10">
          <div>
            <p className="label text-white/45">Email</p>
            <a href={`mailto:${brand.email}`} className="mt-3 flex items-center gap-3 font-display text-2xl hover:text-[var(--pine-strong)]">
              <Mail size={18} className="text-muted" /> {brand.email}
            </a>
          </div>
          {brand.phone && (
            <div>
              <p className="label text-white/45">Phone</p>
              <a href={`tel:${brand.phone}`} className="mt-3 flex items-center gap-3 font-display text-2xl hover:text-[var(--pine-strong)]">
                <Phone size={18} className="text-muted" /> {brand.phone}
              </a>
            </div>
          )}
          {brand.bookingUrl && (
            <div>
              <p className="label text-white/45">Prefer to talk?</p>
              <a href={brand.bookingUrl} className="mt-3 inline-flex items-center gap-2 font-display text-2xl hover:text-[var(--pine-strong)]">
                Book a quick call <ArrowRight size={18} />
              </a>
            </div>
          )}
          <div className="border-t border-line pt-10">
            <p className="font-display text-3xl">Want to see your site first?</p>
            <p className="mt-2 text-muted">We&apos;ll build a free preview using your business info.</p>
            <Link href="/free-preview" className="label mt-6 inline-flex items-center gap-2 text-ink hover:text-[var(--pine-strong)]">
              Get a free preview <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>
      </Container>
    </>
  );
}
