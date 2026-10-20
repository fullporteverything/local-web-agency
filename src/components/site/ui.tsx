import Link from "next/link";
import { cn } from "@/lib/utils";

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
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors",
        variant === "primary" && "bg-pine text-white hover:bg-pine-strong",
        variant === "secondary" && "border border-line bg-surface text-ink hover:bg-surface-2",
        variant === "ghost" && "text-pine hover:underline",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">{children}</p>
  );
}

export function PageHeader({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <section className="border-b border-line bg-surface-2/60">
      <Container className="py-14 sm:py-20">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-lg text-muted">{lead}</p>}
      </Container>
    </section>
  );
}

export function Logo({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-display text-lg font-semibold">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden className="text-pine">
        <rect width="32" height="32" rx="8" fill="currentColor" />
        <path d="M16 6l6 8h-3.5l4.5 6h-4l3 5H10l3-5H9l4.5-6H10z" fill="#faf7f0" />
      </svg>
      {name}
    </span>
  );
}
