"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, Globe, MapPin, Phone, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "./ui";

/**
 * A CSS-3D phone. It drifts on its own, leans toward the cursor, can be dragged to spin,
 * and shows one of three screens: 0 = Google listing with no website, 1 = building, 2 = live site.
 */
export function Device3D({
  stage = 2,
  yaw = 0,
  interactive = true,
  className,
}: {
  stage?: 0 | 1 | 2;
  yaw?: number;
  interactive?: boolean;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const rotor = useRef<HTMLDivElement>(null);
  const state = useRef({ drag: 0, vel: 0, px: 0, py: 0, dragging: false, lastX: 0, yaw });
  useEffect(() => {
    state.current.yaw = yaw;
  }, [yaw]);

  useEffect(() => {
    const el = rotor.current;
    const host = wrap.current;
    if (!el || !host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(host);
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!visible) return;
      const s = state.current;
      const t = (now - start) / 1000;
      if (!s.dragging) {
        s.drag += s.vel;
        s.vel *= 0.94;
        s.drag *= 0.985; // ease back toward the resting angle
      }
      const idle = reduced ? 0 : Math.sin(t * 0.6) * 10;
      const ry = s.yaw + idle + s.drag + s.px * 14;
      const rx = (reduced ? 0 : Math.cos(t * 0.5) * 3) - s.py * 10 + 4;
      el.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, []);

  const handlers = interactive
    ? {
        onPointerMove: (e: React.PointerEvent) => {
          const r = wrap.current!.getBoundingClientRect();
          const s = state.current;
          s.px = (e.clientX - r.left) / r.width - 0.5;
          s.py = (e.clientY - r.top) / r.height - 0.5;
          if (s.dragging) {
            const dx = e.clientX - s.lastX;
            s.lastX = e.clientX;
            s.drag += dx * 0.6;
            s.vel = dx * 0.6;
          }
        },
        onPointerDown: (e: React.PointerEvent) => {
          state.current.dragging = true;
          state.current.lastX = e.clientX;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        },
        onPointerUp: () => (state.current.dragging = false),
        onPointerLeave: () => {
          state.current.px = 0;
          state.current.py = 0;
        },
      }
    : {};

  return (
    <div
      ref={wrap}
      {...handlers}
      className={cn("relative select-none [perspective:1600px]", interactive && "cursor-grab active:cursor-grabbing", className)}
      style={{ touchAction: interactive ? "pan-y" : undefined }}
    >
      <div ref={rotor} className="relative mx-auto h-[var(--h)] w-[var(--w)] [transform-style:preserve-3d]" style={{ "--w": "var(--device-w, 270px)", "--h": "calc(var(--device-w, 270px) * 2.05)" } as React.CSSProperties}>
        {/* Body thickness: stacked slices */}
        {Array.from({ length: 14 }, (_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-[3rem]"
            style={{
              transform: `translateZ(${i - 7}px)`,
              background: i === 0 || i === 13 ? "#1b1e1c" : `linear-gradient(90deg, #4a4e4b, #c9ccc8 ${30 + i}%, #5b5f5c)`,
            }}
          />
        ))}
        {/* Back */}
        <div className="absolute inset-0 flex items-center justify-center rounded-[3rem] bg-gradient-to-br from-[#2a2e2b] to-[#0e100f] [backface-visibility:hidden]" style={{ transform: "rotateY(180deg) translateZ(8px)" }}>
          <LogoMark size={64} />
        </div>
        {/* Front */}
        <div className="absolute inset-0 rounded-[3rem] bg-[#0b0c0b] p-[9px] shadow-[0_0_0_1px_rgb(255_255_255/0.15)] [backface-visibility:hidden]" style={{ transform: "translateZ(8px)" }}>
          <div className="relative h-full overflow-hidden rounded-[2.4rem] bg-white">
            <div className="absolute left-1/2 top-2.5 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
            <ScreenLayer show={stage === 0}><ListingScreen /></ScreenLayer>
            <ScreenLayer show={stage === 1}><BuildingScreen /></ScreenLayer>
            <ScreenLayer show={stage === 2}><LiveScreen /></ScreenLayer>
            {/* Glass reflection */}
            <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
          </div>
        </div>
      </div>
      {/* Floor shadow + glow */}
      <div className="mx-auto mt-10 h-6 w-2/3 rounded-[100%] bg-black/80 blur-xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 mx-auto h-40 w-3/4 rounded-full bg-[var(--pine)]/20 blur-3xl" />
    </div>
  );
}

function ScreenLayer({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "absolute inset-0 transition-all duration-700 ease-out",
        show ? "opacity-100 [filter:none]" : "pointer-events-none scale-[1.03] opacity-0 [filter:blur(6px)]",
      )}
    >
      {children}
    </div>
  );
}

function ListingScreen() {
  return (
    <div className="flex h-full flex-col bg-[#f1f3f4] px-4 pt-12 text-[#202124]">
      <div className="rounded-full bg-white px-4 py-2.5 text-[11px] text-[#5f6368] shadow-sm">your business near me</div>
      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold">Your Business</p>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-[#5f6368]">
          4.9 <span className="flex text-[#fbbc04]">{[0, 1, 2, 3, 4].map((n) => <Star key={n} size={10} fill="currentColor" />)}</span> (27)
        </div>
        <div className="mt-3 space-y-2 text-[11px] text-[#3c4043]">
          <p className="flex items-center gap-2"><MapPin size={12} /> Main St</p>
          <p className="flex items-center gap-2"><Clock size={12} /> Open · Closes 6 PM</p>
          <p className="flex items-center gap-2"><Phone size={12} /> Call</p>
          <p className="flex items-center gap-2 text-[#d93025]"><Globe size={12} /> No website</p>
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold">Competitor down the street</p>
        <p className="mt-1 flex items-center gap-2 text-[11px] text-[#1a73e8]"><Globe size={12} /> Website</p>
      </div>
      <p className="mt-auto pb-6 text-center text-[10px] text-[#5f6368]">What customers see today</p>
    </div>
  );
}

function BuildingScreen() {
  return (
    <div className="flex h-full flex-col bg-white px-4 pt-12">
      <div className="skeleton h-28 rounded-2xl" />
      <div className="skeleton mt-4 h-4 w-3/4 rounded" />
      <div className="skeleton mt-2 h-3 w-full rounded" />
      <div className="skeleton mt-2 h-3 w-5/6 rounded" />
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((n) => <div key={n} className="skeleton aspect-square rounded-lg" />)}
      </div>
      <div className="skeleton mt-4 h-10 rounded-full" />
      <p className="mt-auto pb-6 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-[#2f6b4a]">Building your preview…</p>
    </div>
  );
}

function LiveScreen() {
  return (
    <div className="flex h-full flex-col bg-white text-neutral-800">
      <div className="relative overflow-hidden bg-[#143a28] px-5 pb-6 pt-12 text-white">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#5fbf8c]/30 blur-2xl" />
        <p className="text-[10px] uppercase tracking-[0.25em] opacity-70">Your business</p>
        <p className="mt-1 font-display text-[1.6rem] leading-tight">Family-owned. Done right.</p>
        <div className="mt-4 flex gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#143a28]">
            <Phone size={11} /> Call now
          </span>
          <span className="rounded-full border border-white/40 px-3 py-1.5 text-[11px]">Directions</span>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-1 text-amber-500">
          {[0, 1, 2, 3, 4].map((n) => <Star key={n} size={12} fill="currentColor" />)}
          <span className="ml-1 text-[10px] text-neutral-500">from Google reviews</span>
        </div>
        <div className="rounded-lg bg-neutral-100 p-3 text-[11px] leading-relaxed text-neutral-600">
          Your best reviews, front and center.
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {["Services", "Hours", "Photos", "Contact"].map((label) => (
            <div key={label} className="rounded-lg border border-neutral-200 px-3 py-2.5 font-medium">{label}</div>
          ))}
        </div>
        <div className="relative h-20 overflow-hidden rounded-lg bg-[#e8efe9]">
          <div className="absolute inset-0 bg-[linear-gradient(#d5e0d7_1px,transparent_1px),linear-gradient(90deg,#d5e0d7_1px,transparent_1px)] bg-[size:16px_16px]" />
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d93025] shadow-[0_0_0_4px_rgb(217_48_37/0.2)]" />
          <span className="absolute bottom-1.5 left-2 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-medium">Open today · 7–6</span>
        </div>
      </div>
      <p className="mt-auto flex items-center justify-center gap-1.5 pb-6 text-[10px] font-medium text-[#2f6b4a]">
        <CheckCircle2 size={12} /> Live on yourbusiness.com
      </p>
    </div>
  );
}

/** Tall pinned section: scrolling advances the phone through listing → building → live. */
export function ScrollStory({
  chapters,
}: {
  chapters: { label: string; title: string; body: string }[];
}) {
  const section = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setProgress(Math.min(1, Math.max(0, -r.top / total)));
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
  }, []);
  const active = Math.min(chapters.length - 1, Math.floor(progress * chapters.length));
  const stage = Math.min(2, active) as 0 | 1 | 2;

  return (
    <section ref={section} className="relative" style={{ height: `${chapters.length * 100 + 40}vh` }}>
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="light-beam left-[30%]" />
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <div className="mb-6 flex gap-2">
              {chapters.map((c, i) => (
                <span key={c.label} className="h-0.5 flex-1 overflow-hidden rounded bg-white/10">
                  <span
                    className="block h-full origin-left bg-gradient-to-r from-white to-[var(--pine)] transition-transform duration-300"
                    style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress * chapters.length - i))})` }}
                  />
                </span>
              ))}
            </div>
            <div className="relative min-h-[15rem] sm:min-h-[13rem]">
              {chapters.map((c, i) => (
                <div
                  key={c.label}
                  className={cn(
                    "absolute inset-0 transition-all duration-700",
                    i === active ? "translate-y-0 opacity-100" : i < active ? "-translate-y-6 opacity-0" : "translate-y-6 opacity-0",
                  )}
                >
                  <p className="label text-[var(--pine-strong)]">{c.label}</p>
                  <h3 className="mt-4 font-display text-4xl leading-[1.05] sm:text-6xl">{c.title}</h3>
                  <p className="mt-4 max-w-md text-muted sm:text-lg">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 flex justify-center [zoom:0.58] sm:[zoom:0.8] lg:order-2 lg:[zoom:1] [--device-w:270px]">
            <Device3D stage={stage} yaw={-28 + progress * 56} interactive={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
