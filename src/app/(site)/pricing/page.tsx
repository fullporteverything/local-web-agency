import type { Metadata } from "next";
import { CtaPanel } from "@/components/site/cta";
import { Reveal } from "@/components/site/motion";
import { FaqList, PricingCards } from "@/components/site/sections";
import { Container, Eyebrow, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple website pricing for small local businesses. One setup fee, one monthly fee, no contract. Family businesses never pay more than $500 to start.",
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title={<>One setup fee. One monthly fee. <span className="italic text-muted">No contract.</span></>}
        lead="Every quote is personal and based on what your business needs. Small family businesses never pay more than $500 to get started."
      />
      <Container className="py-24">
        <PricingCards />
        <div className="mt-16 grid gap-10 border-y border-line py-12 sm:grid-cols-3">
          {[
            { title: "What the monthly covers", body: "Hosting, security updates, keeping the site running, and changes within your plan's allowance." },
            { title: "No contract", body: "Cancel anytime. Your site stays up through the month you've paid for." },
            { title: "Your domain", body: "We can set one up for you or connect one you already own." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 100}>
              <h3 className="font-display text-2xl">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.body}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-24"><Eyebrow>Common questions</Eyebrow></Reveal>
        <div className="mt-8"><FaqList /></div>
      </Container>
      <Container><CtaPanel /></Container>
    </>
  );
}
