import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";
import { Logo } from "@/components/site/ui";
import { MagicLinkForm } from "./magic-link-form";

export const metadata: Metadata = { title: "Client login", robots: { index: false } };

// Client portal entry. The full portal (progress, edits, billing) is built in a later step;
// this login works as soon as Supabase Auth is configured.
export default function PortalLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center"><Logo name={brand.name} /></Link>
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h1 className="font-display text-2xl font-semibold">Client login</h1>
          <p className="mt-2 text-sm text-muted">
            Enter the email you signed up with and we&apos;ll send you a login link. No password needed.
          </p>
          <MagicLinkForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Not a client yet? <Link href="/free-preview" className="text-pine hover:underline">Get a free preview</Link>
        </p>
      </div>
    </main>
  );
}
