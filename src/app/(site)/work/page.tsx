import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { CtaPanel } from "@/components/site/cta";
import { Reveal, SpotlightCard } from "@/components/site/motion";
import { SampleCard, sampleDesigns } from "@/components/site/sections";
import { Container, Eyebrow, PageHeader } from "@/components/site/ui";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Our work",
  description: "Websites we've built for local businesses.",
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
        eyebrow="The work"
        title={<>Simple sites that get <span className="italic text-muted">local businesses found.</span></>}
        lead="Every site is built for phones first, loads fast, and puts your phone number, hours, and reviews right where customers look."
      />
      <Container className="py-24">
        {showcase.length > 0 && (
          <>
            <Reveal><Eyebrow>Client sites</Eyebrow></Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.map((site, i) => (
                <Reveal key={site.live_url} delay={i * 80}>
                  <a href={site.live_url} target="_blank" rel="noopener" className="block">
                    <SpotlightCard className="glass group overflow-hidden rounded-3xl">
                      <div className="aspect-[4/3] bg-surface-2">
                        {site.screenshot_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={site.screenshot_url} alt={`${site.name} website`} className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                        )}
                      </div>
                      <div className="flex items-center justify-between border-t border-line px-6 py-4">
                        <div>
                          <p className="font-display text-2xl">{site.name}</p>
                          <p className="label mt-1 !text-[0.6rem] text-muted">{[site.category, site.city].filter(Boolean).join(" · ")}</p>
                        </div>
                        <ArrowUpRight size={18} className="text-muted transition-colors group-hover:text-ink" />
                      </div>
                    </SpotlightCard>
                  </a>
                </Reveal>
              ))}
            </div>
            <div className="mt-24" />
          </>
        )}
        <Reveal><Eyebrow>Sample designs</Eyebrow></Reveal>
        <Reveal delay={80}>
          <p className="mt-5 max-w-2xl text-muted">
            These sample layouts show the style we build in. Your preview uses your real business info, services, hours,
            and reviews.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sampleDesigns.map((s, i) => (
            <Reveal key={s.business} delay={i * 120}>
              <SampleCard {...s} />
            </Reveal>
          ))}
        </div>
      </Container>
      <Container><CtaPanel title="The best example" accent="is your own." /></Container>
    </>
  );
}
