import Link from "next/link";
import { cn } from "@/lib/utils";
import { Aurora, Reveal } from "./motion";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

type ButtonProps = {
  href: string;
  variant?: "primary" | "secondary" | "ghost" | "light";
  className?: string;
  children: React.ReactNode;
};

export function ButtonLink({ href, variant = "primary", className, children }: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300",
        variant === "primary" &&
          "btn-sheen bg-pine text-white shadow-[0_10px_30px_-12px_rgb(31_77_54/0.7)] hover:-translate-y-0.5 hover:bg-pine-strong hover:shadow-[0_16px_40px_-14px_rgb(31_77_54/0.8)]",
        variant === "secondary" && "border border-line bg-surface/80 text-ink backdrop-blur hover:-translate-y-0.5 hover:bg-surface",
        variant === "light" && "btn-sheen bg-[#faf7f0] text-pine hover:-translate-y-0.5 hover:bg-white",
        variant === "ghost" && "text-pine hover:underline",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-[0.14em] text-clay", className)}>{children}</p>
  );
}

export function PageHeader({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <section className="relative isolate -mt-16 overflow-hidden border-b border-line pt-16">
      <Aurora />
      <Container className="py-16 sm:py-24">
        <Reveal>{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}</Reveal>
        <Reveal delay={80}>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-6xl">{title}</h1>
        </Reveal>
        {lead && (
          <Reveal delay={160}>
            <p className="mt-5 max-w-2xl text-lg text-muted">{lead}</p>
          </Reveal>
        )}
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
