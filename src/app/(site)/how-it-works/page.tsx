import type { Metadata } from "next";
import { CtaPanel } from "@/components/site/cta";
import { Reveal, SpotlightCard } from "@/components/site/motion";
import { Steps } from "@/components/site/sections";
import { Container, Eyebrow, PageHeader, SectionTitle } from "@/components/site/ui";

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
        eyebrow="The process"
        title={<>We build it. You approve it. <span className="italic text-muted">It goes live.</span></>}
        lead="No meetings, no tech talk, no long contracts. You see your site before you pay anything."
      />
      <Container className="py-24">
        <Reveal><Eyebrow>Before you pay</Eyebrow></Reveal>
        <div className="mt-10"><Steps /></div>

        <Reveal className="mt-28"><Eyebrow>After you say yes</Eyebrow></Reveal>
        <Reveal delay={80}><SectionTitle className="mt-6">Then we <span className="italic text-muted">handle the rest.</span></SectionTitle></Reveal>
        <ol className="mt-14 border-t border-line">
          {after.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 80}>
              <div className="grid gap-4 border-b border-line py-10 sm:grid-cols-[8rem_1fr_1.2fr] sm:items-baseline">
                <span className="font-display text-5xl italic text-white/20">{String(i + 4).padStart(2, "0")}</span>
                <h3 className="font-display text-3xl">{item.title}</h3>
                <p className="text-muted">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-20">
          <SpotlightCard className="glass hairline-frame rounded-3xl p-10">
            <p className="label text-white/45">If you ever want to stop</p>
            <p className="mt-5 max-w-3xl font-display text-3xl leading-snug sm:text-4xl">
              Cancel anytime from your portal. Your site stays up through the month you&apos;ve paid for, then comes down.
              <span className="italic text-muted"> No fees. Your domain stays yours.</span>
            </p>
          </SpotlightCard>
        </Reveal>
      </Container>
      <Container><CtaPanel /></Container>
    </>
  );
}
