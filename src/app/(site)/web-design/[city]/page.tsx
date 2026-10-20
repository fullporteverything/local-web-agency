import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { citySlug, ncCities } from "@/config/brand";
import { FaqList, PricingCards, Steps } from "@/components/site/sections";
import { ButtonLink, Container, PageHeader } from "@/components/site/ui";

type Props = { params: Promise<{ city: string }> };

function findCity(slug: string) {
  return ncCities.find((c) => citySlug(c) === slug);
}

export function generateStaticParams() {
  return ncCities.map((city) => ({ city: citySlug(city) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = findCity((await params).city);
  if (!city) return {};
  return {
    title: `Website design in ${city}`,
    description: `Affordable website design for small businesses in ${city}. Free preview first, live in a few days, no contract.`,
    alternates: { canonical: `/web-design/${citySlug(city)}` },
  };
}

export default async function CityPage({ params }: Props) {
  const city = findCity((await params).city);
  if (!city) notFound();
  return (
    <>
      <PageHeader
        eyebrow={city}
        title={`Website design for ${city} businesses.`}
        lead={`When people in ${city} need a plumber, a cake, or a haircut, they search on their phone first. If you don't have a website, they usually call whoever does. We build simple, fast sites that fix that, and we show you yours before you pay.`}
      />
      <Container className="py-16">
        <h2 className="font-display text-2xl font-semibold">How it works</h2>
        <div className="mt-6"><Steps /></div>
        <h2 className="mt-16 font-display text-2xl font-semibold">Pricing for {city} businesses</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Same fair pricing everywhere we work. Small family businesses never pay more than $500 to get started.
        </p>
        <div className="mt-6"><PricingCards /></div>
        <h2 className="mt-16 font-display text-2xl font-semibold">Questions</h2>
        <div className="mt-6"><FaqList /></div>
        <div className="mt-12 rounded-2xl bg-pine p-8 text-center text-white">
          <h2 className="font-display text-2xl font-semibold">Run a business in {city}?</h2>
          <p className="mt-2 text-white/80">Get a free preview of your website. No cost, no contract.</p>
          <ButtonLink href="/free-preview" variant="secondary" className="mt-6 border-transparent">Get a free preview</ButtonLink>
        </div>
      </Container>
    </>
  );
}
