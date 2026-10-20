import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findDoc } from "@/components/docs/documents";
import { DocToolbar } from "@/components/docs/doc-toolbar";
import { getLeads } from "@/lib/crm/data";
import { docDataFromLead } from "@/lib/docs/data";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ lead?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: findDoc((await params).slug)?.title ?? "Document" };
}

export default async function DocPreview({ params, searchParams }: Props) {
  const [{ slug }, { lead: leadId }] = await Promise.all([params, searchParams]);
  const doc = findDoc(slug);
  if (!doc) notFound();
  const leads = await getLeads();
  // Default to the most relevant lead for this doc so the preview is filled in.
  const preferred = doc.audience === "lead" ? leads.find((l) => l.demo?.url) : leads.find((l) => l.stage === "retainer_active") ?? leads[0];
  const lead = leads.find((l) => l.id === leadId) ?? preferred ?? leads[0];
  if (!lead) notFound();
  const data = docDataFromLead(lead);

  return (
    <>
      <DocToolbar slug={slug} leadId={lead.id} leads={leads.map((l) => ({ id: l.id, name: l.name }))} />
      <doc.Render d={data} />
    </>
  );
}
