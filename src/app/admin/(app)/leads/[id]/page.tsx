import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot, ExternalLink, FileText, Globe, Mail, MapPin, Phone, Star, User } from "lucide-react";
import { documents } from "@/components/docs/documents";
import { Badge, Card, CardHeader, ScoreDot, money, timeAgo } from "@/components/admin/ui";
import { actorLabel, describeActivity } from "@/lib/crm/activity";
import { getCalls, getLead, getLeadActivity, getMessages } from "@/lib/crm/data";
import { nextActionLabels, presenceLabels, stageLabels, stageTone, tierLabels } from "@/lib/crm/stages";
import { ManualMessage, PriceOverride, StagePicker } from "./lead-actions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lead = await getLead((await params).id);
  return { title: lead?.name ?? "Lead" };
}

const sizeLabels = { family_solo: "Family / solo", small: "Small", established: "Established", premium: "Premium" } as const;

export default async function LeadPage({ params }: Props) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();
  const [messages, activity, calls] = await Promise.all([getMessages(id), getLeadActivity(id), getCalls()]);
  const a = lead.assessment;

  type Item = { at: string; kind: "message" | "activity" | "call"; node: React.ReactNode };
  const timeline: Item[] = [
    ...messages.map((m) => ({
      at: m.created_at,
      kind: "message" as const,
      node: (
        <div>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            {m.direction === "outbound" ? <Bot size={12} /> : <User size={12} />}
            {m.direction === "outbound" ? "We sent" : "They wrote"} · {m.channel.replace("_", " ")}
            {m.status === "pending_approval" && <Badge tone="green" className="ml-1">waiting for you</Badge>}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>
        </div>
      ),
    })),
    ...activity
      .filter((x) => !["email_reply_received", "drafted_reply"].includes(x.action))
      .map((x) => ({
        at: x.created_at,
        kind: "activity" as const,
        node: <p className="text-sm text-muted"><span className="text-ink">{actorLabel[x.actor]}:</span> {describeActivity(x)}</p>,
      })),
    ...calls.filter((c) => c.business_id === id).map((c) => ({
      at: c.created_at,
      kind: "call" as const,
      node: <p className="text-sm text-muted"><span className="text-ink">Call</span> {c.outcome ? c.outcome.replaceAll("_", " ") : "booked"}{c.notes && ` · ${c.notes}`}</p>,
    })),
  ].sort((x, y) => y.at.localeCompare(x.at));

  return (
    <>
      <Link href="/admin/pipeline" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft size={15} /> Pipeline</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={stageTone(lead.stage)}>{stageLabels[lead.stage]}</Badge>
            {lead.web_presence && <Badge>{presenceLabels[lead.web_presence]}</Badge>}
            {lead.is_family_business && <Badge>Family business</Badge>}
            <ScoreDot score={lead.lead_score} />
          </div>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{lead.name}</h1>
          <p className="mt-1 text-sm text-muted">{[lead.category, lead.city].filter(Boolean).join(" · ")} · found {timeAgo(lead.created_at)} via {lead.source.replace("_", " ")}</p>
        </div>
        <StagePicker businessId={lead.id} stage={lead.stage} />
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white/[0.02] px-4 py-3 text-sm">
        <span className="text-muted">Next: </span>
        {lead.next_action ? (
          <>
            {lead.owner === "acen" ? <span className="text-emerald-300">You</span> : <span>System</span>} will {(nextActionLabels[lead.next_action] ?? lead.next_action).toLowerCase()}
            {lead.next_action_at && <span className="text-muted"> · {timeAgo(lead.next_action_at)}</span>}
          </>
        ) : (
          <span className="text-muted">nothing scheduled</span>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          {/* Pricing */}
          <Card>
            <CardHeader
              title="Price"
              sub={a?.overridden_by_acen ? "Set by you" : "Set automatically by the AI"}
              action={a?.recommended_tier && <Badge>{tierLabels[a.recommended_tier]}</Badge>}
            />
            <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
              <div>
                <p className="font-display text-5xl leading-none">{money(a?.setup_price)}</p>
                <p className="mt-1 text-sm text-muted">setup, then {money(a?.monthly_price)}/month</p>
                <div className="mt-4 space-y-1.5 text-sm">
                  <p><span className="text-muted">Quality score:</span> {a?.quality_score ?? "—"}/100</p>
                  <p><span className="text-muted">Size:</span> {a?.size_signal ? sizeLabels[a.size_signal] : "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted">Why this price</p>
                <p className="mt-1.5 text-sm leading-relaxed">{a?.reasoning ?? "Not priced yet."}</p>
                {a?.rules_applied && a.rules_applied.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {a.rules_applied.map((r) => <Badge key={r}>{r.replaceAll("_", " ")}</Badge>)}
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-line p-4 sm:p-5">
              <PriceOverride businessId={lead.id} setup={a?.setup_price ?? null} monthly={a?.monthly_price ?? null} familyCap={a?.size_signal === "family_solo"} />
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader title="Timeline" sub="Every email, call, and automatic step." />
            <div className="border-b border-line p-4 sm:p-5">
              <ManualMessage businessId={lead.id} disabled={!lead.email} />
            </div>
            <ol className="divide-y divide-line">
              {timeline.map((item, n) => (
                <li key={n} className="flex gap-3 px-4 py-3.5 sm:px-5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                  <div className="min-w-0 flex-1">{item.node}</div>
                  <span className="shrink-0 text-xs text-muted">{timeAgo(item.at)}</span>
                </li>
              ))}
              {timeline.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted">Nothing yet.</li>}
            </ol>
          </Card>
        </div>

        <div className="space-y-5">
          {/* Contact */}
          <Card>
            <CardHeader title="Contact" />
            <ul className="space-y-3 p-4 text-sm sm:p-5">
              {lead.contact_name && <li className="flex items-center gap-2.5"><User size={15} className="text-muted" /> {lead.contact_name}</li>}
              {lead.phone && <li><a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2.5 hover:underline"><Phone size={15} className="text-muted" /> {lead.phone}</a></li>}
              <li className="flex items-start gap-2.5">
                <Mail size={15} className="mt-0.5 text-muted" />
                {lead.email ? (
                  <span>{lead.email}<span className="block text-xs text-muted">from {lead.email_source?.replaceAll("_", " ") ?? "unknown"}</span></span>
                ) : (
                  <span className="text-muted">No public email found</span>
                )}
              </li>
              {lead.website_url && <li><a href={lead.website_url} target="_blank" rel="noopener" className="flex items-center gap-2.5 hover:underline"><Globe size={15} className="text-muted" /> Current website</a></li>}
              {lead.facebook_url && <li><a href={lead.facebook_url} target="_blank" rel="noopener" className="flex items-center gap-2.5 hover:underline"><Globe size={15} className="text-muted" /> Facebook</a></li>}
              {lead.city && <li className="flex items-center gap-2.5"><MapPin size={15} className="text-muted" /> {lead.address ? `${lead.address}, ` : ""}{lead.city}</li>}
              <li className="flex items-center gap-2.5"><Star size={15} className="fill-amber-400 text-amber-400" /> {lead.google_rating ?? "—"} · {lead.review_count ?? 0} reviews</li>
            </ul>
            {lead.website_issues.length > 0 && (
              <div className="border-t border-line p-4 sm:p-5">
                <p className="text-[11px] uppercase tracking-wider text-muted">Problems with their current site</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">{lead.website_issues.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            )}
            {lead.services.length > 0 && (
              <div className="border-t border-line p-4 sm:p-5">
                <p className="text-[11px] uppercase tracking-wider text-muted">Services</p>
                <div className="mt-2 flex flex-wrap gap-1.5">{lead.services.map((s) => <Badge key={s}>{s}</Badge>)}</div>
              </div>
            )}
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader title="Documents" sub="Filled in with this lead's details." />
            <ul className="grid grid-cols-2 gap-px bg-line">
              {documents.filter((doc) => doc.audience !== "anyone").map((doc) => (
                <li key={doc.slug} className="bg-surface">
                  <Link href={`/admin/docs/${doc.slug}?lead=${lead.id}`} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/[0.03]">
                    <FileText size={14} className="shrink-0 text-muted" /> <span className="truncate">{doc.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          {/* Demo */}
          <Card className="overflow-hidden">
            <CardHeader
              title="Demo site"
              action={lead.demo?.qa_passed !== undefined && lead.demo?.qa_passed !== null && <Badge tone={lead.demo.qa_passed ? "green" : "red"}>{lead.demo.qa_passed ? "QA passed" : "QA failed"}</Badge>}
            />
            {lead.demo?.url ? (
              <>
                <div className="flex aspect-[9/14] items-center justify-center bg-white/[0.02]">
                  {lead.demo.screenshot_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={lead.demo.screenshot_url} alt={`${lead.name} demo`} className="h-full w-full object-cover object-top" />
                  ) : (
                    <p className="px-6 text-center text-sm text-muted">Screenshot appears here once the demo generator runs (Step 7).</p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-line p-4 text-sm">
                  <span className="text-muted">{lead.demo.views} views · {lead.demo.unique_views} people{lead.demo.last_viewed_at && ` · last ${timeAgo(lead.demo.last_viewed_at)}`}</span>
                  <a href={lead.demo.url} target="_blank" rel="noopener" className="flex items-center gap-1 hover:underline">Open <ExternalLink size={13} /></a>
                </div>
              </>
            ) : (
              <p className="p-5 text-sm text-muted">Not built yet. It gets built automatically after pricing.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
