import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brand, citySlug, ncCities } from "@/config/brand";
import { Container, Logo } from "./ui";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-line">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-5">
          <Logo name={brand.name} />
          <p className="max-w-xs text-sm text-muted">
            Websites for small local businesses. Built first, paid for only if you love it. Based in {brand.homeCity}.
          </p>
          <Link href="/free-preview" className="btn-chrome label inline-flex items-center gap-2 rounded-full px-5 py-3 !tracking-[0.22em]">
            Free preview <ArrowRight size={14} />
          </Link>
        </div>
        <FooterCol title="Agency">
          <FooterLink href="/how-it-works">Process</FooterLink>
          <FooterLink href="/pricing">Pricing</FooterLink>
          <FooterLink href="/work">Work</FooterLink>
          <FooterLink href="/faq">FAQ</FooterLink>
          <FooterLink href="/portal">Client login</FooterLink>
        </FooterCol>
        <FooterCol title="Local">
          {ncCities.slice(0, 6).map((city) => (
            <FooterLink key={city} href={`/web-design/${citySlug(city)}`}>{city}</FooterLink>
          ))}
        </FooterCol>
        <FooterCol title="Contact">
          <li><a href={`mailto:${brand.email}`} className="text-muted hover:text-ink">{brand.email}</a></li>
          {brand.phone && <li><a href={`tel:${brand.phone}`} className="text-muted hover:text-ink">{brand.phone}</a></li>}
          {brand.mailingAddress && <li className="text-muted">{brand.mailingAddress}</li>}
          <FooterLink href="/contact">Send a message</FooterLink>
        </FooterCol>
      </Container>

      <div aria-hidden className="pointer-events-none select-none px-2 text-center">
        <p className="chrome-text font-display text-[17vw] leading-[0.85] sm:text-[14vw]">{brand.shortName}</p>
      </div>

      <Container className="flex flex-col gap-3 border-t border-line py-6 text-xs text-muted sm:flex-row sm:justify-between">
        <p>© {year} {brand.name}</p>
        <p className="flex gap-6">
          <Link href="/terms" className="hover:text-ink">Terms</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
        </p>
      </Container>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="label text-white/40">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-muted transition-colors hover:text-ink">{children}</Link>
    </li>
  );
}
