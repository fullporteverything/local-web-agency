"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Small motion kit for the public site. Everything respects prefers-reduced-motion via CSS.

/** Fades and lifts its children into view the first time they scroll on screen. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cn("reveal", shown && "is-shown", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** Moves its children at a different speed than the page for a subtle depth effect. */
export function Parallax({ children, speed = 0.15, className }: { children: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [speed]);
  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

/** Thin bar at the top of the page that fills as you scroll. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5">
      <div ref={ref} className="h-full origin-left bg-gradient-to-r from-pine via-[#3f8f63] to-clay" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}

/** Slow-drifting blurred color blobs + dot grid. Purely decorative. */
export function Aurora({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className={cn("aurora-blob aurora-a", dark ? "bg-[#2f7a52]/50" : "bg-[#9cc9a8]/45")} />
      <div className={cn("aurora-blob aurora-b", dark ? "bg-[#b4532a]/35" : "bg-[#f0c9a8]/55")} />
      <div className={cn("aurora-blob aurora-c", dark ? "bg-[#d9b45a]/25" : "bg-[#e8dcae]/60")} />
      <div className={cn("absolute inset-0", dark ? "dot-grid-dark" : "dot-grid")} />
    </div>
  );
}

/** Endless horizontal ticker. */
export function Marquee({ items }: { items: readonly string[] }) {
  const row = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((item) => (
        <span key={item} className="flex items-center gap-10 whitespace-nowrap font-display text-2xl text-ink/70 sm:text-3xl">
          {item}
          <span className="text-clay">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee-mask flex overflow-hidden">
      <div className="marquee-track flex">
        {row}
        {row}
      </div>
    </div>
  );
}

/** Adds a soft spotlight that follows the cursor across a card. */
export function SpotlightCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={cn("spotlight-card", className)}
    >
      {children}
    </div>
  );
}
