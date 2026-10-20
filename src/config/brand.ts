// Single source of truth for the agency's identity.
// To rename the business, change the env vars (or the fallbacks below) and redeploy.

export const brand = {
  name: process.env.NEXT_PUBLIC_AGENCY_NAME ?? "Longleaf Web",
  shortName: process.env.NEXT_PUBLIC_AGENCY_SHORT_NAME ?? "Longleaf",
  domain: process.env.NEXT_PUBLIC_AGENCY_DOMAIN ?? "longleafweb.com",
  ownerName: process.env.NEXT_PUBLIC_OWNER_NAME ?? "Acen",
  ownerFullName: process.env.NEXT_PUBLIC_OWNER_FULL_NAME ?? "Acen",
  email: process.env.NEXT_PUBLIC_AGENCY_EMAIL ?? "hello@longleafweb.com",
  phone: process.env.NEXT_PUBLIC_AGENCY_PHONE ?? "",
  // Physical mailing address (PO box or virtual mailbox). Required for CAN-SPAM in email footers.
  mailingAddress: process.env.NEXT_PUBLIC_MAILING_ADDRESS ?? "",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "",
  homeCity: "High Point",
} as const;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${brand.domain}`;

// Public "starting at" ranges. Actual quotes are personalized by the pricing engine,
// and these must stay in sync with the default tier ranges in Settings.
export const tiers = [
  {
    key: "basic",
    name: "Basic",
    setup: "Up to $500",
    monthly: "$75–$100/mo",
    blurb: "A clean one-page site that gets you found and gets the phone ringing.",
    features: [
      "One-page site on your own domain",
      "Your services, hours, and reviews",
      "Tap-to-call button and map",
      "Contact form that goes to your email",
      "Hosting, updates, and small changes included",
    ],
  },
  {
    key: "premium",
    name: "Premium",
    setup: "$750–$1,000",
    monthly: "$125–$150/mo",
    blurb: "A multi-page site with a custom look, built to show up on Google.",
    features: [
      "Everything in Basic",
      "Multiple pages and a custom design",
      "Basic SEO setup",
      "Google Business Profile tune-up",
      "Quote or booking request form",
    ],
  },
  {
    key: "all_out",
    name: "All-Out",
    setup: "From $1,500",
    monthly: "$200+/mo",
    blurb: "For established businesses that want the site doing real work for them.",
    features: [
      "Everything in Premium",
      "Online booking or ordering",
      "Pages for each service and location",
      "Specials or blog section",
      "Automatic review requests",
      "Priority edits and a monthly report",
    ],
  },
] as const;

// Approved FAQ. The AI may only answer from these facts (spec Section 10).
export const faq = [
  {
    q: "How much does it cost?",
    a: "Every quote is personal and based on what your business needs. There's a one-time setup fee and then a monthly fee that covers hosting, updates, and changes. Small family businesses never pay more than $500 to get started. No contract, cancel anytime.",
  },
  {
    q: "What happens if I cancel?",
    a: "Your site stays up until the end of the month you've paid for, then it comes down. No cancellation fees. If you own your domain, it stays yours.",
  },
  {
    q: "How long does it take?",
    a: "Your site is usually live within a few days of getting your details, like photos and anything you want changed.",
  },
  {
    q: "What about my domain?",
    a: "We can set one up for you or connect one you already have. If you got a preview link from us, that's just a preview. The real site goes on your own domain.",
  },
  {
    q: "Can I make changes later?",
    a: "Yes. Changes are included in your monthly plan up to your plan's edit allowance. You can request them anytime from your client portal.",
  },
  {
    q: "I already have a Facebook page. Do I need a website?",
    a: "Keep your Facebook page. A website helps you show up when people search on Google, and we link the two together.",
  },
] as const;

export const ncCities = [
  "High Point",
  "Greensboro",
  "Winston-Salem",
  "Charlotte",
  "Raleigh",
  "Durham",
  "Thomasville",
  "Lexington",
  "Asheboro",
  "Burlington",
  "Kernersville",
  "Jamestown",
  "Archdale",
  "Salisbury",
  "Mooresville",
  "Concord",
  "Gastonia",
  "Cary",
  "Chapel Hill",
  "Fayetteville",
  "Wilmington",
  "Asheville",
  "Hickory",
  "Statesville",
] as const;

export function citySlug(city: string) {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
