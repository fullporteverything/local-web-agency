import { brand, tiers } from "@/config/brand";
import type { Lead, Tier } from "@/lib/crm/types";

// Everything a client document can show, built from a lead/client record.
// Missing values render as a clear placeholder instead of being made up.

export type DocData = {
  docNumber: string; // e.g. "LW-2026-0001"
  issuedAt: Date;
  client: {
    businessName: string;
    contactName: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    category: string | null;
    services: string[];
    webPresence: Lead["web_presence"];
    websiteIssues: string[];
  };
  plan: {
    tier: Tier;
    tierName: string;
    setupPrice: number | null;
    monthlyPrice: number | null;
    editsPerMonth: number;
    features: readonly string[];
  };
  links: {
    preview: string | null;
    live: string | null;
    payment: string | null;
    portal: string;
  };
};

export function docDataFromLead(lead: Lead, opts: { live?: string | null; payment?: string | null } = {}): DocData {
  const tierKey = (lead.assessment?.recommended_tier ?? "basic") as Tier;
  const tier = tiers.find((t) => t.key === tierKey) ?? tiers[0];
  const year = new Date().getFullYear();
  const shortId = lead.id.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase();
  return {
    docNumber: `${brand.shortName.slice(0, 2).toUpperCase()}-${year}-${shortId}`,
    issuedAt: new Date(),
    client: {
      businessName: lead.name,
      contactName: lead.contact_name,
      email: lead.email,
      phone: lead.phone,
      city: lead.city,
      category: lead.category,
      services: lead.services,
      webPresence: lead.web_presence,
      websiteIssues: lead.website_issues,
    },
    plan: {
      tier: tierKey,
      tierName: tier.name,
      setupPrice: lead.assessment?.setup_price ?? null,
      monthlyPrice: lead.assessment?.monthly_price ?? null,
      editsPerMonth: tier.editsPerMonth,
      features: tier.features,
    },
    links: {
      preview: lead.demo?.url ?? null,
      live: opts.live ?? null,
      payment: opts.payment ?? null,
      portal: "/portal",
    },
  };
}

/** For documents shown to anyone (like the Package Menu), with no client details. */
export function publicDocData(): DocData {
  return {
    docNumber: "",
    issuedAt: new Date(),
    client: { businessName: "", contactName: null, email: null, phone: null, city: null, category: null, services: [], webPresence: null, websiteIssues: [] },
    plan: { tier: "basic", tierName: tiers[0].name, setupPrice: null, monthlyPrice: null, editsPerMonth: tiers[0].editsPerMonth, features: tiers[0].features },
    links: { preview: null, live: null, payment: null, portal: "/portal" },
  };
}

export const usd = (n: number | null) => (n === null ? "—" : `$${n.toLocaleString("en-US")}`);
export const longDate = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
