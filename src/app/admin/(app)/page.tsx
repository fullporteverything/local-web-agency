import Link from "next/link";
import { AlertTriangle, ArrowRight, Flame, MessageSquareText, Phone, Power, ShieldCheck } from "lucide-react";
import { ActionButton } from "@/components/admin/action-button";
import { Badge, Card, CardHeader, Empty, PageTitle, ScoreDot, Stat, money, timeAgo } from "@/components/admin/ui";
import { approveMessage, dismissTask, setKillSwitch } from "@/lib/crm/actions";
import { actorLabel, describeActivity } from "@/lib/crm/activity";
import { getActivity, getHealth, getLeads, getMetrics, getTasks, getThreads } from "@/lib/crm/data";
import { stageLabels, stageTone } from "@/lib/crm/stages";

export default async function CommandCenter() {
  const [tasks, threads, metrics, health, activity, leads] = await Promise.all([
    getTasks(), getThreads(), getMetrics(), getHealth(), getActivity(25), getLeads(),
  ]);
  const hot = leads.filter((l) => ["replied", "payment_clicked", "call_booked"].includes(l.stage)).slice(0, 5);
  const profit = metrics.mrr - metrics.monthCosts;
  const totalActions = metrics.autoActionsToday + metrics.acenActionsToday;
  const autoPct = totalActions ? Math.round((metrics.autoActionsToday / totalActions) * 100) : 100;
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "America/New_York" }).format(new Date()));
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  return (
    <>
      <PageTitle
        title={`${greeting}, Acen.`}
        sub={tasks.length ? `${tasks.length} thing${tasks.length > 1 ? "s" : ""} need you. Everything else is running.` : "Nothing needs you right now. Everything is running."}
      />

      {/* Needs you */}
      <Card className="overflow-hidden border-emerald-400/20">
        <CardHeader title={<span className="flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />Needs you</span>} sub="Only what the system can't do on its own." />
        {tasks.length === 0 ? (
          <Empty title="All clear." body="The system will ping your phone if anything comes up." />
        ) : (
          <ul className="divide-y divide-line">
            {tasks.map((t) => {
              const thread = t.kind === "approve_message" ? threads.find((th) => th.messages.some((m) => m.id === t.ref_id)) : null;
              const draft = thread?.messages.find((m) => m.id === t.ref_id);
              return (
                <li key={t.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
                    {t.kind === "call" ? <Phone size={16} /> : t.kind === "approve_message" ? <MessageSquareText size={16} /> : <AlertTriangle size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{t.title}</p>
                    {t.detail && <p className="mt-0.5 text-sm text-muted">{t.detail}</p>}
                    {draft && (
                      <div className="mt-2 rounded-xl bg-white/[0.03] px-3 py-2">
                        <p className="line-clamp-2 text-sm text-ink/80">“{draft.body}”</p>
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {t.kind === "approve_message" && t.ref_id && (
                      <>
                        <ActionButton variant="green" action={approveMessage.bind(null, t.ref_id, undefined)}>Approve</ActionButton>
                        <Link href={`/admin/inbox?thread=${thread?.id ?? ""}`} className="inline-flex items-center rounded-full border border-line px-3.5 py-2 text-sm hover:bg-white/5">Edit</Link>
                      </>
                    )}
                    {t.kind === "call" && t.business_id && (
                      <Link href={`/admin/calls?lead=${t.business_id}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#ecebe6] px-3.5 py-2 text-sm font-medium text-[#0b0c0b]">
                        <Phone size={14} /> Open call card
                      </Link>
                    )}
                    {t.kind !== "approve_message" && t.kind !== "call" && (
                      <ActionButton action={dismissTask.bind(null, t.id)}>Done</ActionButton>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Numbers */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="MRR" value={money(metrics.mrr)} hint={`${metrics.activeClients} active client${metrics.activeClients === 1 ? "" : "s"}`} accent />
        <Stat label="Setup revenue" value={money(metrics.setupRevenue)} hint="All time" />
        <Stat label="Profit this month" value={money(Math.round(profit * 100) / 100)} hint={`${money(metrics.monthCosts)} in costs`} />
        <Stat label="Ran on autopilot" value={`${autoPct}%`} hint={`${metrics.autoActionsToday} auto · ${metrics.acenActionsToday} you, today`} />
        <Stat label="Leads found" value={metrics.leadsToday} hint="Today" />
        <Stat label="Emails sent" value={metrics.emailsToday} hint="Today" />
        <Stat label="Replies" value={metrics.repliesToday} hint="Today" />
        <Stat label="Demo views" value={metrics.demosViewedToday} hint="Today" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        {/* Activity */}
        <Card className="min-w-0">
          <CardHeader title="Live activity" sub="What the system did, as it happens." />
          <ul className="max-h-[28rem] divide-y divide-line overflow-y-auto">
            {activity.map((a) => (
              <li key={a.id} className="flex gap-3 px-4 py-3 text-sm sm:px-5">
                <Badge tone={a.actor === "ai" ? "green" : a.actor === "acen" ? "blue" : a.actor === "lead" ? "amber" : "muted"} className="mt-0.5 w-14 justify-center">
                  {actorLabel[a.actor]}
                </Badge>
                <div className="min-w-0 flex-1">
                  {a.business_id ? (
                    <Link href={`/admin/leads/${a.business_id}`} className="font-medium hover:underline">{a.business_name}</Link>
                  ) : (
                    <span className="font-medium">System</span>
                  )}
                  <p className="text-muted">{describeActivity(a)}</p>
                </div>
                <span className="shrink-0 text-xs text-muted">{timeAgo(a.created_at)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="min-w-0 space-y-5">
          {/* Hot leads */}
          <Card>
            <CardHeader title={<span className="flex items-center gap-2"><Flame size={15} className="text-amber-300" /> Hot right now</span>} action={<Link href="/admin/pipeline" className="text-xs text-muted hover:text-ink">Pipeline →</Link>} />
            {hot.length === 0 ? (
              <Empty title="Nothing hot yet." />
            ) : (
              <ul className="divide-y divide-line">
                {hot.map((l) => (
                  <li key={l.id}>
                    <Link href={`/admin/leads/${l.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] sm:px-5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{l.name}</p>
                        <p className="text-xs text-muted">{l.city} · {money(l.assessment?.setup_price)} + {money(l.assessment?.monthly_price)}/mo</p>
                      </div>
                      <Badge tone={stageTone(l.stage)}>{stageLabels[l.stage]}</Badge>
                      <ScoreDot score={l.lead_score} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* System health */}
          <Card>
            <CardHeader title={<span className="flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-300" /> System health</span>} />
            <div className="space-y-4 px-4 py-4 sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium"><Power size={14} /> Outreach</p>
                  <p className="text-xs text-muted">{health.killSwitchOn ? "ON: emails go out within your limits." : "OFF: nothing real is sent."}</p>
                </div>
                <ActionButton
                  variant={health.killSwitchOn ? "danger" : "green"}
                  confirm={health.killSwitchOn ? "Turn outreach OFF? Nothing will be sent until you turn it back on." : "Turn outreach ON? Real emails will start going out within your limits."}
                  action={setKillSwitch.bind(null, !health.killSwitchOn)}
                >
                  {health.killSwitchOn ? "Turn off" : "Turn on"}
                </ActionButton>
              </div>
              {health.inboxes.map((ib) => (
                <div key={ib.address}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate text-muted">{ib.address}</span>
                    <Badge tone={ib.health === "good" ? "green" : ib.health === "watch" ? "amber" : "red"}>{ib.health}</Badge>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(100, (ib.sent_today / ib.daily_cap) * 100)}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    {ib.sent_today}/{ib.daily_cap} sent today · warm-up day {ib.warmup_day} · bounce {(ib.bounce_rate * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
              {health.inboxes.length === 0 && <p className="text-sm text-muted">No sending inbox connected yet.</p>}
              <p className="flex items-center justify-between text-xs text-muted">
                Failed jobs (24h) <span className={health.failedJobs ? "text-rose-300" : ""}>{health.failedJobs}</span>
              </p>
            </div>
          </Card>

          <Link href="/admin/inbox" className="flex items-center justify-between rounded-2xl border border-line px-5 py-4 text-sm hover:bg-white/[0.03]">
            Open the AI inbox <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </>
  );
}
