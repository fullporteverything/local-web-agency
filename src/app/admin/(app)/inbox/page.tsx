import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bot, Pin, User } from "lucide-react";
import { Badge, Card, Empty, PageTitle, timeAgo } from "@/components/admin/ui";
import { getThreads } from "@/lib/crm/data";
import { cn } from "@/lib/utils";
import { DraftEditor } from "./draft-editor";

export const metadata: Metadata = { title: "Inbox" };

const channelLabel = { email: "Email", portal: "Portal", call: "Call", web_form: "Website form" } as const;
const writerLabel: Record<string, string> = {
  ai: "AI", acen: "You", ai_edited_by_acen: "AI + you", client: "Client", lead: "Lead",
};

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ thread?: string }> }) {
  const { thread: selectedId } = await searchParams;
  const threads = await getThreads();
  const selected = threads.find((t) => t.id === selectedId) ?? (selectedId ? null : null);
  const pinned = threads.filter((t) => t.needs_approval);

  return (
    <>
      <PageTitle title="Inbox" sub={pinned.length ? `${pinned.length} draft${pinned.length > 1 ? "s" : ""} waiting for you. The AI handles the rest.` : "The AI is handling every thread."} />
      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <Card className={cn("overflow-hidden", selected && "hidden lg:block")}>
          {threads.length === 0 ? (
            <Empty title="No conversations yet." />
          ) : (
            <ul className="max-h-[75vh] divide-y divide-line overflow-y-auto">
              {threads.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/admin/inbox?thread=${t.id}`}
                    className={cn("block px-4 py-3.5 hover:bg-white/[0.03]", t.id === selected?.id && "bg-white/[0.05]")}
                  >
                    <div className="flex items-center gap-2">
                      {t.needs_approval && <Pin size={13} className="shrink-0 text-emerald-300" />}
                      <p className={cn("flex-1 truncate text-sm", t.unread_inbound ? "font-semibold" : "font-medium")}>{t.business_name}</p>
                      <span className="shrink-0 text-xs text-muted">{timeAgo(t.last_at)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted">{t.subject}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted/80">{t.last_snippet}</p>
                    <div className="mt-2 flex gap-1.5">
                      <Badge>{channelLabel[t.channel]}</Badge>
                      {t.needs_approval && <Badge tone="green">Needs approval</Badge>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {selected ? (
          <Card className="flex min-h-[60vh] flex-col overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line px-4 py-3.5 sm:px-5">
              <Link href="/admin/inbox" className="rounded-full p-1 text-muted hover:text-ink lg:hidden" aria-label="Back"><ArrowLeft size={18} /></Link>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{selected.subject}</p>
                {selected.business_id && (
                  <Link href={`/admin/leads/${selected.business_id}`} className="text-xs text-muted hover:text-ink">{selected.business_name} →</Link>
                )}
              </div>
              <Badge>{channelLabel[selected.channel]}</Badge>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
              {selected.messages.map((m) =>
                m.status === "pending_approval" ? (
                  <DraftEditor key={m.id} message={m} />
                ) : (
                  <div key={m.id} className={cn("flex", m.direction === "outbound" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[85%] rounded-2xl px-4 py-3", m.direction === "outbound" ? "bg-white/[0.06]" : "border border-line")}>
                      <div className="mb-1.5 flex items-center gap-2 text-[11px] text-muted">
                        {m.direction === "outbound" ? <Bot size={12} /> : <User size={12} />}
                        {writerLabel[m.written_by ?? ""] ?? m.written_by}
                        {m.auto_sent && " · sent automatically"}
                        {m.status === "discarded" && " · discarded"}
                        <span>· {timeAgo(m.sent_at ?? m.created_at)}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>
                      {m.direction === "inbound" && m.ai_classification && (
                        <p className="mt-2 text-[11px] text-muted">
                          AI read this as <span className="text-ink">{m.ai_classification.replaceAll("_", " ")}</span>
                          {m.ai_confidence !== null && ` (${Math.round(m.ai_confidence * 100)}% sure)`}
                        </p>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </Card>
        ) : (
          <Card className="hidden min-h-[60vh] items-center justify-center lg:flex">
            <Empty title="Pick a conversation." body="Pinned threads have a draft waiting for your OK." />
          </Card>
        )}
      </div>
    </>
  );
}
