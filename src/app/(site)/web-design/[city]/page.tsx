import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { citySlug, ncCities } from "@/config/brand";
import { CtaPanel } from "@/components/site/cta";
import { Reveal } from "@/components/site/motion";
import { FaqList, PricingCards, Steps } from "@/components/site/sections";
import { Container, Eyebrow, PageHeader } from "@/components/site/ui";

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
        title={<>Website design for <span className="italic text-muted">{city} businesses.</span></>}
        lead={`When people in ${city} need a plumber, a cake, or a haircut, they search on their phone first. If you don't have a website, they usually call whoever does. We build simple, fast sites that fix that, and we show you yours before you pay.`}
      />
      <Container className="py-24">
        <Reveal><Eyebrow>How it works</Eyebrow></Reveal>
        <div className="mt-10"><Steps /></div>
        <Reveal className="mt-28"><Eyebrow>Pricing for {city} businesses</Eyebrow></Reveal>
        <Reveal delay={80}>
          <p className="mt-5 max-w-2xl text-muted">Same fair pricing everywhere we work. Small family businesses never pay more than $500 to get started.</p>
        </Reveal>
        <div className="mt-10"><PricingCards /></div>
        <Reveal className="mt-28"><Eyebrow>Questions</Eyebrow></Reveal>
        <div className="mt-8"><FaqList /></div>
      </Container>
      <Container><CtaPanel title={`Run a business in ${city}?`} accent="See yours free." /></Container>
    </>
  );
}
