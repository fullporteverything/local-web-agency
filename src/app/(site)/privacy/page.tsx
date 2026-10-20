import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { Container, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = { title: "Privacy Policy" };

// DRAFT: must be reviewed and approved by the owner before launch (spec Section 14).
const updated = "October 20, 2026";

export default function PrivacyPage() {
  const n = brand.name;
  return (
    <>
      <PageHeader title="Privacy Policy" lead={`Last updated ${updated}`} />
      <Container className="prose-legal max-w-3xl py-12">
        <p>This explains what information {n} collects, why, and what you can do about it.</p>

        <h2>Information we collect</h2>
        <ul>
          <li><strong>Public business information:</strong> name, address, phone, hours, website, social pages, photos, and reviews that businesses publish on Google and similar public sources. We use it to build preview sites and to contact businesses about our services.</li>
          <li><strong>What you send us:</strong> anything you enter in our forms, emails, or client portal, like your name, email, phone, business details, and uploaded files.</li>
          <li><strong>Billing:</strong> handled by Stripe. We receive your name, email, and payment status, never your full card number.</li>
          <li><strong>Usage:</strong> basic information like whether a preview link was opened, so we know when to follow up.</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To build, run, and update your website.</li>
          <li>To reply to you and to contact businesses about our services.</li>
          <li>To bill you and keep records.</li>
          <li>To improve our service.</li>
        </ul>
        <p>We do not sell your information.</p>

        <h2>Who we share it with</h2>
        <p>
          Only the service providers we use to run the business: hosting (Vercel), database (Convex), email
          (Google Workspace and Resend), payments (Stripe), and AI tools that help us write and build sites
          (Anthropic). They may only use your information to provide their service to us.
        </p>

        <h2>Opting out</h2>
        <p>
          If you don&apos;t want to hear from us, reply &quot;no thanks&quot; to any email or contact us below.
          We&apos;ll stop right away and won&apos;t contact you again. You can also ask us to take down a preview site
          or delete your information.
        </p>

        <h2>How long we keep it</h2>
        <p>
          We keep client information while you&apos;re a client and as long as needed for taxes and records after that.
          We keep a minimal record of opt-out requests so we never contact you again.
        </p>

        <h2>Security</h2>
        <p>We use reputable providers, encrypted connections, and access controls to protect your information.</p>

        <h2>Contact</h2>
        <p>
          Email <a href={`mailto:${brand.email}`} className="text-pine underline">{brand.email}</a>.
          {brand.mailingAddress && ` Mail: ${brand.mailingAddress}.`}
        </p>
      </Container>
    </>
  );
}
