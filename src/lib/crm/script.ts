import { brand } from "@/config/brand";
import type { Lead } from "./types";

// Call script from spec Section 12, filled in for one lead.
export function callScript(lead: Lead) {
  const setup = lead.assessment?.setup_price ?? null;
  const monthly = lead.assessment?.monthly_price ?? null;
  const price = setup !== null && monthly !== null ? `$${setup} to put it live on your own domain, then $${monthly} a month` : "[price not set yet]";
  const noticed =
    lead.web_presence === "weak_site" && lead.website_issues[0]
      ? `I was looking at your website and noticed a couple things that might be costing you calls, like "${lead.website_issues[0].toLowerCase()}"`
      : lead.web_presence === "facebook_only"
        ? "I noticed most of your info is on Facebook but there's no website people can find on Google"
        : "I noticed you don't have a website";
  return {
    opener: `Hey, is this the owner of ${lead.name}? This is ${brand.ownerName}, I run a small web agency here locally. ${noticed}, so I actually built you a preview already. Got two minutes?`,
    pitch: "I can text you the link right now. It has your services, hours, reviews, and a click-to-call button. Most people look on Google before they call, and if you don't have a site they usually go with whoever does.",
    price: `It's ${price}, and I handle everything. No contract.`,
    close: "Want me to send you the link to get started? It'll be live in a few days.",
    objections: [
      { q: "Too expensive", a: "That's about what one or two new customers are worth for most businesses. We can also do a simpler version to start." },
      { q: "I use Facebook", a: "Definitely keep it. The site gets you showing up on Google, and we link them together." },
      { q: "Need to think", a: "Totally fair. I'll text you the link and check back Thursday." },
      { q: "Not interested", a: "No problem, I'll take you off our list." },
    ],
  };
}
