import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";
import { Aurora } from "@/components/site/motion";
import { AuthProviders } from "@/components/convex/providers";
import { Logo } from "@/components/site/ui";
import { MagicLinkForm } from "@/app/portal/magic-link-form";

export const metadata: Metadata = { title: "Owner login", robots: { index: false } };

const errors: Record<string, string> = {
  not_owner: "That account isn't the owner account.",
  link_expired: "That login link expired. Send a new one.",
};

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-16">
      <Aurora />
      <div className="w-full max-w-md">
        <Link href="/" className="mb-10 flex justify-center"><Logo name={brand.name} /></Link>
        <div className="glass hairline-frame rounded-3xl p-8 sm:p-10">
          <h1 className="font-display text-5xl">Owner login</h1>
          <p className="mt-2 text-sm text-muted">We&apos;ll email you a one-time login link.</p>
          {error && errors[error] && <p className="mt-4 text-sm text-[var(--clay)]">{errors[error]}</p>}
          <AuthProviders><MagicLinkForm next="/admin" /></AuthProviders>
        </div>
      </div>
    </main>
  );
}
