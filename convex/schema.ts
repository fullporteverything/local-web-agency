import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Database schema (spec Section 4.1). Convex applies changes to this file on every deploy,
// so this file is the migration history (see git log).
//
// Access rules live in convex/lib/access.ts and are enforced in every public function:
// owner sees everything, a client sees only their own rows, signed-out users see nothing.

export const stage = v.union(
  v.literal("new"), v.literal("qualified"), v.literal("priced"), v.literal("demo_built"), v.literal("emailed"),
  v.literal("follow_up_1"), v.literal("follow_up_2"), v.literal("replied"), v.literal("payment_clicked"),
  v.literal("needs_call"), v.literal("call_booked"), v.literal("paid"), v.literal("onboarding"), v.literal("building"),
  v.literal("live"), v.literal("retainer_active"), v.literal("canceled"), v.literal("site_removed"), v.literal("lost"),
  v.literal("later"), v.literal("suppressed"),
);
export const tier = v.union(v.literal("basic"), v.literal("premium"), v.literal("all_out"));
export const webPresence = v.union(
  v.literal("none"), v.literal("weak_site"), v.literal("facebook_only"), v.literal("social_only"), v.literal("ok"),
);
export const sizeSignal = v.union(v.literal("family_solo"), v.literal("small"), v.literal("established"), v.literal("premium"));
export const actor = v.union(v.literal("system"), v.literal("ai"), v.literal("acen"), v.literal("client"), v.literal("lead"));

export const assessment = v.object({
  qualityScore: v.number(),
  sizeSignal,
  recommendedTier: tier,
  setupPrice: v.number(), // whole dollars
  monthlyPrice: v.number(),
  reasoning: v.string(),
  rulesApplied: v.array(v.string()),
  overriddenByAcen: v.boolean(),
  assessedAt: v.number(),
});

export default defineSchema({
  ...authTables,

  // A lead/business. Pipeline state and the AI's price assessment live on the same document.
  businesses: defineTable({
    name: v.string(),
    category: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    county: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()), // always lowercase
    emailSource: v.optional(v.string()),
    emailConfidence: v.optional(v.number()),
    emailVerifiedAt: v.optional(v.number()),
    websiteUrl: v.optional(v.string()),
    webPresence: v.optional(webPresence),
    websiteIssues: v.array(v.string()),
    facebookUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    googleRating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    hours: v.optional(v.any()),
    services: v.array(v.string()),
    photos: v.array(v.any()),
    reviews: v.array(v.any()),
    yearsInBusiness: v.optional(v.number()),
    isFamilyBusiness: v.optional(v.boolean()),
    isChain: v.boolean(),
    source: v.union(v.literal("google_places"), v.literal("google_search"), v.literal("inbound"), v.literal("manual"), v.literal("seed")),
    placeId: v.optional(v.string()),
    isDemo: v.boolean(),
    contactName: v.optional(v.string()),

    // pipeline
    stage,
    stageChangedAt: v.number(),
    nextAction: v.optional(v.string()),
    nextActionAt: v.optional(v.number()),
    owner: v.union(v.literal("auto"), v.literal("acen")),
    leadScore: v.number(),
    lostReason: v.optional(v.string()),
    resurfaceAt: v.optional(v.number()),

    assessment: v.optional(assessment),
  })
    .index("by_place_id", ["placeId"])
    .index("by_email", ["email"])
    .index("by_stage", ["stage", "leadScore"])
    .index("by_owner", ["owner", "nextActionAt"])
    .index("by_demo", ["isDemo"]),

  contacts: defineTable({
    businessId: v.id("businesses"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    isPrimary: v.boolean(),
  }).index("by_business", ["businessId"]),

  pricingFeedback: defineTable({
    businessId: v.id("businesses"),
    aiSetupPrice: v.optional(v.number()),
    aiMonthlyPrice: v.optional(v.number()),
    acenSetupPrice: v.number(),
    acenMonthlyPrice: v.number(),
    acenNote: v.optional(v.string()),
  }).index("by_business", ["businessId"]),

  demoSites: defineTable({
    businessId: v.id("businesses"),
    tierShown: tier,
    vercelProjectId: v.optional(v.string()),
    url: v.optional(v.string()),
    screenshotUrl: v.optional(v.string()),
    builtAt: v.number(),
    qaPassed: v.optional(v.boolean()),
    qaReport: v.optional(v.any()),
    attempt: v.number(),
    views: v.number(),
    uniqueViews: v.number(),
    lastViewedAt: v.optional(v.number()),
    isCurrent: v.boolean(),
  }).index("by_business", ["businessId", "isCurrent"]),

  sendingInboxes: defineTable({
    address: v.string(),
    domain: v.string(),
    displayName: v.optional(v.string()),
    dailyCap: v.number(),
    sentToday: v.number(),
    warmupDay: v.number(),
    health: v.union(v.literal("good"), v.literal("watch"), v.literal("paused")),
    pausedReason: v.optional(v.string()),
    bounceRate: v.number(),
    complaintCount: v.number(),
    openRate7d: v.optional(v.number()),
    oauthConnected: v.boolean(),
  }).index("by_address", ["address"]),

  messages: defineTable({
    threadId: v.optional(v.string()),
    gmailMessageId: v.optional(v.string()),
    businessId: v.optional(v.id("businesses")),
    channel: v.union(v.literal("email"), v.literal("portal"), v.literal("call"), v.literal("web_form")),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    status: v.union(
      v.literal("draft"), v.literal("pending_approval"), v.literal("scheduled"), v.literal("sent"), v.literal("delivered"),
      v.literal("bounced"), v.literal("failed"), v.literal("received"), v.literal("discarded"),
    ),
    aiClassification: v.optional(v.string()),
    aiConfidence: v.optional(v.number()),
    aiReasoning: v.optional(v.string()),
    autoSent: v.boolean(),
    writtenBy: v.optional(v.union(v.literal("ai"), v.literal("acen"), v.literal("ai_edited_by_acen"), v.literal("client"), v.literal("lead"))),
    sentFromInbox: v.optional(v.id("sendingInboxes")),
    scheduledFor: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
  })
    .index("by_business", ["businessId"])
    .index("by_thread", ["threadId"])
    .index("by_status", ["status"])
    .index("by_gmail_id", ["gmailMessageId"]),

  replyLibrary: defineTable({
    situationType: v.string(),
    inboundText: v.optional(v.string()),
    responseText: v.string(),
    aiDraftText: v.optional(v.string()),
    source: v.union(v.literal("acen_written"), v.literal("acen_edited"), v.literal("ai_approved"), v.literal("seed")),
    sourceMessageId: v.optional(v.id("messages")),
    outcome: v.optional(v.union(v.literal("paid"), v.literal("booked"), v.literal("replied"), v.literal("no_reply"), v.literal("unsubscribed"))),
    qualityRating: v.optional(v.number()),
    embedding: v.optional(v.array(v.float64())),
  }).vectorIndex("by_embedding", { vectorField: "embedding", dimensions: 1024, filterFields: ["situationType"] }),

  styleRules: defineTable({
    ruleText: v.string(),
    kind: v.union(v.literal("style"), v.literal("pricing")),
    scope: v.optional(v.string()),
    learnedFromMessageId: v.optional(v.id("messages")),
    source: v.union(v.literal("learned"), v.literal("instruction")),
    status: v.union(v.literal("proposed"), v.literal("active"), v.literal("disabled")),
  }).index("by_status", ["status"]),

  paymentLinks: defineTable({
    businessId: v.id("businesses"),
    tier,
    setupPrice: v.number(),
    monthlyPrice: v.number(),
    stripeSessionId: v.optional(v.string()),
    stripeSessionUrl: v.optional(v.string()),
    clickedAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
  }).index("by_business", ["businessId"]),

  calls: defineTable({
    businessId: v.id("businesses"),
    scheduledAt: v.optional(v.number()),
    outcome: v.optional(v.string()),
    notes: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    followUpAt: v.optional(v.number()),
  }).index("by_business", ["businessId"]),

  clients: defineTable({
    businessId: v.id("businesses"),
    email: v.string(), // the email they log into the portal with (lowercase)
    userId: v.optional(v.id("users")),
    tier,
    setupPrice: v.number(),
    monthlyPrice: v.number(),
    stripeCustomerId: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    retainerStatus: v.union(v.literal("pending"), v.literal("active"), v.literal("past_due"), v.literal("canceling"), v.literal("canceled")),
    liveUrl: v.optional(v.string()),
    customDomain: v.optional(v.string()),
    screenshotUrl: v.optional(v.string()),
    showcasePermission: v.boolean(),
    startDate: v.optional(v.number()),
    editsUsedThisMonth: v.number(),
    editAllowance: v.number(),
    nextBillingAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    siteRemovedAt: v.optional(v.number()),
  })
    .index("by_business", ["businessId"])
    .index("by_email", ["email"])
    .index("by_user", ["userId"])
    .index("by_status", ["retainerStatus"]),

  clientCosts: defineTable({
    clientId: v.id("clients"),
    month: v.string(), // YYYY-MM
    hosting: v.number(),
    domain: v.number(),
    email: v.number(),
    aiUsage: v.number(),
    stripeFees: v.number(),
    other: v.number(),
  }).index("by_month", ["month", "clientId"]),

  editRequests: defineTable({
    clientId: v.id("clients"),
    requestText: v.string(),
    attachments: v.array(v.id("_storage")),
    category: v.optional(v.union(v.literal("included"), v.literal("extra"))),
    quotedPrice: v.optional(v.number()),
    status: v.union(
      v.literal("received"), v.literal("in_progress"), v.literal("preview_ready"), v.literal("approved"), v.literal("live"), v.literal("declined"),
    ),
    autoHandled: v.boolean(),
    previewUrl: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  }).index("by_client", ["clientId"]),

  projectProgress: defineTable({
    clientId: v.id("clients"),
    step: v.union(v.literal("paid"), v.literal("details_received"), v.literal("building"), v.literal("preview_ready"), v.literal("approved"), v.literal("live")),
    status: v.union(v.literal("pending"), v.literal("current"), v.literal("done")),
    note: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_client", ["clientId"]),

  clientUploads: defineTable({
    clientId: v.id("clients"),
    storageId: v.id("_storage"),
    type: v.union(v.literal("logo"), v.literal("photo"), v.literal("doc")),
  }).index("by_client", ["clientId"]),

  assistantConversations: defineTable({ title: v.optional(v.string()), updatedAt: v.number() }),
  assistantMessages: defineTable({
    conversationId: v.id("assistantConversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("tool")),
    content: v.optional(v.string()),
    toolCalls: v.optional(v.any()),
  }).index("by_conversation", ["conversationId"]),

  // The "Needs you" list.
  tasks: defineTable({
    businessId: v.optional(v.id("businesses")),
    kind: v.string(),
    title: v.string(),
    detail: v.optional(v.string()), // one sentence telling Acen exactly what to do
    priority: v.number(),
    refId: v.optional(v.string()),
    status: v.union(v.literal("open"), v.literal("done"), v.literal("dismissed")),
    dueAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_status", ["status", "priority"])
    .index("by_ref", ["refId"])
    .index("by_business", ["businessId", "status"]),

  // Checked before EVERY email, text, or call.
  suppression: defineTable({
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    businessId: v.optional(v.id("businesses")),
    reason: v.union(v.literal("opt_out"), v.literal("bounce"), v.literal("complaint"), v.literal("manual"), v.literal("not_interested")),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"]),

  // Single row (key = "main").
  settings: defineTable({
    key: v.literal("main"),
    killSwitchOn: v.boolean(), // false = NO real outreach is sent
    demoMode: v.boolean(),
    businessHoursStart: v.string(),
    businessHoursEnd: v.string(),
    timezone: v.string(),
    sendDays: v.array(v.number()),
    replyDelayMinMinutes: v.number(),
    replyDelayMaxMinutes: v.number(),
    targetCities: v.array(v.string()),
    tierRanges: v.any(),
    familySetupCeiling: v.number(),
    familyMonthlyCeiling: v.number(),
    marginTarget: v.number(),
    confidenceThreshold: v.number(),
    reviewFirstNEmails: v.number(),
    placesDailyBudgetUsd: v.number(),
    aiDailyBudgetUsd: v.number(),
    signature: v.string(),
  }).index("by_key", ["key"]),

  activityLog: defineTable({
    businessId: v.optional(v.id("businesses")),
    actor,
    action: v.string(),
    detail: v.any(),
    neededAcen: v.boolean(),
  }).index("by_business", ["businessId"]),

  jobRuns: defineTable({
    job: v.string(),
    status: v.union(v.literal("running"), v.literal("ok"), v.literal("failed"), v.literal("retrying")),
    attempt: v.number(),
    error: v.optional(v.string()),
    finishedAt: v.optional(v.number()),
  }).index("by_status", ["status"]),
});
