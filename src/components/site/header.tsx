"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./ui";

const nav = [
  { href: "/how-it-works", label: "Process" },
  { href: "/pricing", label: "Pricing" },
  { href: "/work", label: "Work" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-500",
        scrolled || open ? "border-b border-line bg-bg/70 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link href="/" aria-label={`${name} home`} onClick={() => setOpen(false)}>
          <Logo name={name} />
        </Link>
        <nav className="hidden items-center gap-9 lg:flex">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("label transition-colors hover:text-ink", pathname === item.href ? "text-ink" : "text-muted")}
            >
              <span className="mr-2 text-white/30">0{i + 1}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-7 lg:flex">
          <Link href="/contact" className="label text-muted hover:text-ink">Contact</Link>
          <Link href="/portal" className="label text-muted hover:text-ink">Client login</Link>
          <Link href="/free-preview" className="btn-chrome label inline-flex items-center gap-2 rounded-full px-5 py-3 !tracking-[0.22em] transition-transform hover:-translate-y-0.5">
            Free preview <ArrowRight size={14} />
          </Link>
        </div>
        <button
          className="rounded-full border border-line p-2.5 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="h-[calc(100dvh-5rem)] overflow-y-auto border-t border-line bg-bg px-4 pb-10 lg:hidden">
          {[...nav, { href: "/contact", label: "Contact" }, { href: "/portal", label: "Client login" }].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-baseline gap-4 border-b border-line py-5 font-display text-4xl"
            >
              <span className="label text-white/30">0{i + 1}</span>
              {item.label}
            </Link>
          ))}
          <Link
            href="/free-preview"
            onClick={() => setOpen(false)}
            className="btn-chrome label mt-8 flex items-center justify-center gap-2 rounded-full py-4"
          >
            Get a free preview <ArrowRight size={14} />
          </Link>
        </nav>
      )}
    </header>
  );
}
