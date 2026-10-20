import type { Metadata } from "next";
import { faq } from "@/config/brand";
import { CtaPanel } from "@/components/site/cta";
import { FaqList } from "@/components/site/sections";
import { Container, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about pricing, timelines, domains, changes, and canceling.",
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <>
      <PageHeader eyebrow="FAQ" title={<>Straight <span className="italic text-muted">answers.</span></>} lead="The questions we hear most, answered plainly." />
      <Container className="max-w-4xl py-24">
        <FaqList />
      </Container>
      <Container><CtaPanel title="Still curious?" accent="See it for free." /></Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
