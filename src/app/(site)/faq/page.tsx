import type { Metadata } from "next";
import { faq } from "@/config/brand";
import { FaqList } from "@/components/site/sections";
import { ButtonLink, Container, PageHeader } from "@/components/site/ui";

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
      <PageHeader eyebrow="FAQ" title="Straight answers." lead="The questions we hear most, answered plainly." />
      <Container className="max-w-3xl py-16">
        <FaqList />
        <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <p className="text-muted">Still have a question?</p>
          <ButtonLink href="/contact" variant="secondary">Get in touch</ButtonLink>
        </div>
      </Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
