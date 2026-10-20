import Link from "next/link";
import { cn } from "@/lib/utils";
import { Aurora, Reveal } from "./motion";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

type ButtonProps = {
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  children: React.ReactNode;
};

export function ButtonLink({ href, variant = "primary", className, children }: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "label inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3.5 !tracking-[0.22em] transition-all duration-300",
        variant === "primary" && "btn-chrome hover:-translate-y-0.5",
        variant === "secondary" && "btn-sheen border border-white/20 text-ink hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.04]",
        variant === "ghost" && "px-0 text-muted hover:text-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Small uppercase label with a leading hairline. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("label flex items-center gap-3 text-muted", className)}>
      <span className="h-px w-8 bg-white/30" />
      {children}
    </p>
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl", className)}>{children}</h2>;
}

export function PageHeader({ eyebrow, title, lead }: { eyebrow?: string; title: React.ReactNode; lead?: string }) {
  return (
    <section className="relative isolate -mt-20 overflow-hidden border-b border-line pt-20">
      <Aurora strength={0.8} />
      <Container className="py-20 sm:py-28">
        {eyebrow && (
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
        )}
        <Reveal delay={80}>
          <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.02] tracking-tight sm:text-8xl">{title}</h1>
        </Reveal>
        {lead && (
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-lg text-muted">{lead}</p>
          </Reveal>
        )}
      </Container>
    </section>
  );
}

export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="logoChrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#9a9e9a" />
          <stop offset="1" stopColor="#e8e9e6" />
        </linearGradient>
      </defs>
      <path d="M16 3l7 9.5h-4.2l5.2 7h-4.6l3.6 6.5H8l3.6-6.5H7l5.2-7H8z" fill="url(#logoChrome)" />
      <rect x="14.6" y="26" width="2.8" height="4" fill="url(#logoChrome)" />
    </svg>
  );
}

export function Logo({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="label !text-[0.78rem] !tracking-[0.34em] text-ink">{name}</span>
    </span>
  );
}
