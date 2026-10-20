import type { Metadata } from "next";
import { Steps } from "@/components/site/sections";
import { ButtonLink, Container, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "How it works",
  description: "We build a free preview of your website, you approve it, and it goes live on your own domain in a few days.",
};

const after = [
  { title: "You pay only when you're happy", body: "Once you like the preview, you pay the setup fee online. We send a short form for your logo, photos, and anything you want changed." },
  { title: "We build the final version", body: "We finish the site with your details and show you the final version in your client portal. Approve it with one tap or ask for changes." },
  { title: "It goes live", body: "We connect your domain, make sure everything works on phones and computers, and let you know when it's live." },
  { title: "We take care of it", body: "Your monthly plan covers hosting, updates, and changes. Request a change anytime from your portal and we'll handle it." },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title="We build it, you approve it, it goes live."
        lead="No meetings, no tech talk, no long contracts. You see your site before you pay anything."
      />
      <Container className="py-16">
        <h2 className="font-display text-2xl font-semibold">Before you pay</h2>
        <div className="mt-6">
          <Steps />
        </div>

        <h2 className="mt-16 font-display text-2xl font-semibold">After you say yes</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-2">
          {after.map((item, i) => (
            <li key={item.title} className="rounded-2xl border border-line bg-surface p-6">
              <span className="text-sm font-semibold text-clay">Step {i + 4}</span>
              <h3 className="mt-2 font-display text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-muted">{item.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 rounded-2xl border border-line bg-surface p-8">
          <h2 className="font-display text-2xl font-semibold">If you ever want to stop</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Cancel anytime from your client portal. Your site stays up until the end of the month you&apos;ve
            paid for, then it comes down. No fees. If you own your domain, it stays yours.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/free-preview">Get a free preview</ButtonLink>
          <ButtonLink href="/pricing" variant="secondary">See pricing</ButtonLink>
        </div>
      </Container>
    </>
  );
}
