import type { Metadata } from "next";
import { PageTitle } from "@/components/admin/ui";
import { getLeads } from "@/lib/crm/data";
import { Board } from "./board";

export const metadata: Metadata = { title: "Pipeline" };

export default async function PipelinePage() {
  const leads = await getLeads();
  return (
    <>
      <PageTitle title="Pipeline" sub="Cards move on their own as emails, views, clicks, and payments happen. Drag one only if you want to." />
      <Board leads={leads} />
    </>
  );
}
