import { brand, faq, tiers } from "@/config/brand";
import { longDate, usd, type DocData } from "@/lib/docs/data";
import { Callout, Checklist, DocPage, Fields, Section, Steps, Table, V } from "./doc-ui";

// The client document set. Each one fills itself in from the lead/client record and goes out
// automatically at the stage noted in `sentWhen` (wired up in the outreach/onboarding steps).

type Doc = {
  slug: string;
  n: number;
  title: string;
  blurb: string;
  sentWhen: string;
  audience: "lead" | "client" | "anyone";
  Render: (props: { d: DocData }) => React.ReactNode;
};

const num = (n: number) => String(n).padStart(2, "0");
const issued = (d: DocData): [string, string][] => [
  ["Prepared for", d.client.businessName],
  ["Date", longDate(d.issuedAt)],
  ["Ref", d.docNumber],
];
const hi = (d: DocData) => (d.client.contactName ? d.client.contactName.split(" ")[0] : "there");

export const documents: Doc[] = [
  {
    slug: "proposal",
    n: 1,
    title: "Proposal",
    blurb: "One clear price and a link to their free preview.",
    sentWhen: "With the first email, once the demo passes QA",
    audience: "lead",
    Render: ({ d }) => (
      <DocPage title="Proposal" number={`${num(1)} · Proposal`} meta={issued(d)}>
        <Section label="Hi">
          <p className="max-w-2xl text-sm leading-relaxed text-ink/85">
            Hey {hi(d)}, I built a preview of a website for {d.client.businessName} so you can see exactly what you&apos;d get
            before spending anything. Here&apos;s what it costs to put it live and what&apos;s included.
          </p>
        </Section>
        <Section label="Your preview">
          <Fields items={[["Preview link", <V key="p">{d.links.preview}</V>], ["Goes live on", "Your own domain, like yourbusiness.com"]]} />
        </Section>
        <Section label="Your price">
          <div className="grid gap-4 sm:grid-cols-3">
            <Price label="One-time setup" value={usd(d.plan.setupPrice)} />
            <Price label="Monthly" value={`${usd(d.plan.monthlyPrice)}/mo`} />
            <Price label="Plan" value={d.plan.tierName} />
          </div>
          <p className="mt-3 text-xs text-muted">No contract. Cancel anytime. We also offer bigger and smaller setups if you&apos;d like a different fit.</p>
        </Section>
        <Section label="What's included">
          <Checklist items={d.plan.features.map((f) => ({ label: f }))} />
        </Section>
        <Section label="Next step">
          <Callout tone="accent">
            Ready to go? {d.links.payment ? <>Get started here: <span className="underline">{d.links.payment}</span></> : "Reply to my email and I'll send your link to get started."}{" "}
            After that I&apos;ll send a short form for any photos or details, and it&apos;ll be live within a few days.
          </Callout>
        </Section>
      </DocPage>
    ),
  },
  {
    slug: "welcome",
    n: 2,
    title: "Welcome Doc",
    blurb: "What happens next and how onboarding works.",
    sentWhen: "Right after payment, with their portal login",
    audience: "client",
    Render: ({ d }) => (
      <DocPage title="Welcome Doc" number={`${num(2)} · Welcome`} meta={issued(d)}>
        <Section label="Welcome to the team">
          <p className="max-w-2xl text-sm leading-relaxed text-ink/85">
            Thanks for choosing {brand.name}, {hi(d)}. This doc covers everything that happens between now and your site going
            live, so you always know where things stand. You can also follow along anytime in your client portal.
          </p>
        </Section>
        <Section label="Your project at a glance">
          <Fields
            cols={3}
            items={[
              ["Business", d.client.businessName],
              ["Plan", d.plan.tierName],
              ["Setup", usd(d.plan.setupPrice)],
              ["Monthly", `${usd(d.plan.monthlyPrice)}/mo, starts when your site goes live`],
              ["Edits included", `${d.plan.editsPerMonth} per month`],
              ["Your point of contact", `${brand.ownerName} · ${brand.email}`],
            ]}
          />
        </Section>
        <Section label="What happens next">
          <Steps
            items={[
              { title: "Send your details", body: "Fill out the short form in your portal: logo, photos, hours, and anything you want changed. (See the Content Checklist.)" },
              { title: "We build your site", body: "We finish your site using your details. You'll see progress update in your portal." },
              { title: "You review it", body: "Your final preview shows up in your portal. Approve it with one tap or ask for changes." },
              { title: "We go live", body: "We connect your domain, test everything on phones and computers, and let you know it's live." },
              { title: "We keep it running", body: "Hosting, updates, and changes within your plan are handled. Just ask in your portal." },
            ]}
          />
        </Section>
        <Section label="Your client portal">
          <Callout>
            Log in at <span className="underline">{brand.domain}{d.links.portal}</span> with this email address. No password needed: you&apos;ll get a login link by email.
          </Callout>
        </Section>
      </DocPage>
    ),
  },
  {
    slug: "agreement",
    n: 3,
    title: "Service Agreement",
    blurb: "The plain-English terms of the plan they bought.",
    sentWhen: "With the Welcome Doc, after payment",
    audience: "client",
    Render: ({ d }) => (
      <DocPage title="Service Agreement" number={`${num(3)} · Agreement`} meta={issued(d)}>
        <Section label="Summary">
          <p className="max-w-2xl text-sm leading-relaxed text-ink/85">
            This is a plain-English summary of your plan with {brand.name}. The full Terms of Service at {brand.domain}/terms
            apply, and you agreed to them at checkout.
          </p>
        </Section>
        <Section label="Your plan">
          <Table
            head={["Item", "Details"]}
            rows={[
              ["Plan", d.plan.tierName],
              ["One-time setup fee", `${usd(d.plan.setupPrice)}, charged at signup`],
              ["Monthly fee", `${usd(d.plan.monthlyPrice)}/month, starting when your site goes live`],
              ["Included edits", `${d.plan.editsPerMonth} per month. Larger changes are quoted first, and you decide.`],
              ["Contract length", "None. Cancel anytime."],
            ]}
          />
        </Section>
        <Section label="Key terms">
          <Steps
            items={[
              { title: "Price", body: "The price you signed up at won't go up for this plan. Any future pricing change for billing would be announced 30 days ahead." },
              { title: "Your content", body: "You own the text, photos, and logos you give us. We own the design templates and code we use across clients." },
              { title: "Your domain", body: "If you already own it, it stays yours. If we register one for you, we'll transfer it to you on request after you cancel." },
              { title: "Canceling", body: "Cancel from your portal anytime. Your site stays up through the month you've paid for, then comes down. No fees." },
              { title: "Missed payments", body: "We'll remind you and give you time to update your card. If it stays unpaid after the grace period, the site may go offline until it's settled." },
            ]}
          />
        </Section>
      </DocPage>
    ),
  },
  {
    slug: "project-brief",
    n: 4,
    title: "Project Brief",
    blurb: "Scope of the build, so you and the client are on the same page.",
    sentWhen: "When their details come in, before the build starts",
    audience: "client",
    Render: ({ d }) => (
      <DocPage title="Project Brief" number={`${num(4)} · Brief`} meta={issued(d)}>
        <Section label="Project overview">
          <Fields
            items={[
              ["Business", d.client.businessName],
              ["Type of business", <V key="c">{d.client.category}</V>],
              ["Area served", <V key="a">{d.client.city}</V>],
              ["Plan", d.plan.tierName],
              ["Public phone", <V key="p">{d.client.phone}</V>],
              ["Public email", <V key="e">{d.client.email}</V>],
            ]}
          />
        </Section>
        <Section label="Objective">
          <Callout>
            Give {d.client.businessName} a fast, phone-friendly website that shows up on Google and turns visitors into calls,
            with services, hours, reviews, and a one-tap call button front and center.
          </Callout>
        </Section>
        <Section label="Services to feature">
          {d.client.services.length ? (
            <div className="flex flex-wrap gap-2">{d.client.services.map((s) => <span key={s} className="rounded-full border border-line px-3 py-1 text-sm">{s}</span>)}</div>
          ) : (
            <V>{null}</V>
          )}
        </Section>
        {d.client.websiteIssues.length > 0 && (
          <Section label="Problems we're fixing from the old site">
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink/85">{d.client.websiteIssues.map((x) => <li key={x}>{x}</li>)}</ul>
          </Section>
        )}
        <Section label="In scope">
          <Checklist items={d.plan.features.map((f) => ({ label: f }))} />
        </Section>
        <Section label="Not included (can be quoted)">
          <p className="text-sm text-muted">
            Anything beyond the plan above, like extra pages, online ordering on a Basic plan, logo design, or copywriting from scratch.
            We&apos;ll always quote it first and you decide.
          </p>
        </Section>
      </DocPage>
    ),
  },
  {
    slug: "delivery-guide",
    n: 5,
    title: "Delivery Guide",
    blurb: "The handoff when their site goes live.",
    sentWhen: "The moment the site goes live",
    audience: "client",
    Render: ({ d }) => (
      <DocPage title="Delivery Guide" number={`${num(5)} · Delivery`} meta={issued(d)}>
        <Section label="Your site is live">
          <Callout tone="accent">
            <span className="font-display text-2xl">
              <V fallback="Your web address">{d.links.live}</V>
            </span>
            <span className="mt-1 block text-muted">Share it on Facebook, Google, your truck, your cards. It&apos;s yours.</span>
          </Callout>
        </Section>
        <Section label="What's included">
          <Table
            head={["Item", "Where", "Notes"]}
            rows={[
              ["Your website", <V key="l" fallback="Live link">{d.links.live}</V>, "Works on phones, tablets, and computers"],
              ["Hosting & security", "Handled by us", "Included in your monthly plan"],
              ["Contact form", "On your site", `Messages go to ${d.client.email ?? "your email"}`],
              ["Edits", "Your client portal", `${d.plan.editsPerMonth} included per month`],
              ["Billing & invoices", "Your client portal", "Update your card or cancel anytime"],
            ]}
          />
        </Section>
        <Section label="Getting the most out of it">
          <Steps
            items={[
              { title: "Update Google", body: "Add the link to your Google Business Profile so it shows on your listing." },
              { title: "Link Facebook", body: "Put the link in your Facebook page's About section. Keep both, they work together." },
              { title: "Ask for reviews", body: "New reviews show up on your site. Ask happy customers to leave one on Google." },
              { title: "Tell us what changes", body: "New hours, prices, or services? Send it through the portal and we'll update it." },
            ]}
          />
        </Section>
      </DocPage>
    ),
  },
  {
    slug: "content-checklist",
    n: 6,
    title: "Content Checklist",
    blurb: "Exactly what to send so the build isn't held up.",
    sentWhen: "With the Welcome Doc, after payment",
    audience: "client",
    Render: ({ d }) => (
      <DocPage title="Content Checklist" number={`${num(6)} · Content`} meta={issued(d)}>
        <Section label="Send what you have">
          <p className="max-w-2xl text-sm leading-relaxed text-ink/85">
            Upload these in your client portal. Don&apos;t have something? Skip it. We&apos;ll use what&apos;s already public about
            your business and you can add more later.
          </p>
        </Section>
        <Section label="The basics">
          <Checklist
            items={[
              { label: "Logo", note: "Any format. A photo of your sign works too." },
              { label: "Business hours", note: "Including holiday or seasonal hours" },
              { label: "Phone and email for the site" },
              { label: "Area you serve", note: "Cities, counties, or a radius" },
              { label: "Services and prices", note: "Only what you want shown publicly" },
              { label: "Domain preference", note: "One you own, or the one you'd like us to set up" },
            ]}
          />
        </Section>
        <Section label="Make it look great">
          <Checklist
            items={[
              { label: "5–15 photos", note: "Your work, team, storefront, or products" },
              { label: "A sentence about your story", note: "How you started, what you're proud of" },
              { label: "Favorite reviews", note: "We'll feature these first" },
              { label: "Anything to change from the preview" },
            ]}
          />
        </Section>
        <Section label="Plan">
          <p className="text-sm text-muted">{d.plan.tierName} plan · live within a few days of getting your details.</p>
        </Section>
      </DocPage>
    ),
  },
  {
    slug: "edit-requests",
    n: 7,
    title: "Edit Request Guide",
    blurb: "What's included, what's extra, and how to ask.",
    sentWhen: "With the Delivery Guide, when the site goes live",
    audience: "client",
    Render: ({ d }) => (
      <DocPage title="Edit Request Guide" number={`${num(7)} · Edits`} meta={issued(d)}>
        <Section label="Your allowance">
          <div className="grid gap-4 sm:grid-cols-3">
            <Price label="Included each month" value={`${d.plan.editsPerMonth} edits`} />
            <Price label="Plan" value={d.plan.tierName} />
            <Price label="How to ask" value="Client portal" />
          </div>
        </Section>
        <Section label="Included edits (examples)">
          <Checklist
            items={[
              { label: "Change hours, phone, or prices" },
              { label: "Swap or add photos" },
              { label: "Update text or a service description" },
              { label: "Add a seasonal special or announcement" },
            ]}
          />
        </Section>
        <Section label="Quoted as extras">
          <Checklist
            items={[
              { label: "New pages or sections beyond your plan" },
              { label: "New features like booking or ordering" },
              { label: "A full redesign" },
              { label: "Edits past your monthly allowance" },
            ]}
          />
          <p className="mt-3 text-xs text-muted">Extras get a price in your portal first. Nothing is charged unless you accept it.</p>
        </Section>
        <Section label="How it works">
          <Steps
            items={[
              { title: "Send it", body: "Describe the change in your portal. Attach photos if needed." },
              { title: "We check it", body: "We tell you if it's included or send a quote for extras." },
              { title: "You preview it", body: "For bigger changes, you'll see a preview before it goes live." },
              { title: "It's live", body: "You'll get a short note when the change is up." },
            ]}
          />
        </Section>
      </DocPage>
    ),
  },
  {
    slug: "launch-checklist",
    n: 8,
    title: "Launch Checklist",
    blurb: "Everything we check before a site goes live.",
    sentWhen: "With the final preview, before approval",
    audience: "client",
    Render: ({ d }) => (
      <DocPage title="Launch Checklist" number={`${num(8)} · Launch`} meta={issued(d)}>
        <Section label="Before we flip the switch">
          <p className="max-w-2xl text-sm leading-relaxed text-ink/85">
            Every site goes through these checks before it goes live on your domain. If something doesn&apos;t pass, we fix it first.
          </p>
        </Section>
        <Section label="Accuracy">
          <Checklist
            items={[
              { label: "Business name matches exactly" },
              { label: "Phone number is correct and tap-to-call works" },
              { label: "Address and map are correct" },
              { label: "Hours match what you sent" },
              { label: "Only your photos and your reviews" },
              { label: "No placeholder text anywhere" },
            ]}
          />
        </Section>
        <Section label="Quality">
          <Checklist
            items={[
              { label: "Loads fast on a phone" },
              { label: "Looks right on phones, tablets, and computers" },
              { label: "Contact form delivers to your email" },
              { label: "Secure (https) on your domain" },
              { label: "Basic Google setup (title, description)" },
              { label: `Matches your ${d.plan.tierName} plan` },
            ]}
          />
        </Section>
      </DocPage>
    ),
  },
  {
    slug: "offboarding",
    n: 9,
    title: "Offboarding Guide",
    blurb: "What happens if they cancel. No surprises.",
    sentWhen: "When a cancellation is requested",
    audience: "client",
    Render: ({ d }) => (
      <DocPage title="Offboarding Guide" number={`${num(9)} · Offboarding`} meta={issued(d)}>
        <Section label="Sorry to see you go">
          <p className="max-w-2xl text-sm leading-relaxed text-ink/85">
            Thanks for working with us, {hi(d)}. Here&apos;s exactly what happens now. If you change your mind before the end of
            your billing period, just let us know.
          </p>
        </Section>
        <Section label="What happens next">
          <Steps
            items={[
              { title: "No more charges", body: "Your plan won't renew. No cancellation fees." },
              { title: "Site stays up", body: "Your site stays live through the end of the month you've paid for." },
              { title: "Site comes down", body: "After that, it's taken offline." },
              { title: "Your domain", body: "If you own it, it stays yours. If we registered it, ask and we'll transfer it to you." },
              { title: "Your content", body: "Ask anytime and we'll send back the photos and text you gave us." },
            ]}
          />
        </Section>
        <Section label="Coming back later">
          <Callout>Want your site back someday? Reply anytime and we&apos;ll pick up where we left off.</Callout>
        </Section>
      </DocPage>
    ),
  },
  {
    slug: "package-menu",
    n: 10,
    title: "Package Menu",
    blurb: "All three plans side by side. Safe to share with anyone.",
    sentWhen: "When a lead asks about options",
    audience: "anyone",
    Render: ({ d }) => (
      <DocPage title="Package Menu" number={`${num(10)} · Services & Packages`} meta={[["Date", longDate(d.issuedAt)]]}>
        <Section label="Plans">
          <div className="grid gap-4 md:grid-cols-3">
            {tiers.map((t) => (
              <div key={t.key} className="flex flex-col rounded-xl border border-line p-5">
                <p className="label text-white/40">{t.name}</p>
                <p className="mt-3 font-display text-3xl">{t.setup}</p>
                <p className="text-xs text-muted">setup, then {t.monthly}</p>
                <p className="mt-3 text-sm text-ink/80">{t.blurb}</p>
                <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                  {t.features.map((f) => <li key={f} className="text-ink/85">— {f}</li>)}
                  <li className="text-ink/85">— {t.editsPerMonth} edits per month</li>
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">Every quote is personal. Small family businesses never pay more than $500 to get started. No contract.</p>
        </Section>
        <Section label="Good to know">
          <Table head={["Question", "Answer"]} rows={faq.slice(1, 5).map((f) => [f.q, f.a])} />
        </Section>
      </DocPage>
    ),
  },
];

function Price({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-1.5 font-display text-3xl">{value}</p>
    </div>
  );
}

export const findDoc = (slug: string) => documents.find((x) => x.slug === slug);
