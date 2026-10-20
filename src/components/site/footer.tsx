import Link from "next/link";
import { brand, citySlug, ncCities } from "@/config/brand";
import { Container, Logo } from "./ui";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line bg-surface-2/60">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo name={brand.name} />
          <p className="text-sm text-muted">
            Websites for small local businesses across {brand.state}. Based in {brand.homeCity}.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/how-it-works" className="hover:text-ink">How it works</Link></li>
            <li><Link href="/pricing" className="hover:text-ink">Pricing</Link></li>
            <li><Link href="/work" className="hover:text-ink">Our work</Link></li>
            <li><Link href="/faq" className="hover:text-ink">FAQ</Link></li>
            <li><Link href="/portal" className="hover:text-ink">Client login</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Where we work</h3>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted">
            {ncCities.slice(0, 8).map((city) => (
              <li key={city}>
                <Link href={`/web-design/${citySlug(city)}`} className="hover:text-ink">{city}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Get in touch</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><a href={`mailto:${brand.email}`} className="hover:text-ink">{brand.email}</a></li>
            {brand.phone && <li><a href={`tel:${brand.phone}`} className="hover:text-ink">{brand.phone}</a></li>}
            {brand.mailingAddress && <li>{brand.mailingAddress}</li>}
            <li><Link href="/contact" className="hover:text-ink">Contact form</Link></li>
          </ul>
        </div>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-line py-6 text-xs text-muted sm:flex-row sm:justify-between">
        <p>© {year} {brand.name}. All rights reserved.</p>
        <p className="space-x-4">
          <Link href="/terms" className="hover:text-ink">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy Policy</Link>
        </p>
      </Container>
    </footer>
  );
}
