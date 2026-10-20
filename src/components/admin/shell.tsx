"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Columns3, Gauge, GraduationCap, Inbox, LineChart, Phone, Settings, Users } from "lucide-react";
import { LogoMark } from "@/components/site/ui";
import { cn } from "@/lib/utils";

// Screens marked later are built in later steps of the spec; they show in the sidebar so the map is clear.
const nav = [
  { href: "/admin", label: "Command", icon: Gauge, mobile: true },
  { href: "/admin/pipeline", label: "Pipeline", icon: Columns3, mobile: true },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox, mobile: true, badgeKey: "inbox" },
  { href: "/admin/calls", label: "Calls", icon: Phone, mobile: true, badgeKey: "calls" },
  { href: "/admin/clients", label: "Clients", icon: Users, later: true },
  { href: "/admin/learning", label: "Learning", icon: GraduationCap, later: true },
  { href: "/admin/analytics", label: "Analytics", icon: LineChart, later: true },
  { href: "/admin/assistant", label: "Assistant", icon: Bot, later: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, mobile: true, later: true },
] as const;

export function AdminShell({
  children,
  badges,
  demo,
  agencyName,
}: {
  children: React.ReactNode;
  badges: Record<string, number>;
  demo: boolean;
  agencyName: string;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-[#0b0d0c] px-3 py-5 lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-3 pb-6">
          <LogoMark size={20} />
          <span className="text-sm font-medium tracking-wide">{agencyName}</span>
        </Link>
        <nav className="flex-1 space-y-0.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const count = "badgeKey" in item ? badges[item.badgeKey] : 0;
            return (
              <Link
                key={item.href}
                href={"later" in item && item.later ? "#" : item.href}
                aria-disabled={"later" in item && item.later}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  isActive(item.href) ? "bg-white/[0.07] text-ink" : "text-muted hover:bg-white/[0.04] hover:text-ink",
                  "later" in item && item.later && "pointer-events-none opacity-40",
                )}
              >
                <Icon size={17} />
                <span className="flex-1">{item.label}</span>
                {count > 0 && <span className="rounded-full bg-emerald-500 px-1.5 text-[11px] font-semibold text-[#04140b]">{count}</span>}
                {"later" in item && item.later && <span className="text-[10px] uppercase tracking-wider">soon</span>}
              </Link>
            );
          })}
        </nav>
        <Link href="/" className="px-3 text-xs text-muted hover:text-ink">View agency site →</Link>
      </aside>

      <div className="min-w-0">
        {demo && (
          <div className="border-b border-amber-400/20 bg-amber-400/[0.07] px-4 py-2 text-center text-xs text-amber-200">
            Demo mode: fake data, nothing is saved or sent. Connect Supabase to go live.
          </div>
        )}
        <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-5 sm:px-6 lg:pb-12 lg:pt-8">{children}</main>
      </div>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[#0b0d0c]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5">
          {nav.filter((n) => "mobile" in n && n.mobile).map((item) => {
            const Icon = item.icon;
            const count = "badgeKey" in item ? badges[item.badgeKey] : 0;
            const disabled = "later" in item && item.later;
            return (
              <Link
                key={item.href}
                href={disabled ? "#" : item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[10px]",
                  isActive(item.href) ? "text-ink" : "text-muted",
                  disabled && "pointer-events-none opacity-40",
                )}
              >
                <Icon size={20} />
                {item.label}
                {count > 0 && (
                  <span className="absolute right-[calc(50%-1.1rem)] top-1.5 min-w-4 rounded-full bg-emerald-500 px-1 text-center text-[10px] font-semibold text-[#04140b]">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
