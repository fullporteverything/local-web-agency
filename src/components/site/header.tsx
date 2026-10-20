"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Container, Logo } from "./ui";

const nav = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/work", label: "Our work" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" aria-label={`${name} home`} onClick={() => setOpen(false)}>
          <Logo name={name} />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-muted hover:text-ink">
              {item.label}
            </Link>
          ))}
          <Link href="/portal" className="text-sm font-medium text-ink hover:text-pine">
            Client login
          </Link>
          <Link
            href="/free-preview"
            className="rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white hover:bg-pine-strong"
          >
            Get a free preview
          </Link>
        </nav>
        <button
          className="rounded-md p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>
      {open && (
        <nav className="border-t border-line bg-bg md:hidden">
          <Container className="flex flex-col py-2">
            {[...nav, { href: "/portal", label: "Client login" }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-3 text-base last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/free-preview"
              onClick={() => setOpen(false)}
              className="my-3 rounded-full bg-pine px-4 py-3 text-center font-semibold text-white"
            >
              Get a free preview
            </Link>
          </Container>
        </nav>
      )}
    </header>
  );
}
