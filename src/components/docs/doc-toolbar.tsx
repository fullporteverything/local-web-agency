"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

/** Back link, lead picker, and Save-as-PDF for a document preview. Hidden when printing. */
export function DocToolbar({
  slug,
  leads,
  leadId,
}: {
  slug: string;
  leads?: { id: string; name: string }[];
  leadId?: string;
}) {
  const router = useRouter();
  return (
    <div className="no-print mx-auto mb-5 flex w-full max-w-[52rem] flex-wrap items-center gap-3">
      <Link href="/admin/docs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Documents
      </Link>
      {leads && leads.length > 0 && (
        <select
          value={leadId}
          onChange={(e) => router.push(`/admin/docs/${slug}?lead=${e.target.value}`)}
          className="ml-auto max-w-[14rem] rounded-full border border-line bg-surface px-3 py-2 text-sm"
          aria-label="Fill in for"
        >
          {leads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      )}
      <button
        onClick={() => window.print()}
        className={`inline-flex items-center gap-2 rounded-full bg-[#ecebe6] px-4 py-2 text-sm font-medium text-[#0b0c0b] ${leads?.length ? "" : "ml-auto"}`}
      >
        <Printer size={15} /> Save as PDF
      </button>
    </div>
  );
}
