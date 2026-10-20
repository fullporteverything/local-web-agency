import { brand, siteUrl } from "@/config/brand";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: brand.name,
    url: siteUrl,
    email: brand.email,
    ...(brand.phone && { telephone: brand.phone }),
    areaServed: { "@type": "State", name: brand.state },
    description: `Website design for small local businesses in ${brand.state}.`,
  };
  return (
    <>
      <SiteHeader name={brand.name} />
      <main>{children}</main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
