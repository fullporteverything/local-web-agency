import type { Metadata } from "next";
import { Check } from "lucide-react";
import { LeadForm } from "@/components/site/lead-form";
import { Container, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Get a free preview site",
  description: "Tell us about your business and we'll build a free preview of your website. No cost, no contract, no pressure.",
};

export default function FreePreviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free preview"
        title="See your website before you spend a dime."
        lead="Tell us a little about your business. We'll build a working preview with your info and email you the link."
      />
      <Container className="grid gap-10 py-16 lg:grid-cols-[1.6fr_1fr]">
        <LeadForm kind="free_preview" />
        <aside className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-semibold">What happens next</h2>
          <ul className="mt-4 space-y-4 text-sm">
            {[
              "We build a preview using your info and what's public on Google.",
              "You get a link by email, usually within a day or two.",
              "Like it? Put it live on your own domain. Don't? No hard feelings.",
            ].map((line) => (
              <li key={line} className="flex gap-2.5">
                <Check size={18} className="mt-0.5 shrink-0 text-pine" />
                <span className="text-muted">{line}</span>
              </li>
            ))}
          </ul>
        </aside>
      </Container>
    </>
  );
}
