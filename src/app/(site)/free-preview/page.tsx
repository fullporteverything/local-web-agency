import type { Metadata } from "next";
import { LeadForm } from "@/components/site/lead-form";
import { Reveal } from "@/components/site/motion";
import { Container, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Get a free preview site",
  description: "Tell us about your business and we'll build a free preview of your website. No cost, no contract, no pressure.",
};

const next = [
  "We build a preview using your info and what's public on Google.",
  "You get a link by email, usually within a day or two.",
  "Like it? Put it live on your own domain. Don't? No hard feelings.",
];

export default function FreePreviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free preview"
        title={<>See your website <span className="italic glow-text">before you spend a dime.</span></>}
        lead="Tell us a little about your business. We'll build a working preview with your info and email you the link."
      />
      <Container className="grid gap-12 py-24 lg:grid-cols-[1.6fr_1fr]">
        <Reveal><LeadForm kind="free_preview" /></Reveal>
        <Reveal delay={120}>
          <p className="label text-white/45">What happens next</p>
          <ol className="mt-6 border-t border-line">
            {next.map((line, i) => (
              <li key={line} className="flex gap-5 border-b border-line py-6">
                <span className="font-display text-3xl italic text-white/25">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-muted">{line}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </>
  );
}
