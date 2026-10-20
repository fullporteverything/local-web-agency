import type { Metadata } from "next";
import { FaqList, PricingCards } from "@/components/site/sections";
import { Container, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple website pricing for small local businesses. One setup fee, one monthly fee, no contract. Family businesses never pay more than $500 to start.",
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="One setup fee. One monthly fee. No contract."
        lead="Every quote is personal and based on what your business needs. The ranges below are where most businesses land. Small family businesses never pay more than $500 to get started."
      />
      <Container className="py-16">
        <PricingCards />
        <div className="mt-12 grid gap-6 rounded-2xl border border-line bg-surface p-8 sm:grid-cols-3">
          {[
            { title: "What the monthly covers", body: "Hosting, security updates, keeping the site running, and changes within your plan's allowance." },
            { title: "No contract", body: "Cancel anytime. Your site stays up through the month you've paid for." },
            { title: "Your domain", body: "We can set one up for you or connect one you already own." },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{item.body}</p>
            </div>
          ))}
        </div>
        <h2 className="mt-16 font-display text-2xl font-semibold">Common questions</h2>
        <div className="mt-6">
          <FaqList />
        </div>
      </Container>
    </>
  );
}
