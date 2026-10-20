import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { AdminShell } from "@/components/admin/shell";
import { LiveRefresh } from "@/components/admin/live-refresh";
import { RegisterServiceWorker } from "@/components/admin/register-sw";
import { ToastProvider } from "@/components/admin/toast";
import { requireOwner } from "@/lib/crm/auth";
import { getLeads, getThreads } from "@/lib/crm/data";

export const metadata: Metadata = {
  title: { default: "Command Center", template: `%s · ${brand.shortName} CRM` },
  robots: { index: false, follow: false },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: `${brand.shortName} CRM`, statusBarStyle: "black-translucent" },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const who = await requireOwner();
  const [threads, leads] = await Promise.all([getThreads(), getLeads()]);
  const badges = {
    inbox: threads.filter((t) => t.needs_approval).length,
    calls: leads.filter((l) => l.stage === "needs_call" || l.stage === "call_booked").length,
  };
  return (
    <ToastProvider>
      <AdminShell badges={badges} demo={who.demo} agencyName={brand.name}>
        {children}
      </AdminShell>
      <LiveRefresh />
      <RegisterServiceWorker />
    </ToastProvider>
  );
}
