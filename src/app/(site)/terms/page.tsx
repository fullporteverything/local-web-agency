import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { Container, PageHeader } from "@/components/site/ui";

export const metadata: Metadata = { title: "Terms of Service" };

// DRAFT: must be reviewed and approved by the owner before launch (spec Section 14).
const updated = "October 20, 2026";

export default function TermsPage() {
  const n = brand.name;
  return (
    <>
      <PageHeader title="Terms of Service" lead={`Last updated ${updated}`} />
      <Container className="prose-legal max-w-3xl py-12">
        <p>
          These terms cover websites and related services provided by {n} (&quot;we,&quot; &quot;us&quot;) to
          businesses (&quot;you&quot;). By paying for a plan or using our client portal, you agree to them.
        </p>

        <h2>1. Previews</h2>
        <p>
          We may build a free preview website using information that is publicly available about your business. A
          preview is not a finished product, carries no obligation, and is taken down if you don&apos;t move forward.
          If you&apos;d like a preview removed sooner, just ask and we&apos;ll remove it.
        </p>

        <h2>2. Plans and payment</h2>
        <ul>
          <li>Each plan has a one-time setup fee and a monthly fee, quoted to you before you pay.</li>
          <li>The setup fee is charged when you sign up. The monthly fee starts when your site goes live and renews each month until you cancel.</li>
          <li>Payments are processed by Stripe. We never see or store your full card number.</li>
          <li>A price quoted to you won&apos;t go up for the plan you signed up for. If we ever change pricing for future billing, we&apos;ll tell you at least 30 days ahead.</li>
        </ul>

        <h2>3. What the monthly fee covers</h2>
        <p>
          Hosting, security and software updates, keeping your site online, and changes up to your plan&apos;s monthly
          edit allowance. Work beyond that allowance is quoted separately, and you decide whether to accept it.
        </p>

        <h2>4. Your content</h2>
        <p>
          You own the text, photos, logos, and other material you give us, and you confirm you have the right to use
          them. You give us permission to use that material to build and run your site. We own the underlying design
          templates and code we use across clients.
        </p>

        <h2>5. Domains</h2>
        <p>
          If you already own your domain, it stays yours. If we register a domain for you, we&apos;ll transfer it to
          you on request after cancellation, subject to the registrar&apos;s rules.
        </p>

        <h2>6. Canceling</h2>
        <p>
          You can cancel anytime from your client portal. There are no cancellation fees. Your site stays up until the
          end of your current paid month, then it is taken offline. Setup fees are not refundable once work on your
          final site has started.
        </p>

        <h2>7. Missed payments</h2>
        <p>
          If a payment fails, we&apos;ll remind you and give you a chance to update your card. If it&apos;s still unpaid
          after the grace period, your site may be taken offline until the balance is settled.
        </p>

        <h2>8. Uptime and liability</h2>
        <p>
          We work to keep your site online and working, but we can&apos;t promise it will never go down. Our total
          liability to you for any claim is limited to the amount you paid us in the three months before the claim.
          We aren&apos;t responsible for lost profits or indirect damages.
        </p>

        <h2>9. Acceptable use</h2>
        <p>
          We won&apos;t host content that is illegal, deceptive, or infringes someone else&apos;s rights, and we may
          remove such content.
        </p>

        <h2>10. Changes to these terms</h2>
        <p>We may update these terms. If a change matters, we&apos;ll let current clients know by email.</p>

        <h2>11. Governing law</h2>
        <p>These terms are governed by the laws of the State of North Carolina.</p>

        <h2>12. Contact</h2>
        <p>
          Questions? Email <a href={`mailto:${brand.email}`} className="text-pine underline">{brand.email}</a>.
          {brand.mailingAddress && ` Mail: ${brand.mailingAddress}.`}
        </p>
      </Container>
    </>
  );
}
