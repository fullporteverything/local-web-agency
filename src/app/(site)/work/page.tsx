import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { SampleCard, sampleDesigns } from "@/components/site/sections";
import { ButtonLink, Container, PageHeader } from "@/components/site/ui";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Our work",
  description: "Websites we've built for local businesses in North Carolina.",
};

export const revalidate = 3600;

type Showcase = { name: string; category: string | null; city: string | null; live_url: string; screenshot_url: string | null };

// Live client sites appear here automatically once a client goes live and has given showcase permission.
async function getShowcase(): Promise<Showcase[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabaseAdmin()
    .from("public_showcase")
    .select("name, category, city, live_url, screenshot_url")
    .limit(24);
  if (error) {
    console.error("showcase query failed", error.message);
    return [];
  }
  return data ?? [];
}

export default async function WorkPage() {
  const showcase = await getShowcase();
  return (
    <>
      <PageHeader
        eyebrow="Our work"
        title="Simple sites that get local businesses found."
        lead="Every site is built for phones first, loads fast, and puts your phone number, hours, and reviews right where customers look."
      />
      <Container className="py-16">
        {showcase.length > 0 && (
          <>
            <h2 className="font-display text-2xl font-semibold">Client sites</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.map((site) => (
                <a
                  key={site.live_url}
                  href={site.live_url}
                  target="_blank"
                  rel="noopener"
                  className="group overflow-hidden rounded-2xl border border-line bg-surface"
                >
                  <div className="aspect-[4/3] bg-surface-2">
                    {site.screenshot_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={site.screenshot_url} alt={`${site.name} website`} className="h-full w-full object-cover object-top" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{site.name}</p>
                      <p className="text-xs text-muted">{[site.category, site.city].filter(Boolean).join(" · ")}</p>
                    </div>
                    <ExternalLink size={16} className="text-muted group-hover:text-pine" />
                  </div>
                </a>
              ))}
            </div>
            <h2 className="mt-16 font-display text-2xl font-semibold">Sample designs</h2>
          </>
        )}
        <p className="mt-2 max-w-2xl text-muted">
          These sample layouts show the style we build in. Your preview uses your real business info,
          services, hours, and reviews.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sampleDesigns.map((s) => (
            <SampleCard key={s.business} {...s} />
          ))}
        </div>
        <div className="mt-16 rounded-2xl border border-line bg-surface p-8 text-center">
          <h2 className="font-display text-2xl font-semibold">The best example is your own.</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted">We&apos;ll build a free preview with your real info so you can see exactly what you&apos;d get.</p>
          <ButtonLink href="/free-preview" className="mt-6">Get a free preview</ButtonLink>
        </div>
      </Container>
    </>
  );
}
