import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { documents } from "@/components/docs/documents";
import { Badge, Card, PageTitle } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Documents" };

const audienceLabel = { lead: "Lead", client: "Client", anyone: "Public" } as const;

export default function DocsLibrary() {
  return (
    <>
      <PageTitle
        title="Documents"
        sub="Ten client documents that fill themselves in from each lead's details. Open one to preview it for any lead or save it as a PDF."
      />
      <Card className="overflow-hidden">
        <ul className="divide-y divide-line">
          {documents.map((d) => (
            <li key={d.slug}>
              <Link href={`/admin/docs/${d.slug}`} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-4 hover:bg-white/[0.02] sm:grid-cols-[3rem_1fr_16rem_auto] sm:px-5">
                <span className="font-display text-2xl italic text-white/30">{String(d.n).padStart(2, "0")}</span>
                <span>
                  <span className="block text-sm font-medium">{d.title}</span>
                  <span className="block text-xs text-muted">{d.blurb}</span>
                </span>
                <span className="hidden text-xs text-muted sm:block">
                  <Badge className="mr-2">{audienceLabel[d.audience]}</Badge>
                  {d.sentWhen}
                </span>
                <ArrowUpRight size={16} className="text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
      <p className="mt-4 text-sm text-muted">
        The Package Menu is also public at <Link href="/packages" className="text-ink underline-offset-4 hover:underline">/packages</Link>, so the AI can link it when a lead asks about options.
      </p>
    </>
  );
}
