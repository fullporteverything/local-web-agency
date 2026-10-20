import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { brand } from "@/config/brand";
import { LeadForm } from "@/components/site/lead-form";
import { ButtonLink, Container, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${brand.name}. Questions about a website for your business? You'll hear back from a real person.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Talk to a real person." lead="Questions, changes, or just curious? Send a message and I'll get back to you, usually the same business day." />
      <Container className="grid gap-10 py-16 lg:grid-cols-[1.6fr_1fr]">
        <LeadForm kind="contact" />
        <aside className="space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-semibold">Other ways to reach us</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-pine" />
                <a href={`mailto:${brand.email}`} className="hover:underline">{brand.email}</a>
              </li>
              {brand.phone && (
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-pine" />
                  <a href={`tel:${brand.phone}`} className="hover:underline">{brand.phone}</a>
                </li>
              )}
            </ul>
            {brand.bookingUrl && (
              <ButtonLink href={brand.bookingUrl} variant="secondary" className="mt-6 w-full">Book a quick call</ButtonLink>
            )}
          </div>
          <div className="rounded-2xl border border-line bg-pine-soft p-6">
            <h2 className="font-semibold">Want to see your site first?</h2>
            <p className="mt-2 text-sm text-muted">We&apos;ll build a free preview using your business info.</p>
            <ButtonLink href="/free-preview" className="mt-4">Get a free preview</ButtonLink>
          </div>
        </aside>
      </Container>
    </>
  );
}
