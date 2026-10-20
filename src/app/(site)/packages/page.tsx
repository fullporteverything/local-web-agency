import type { Metadata } from "next";
import { findDoc } from "@/components/docs/documents";
import { Container } from "@/components/site/ui";
import { publicDocData } from "@/lib/docs/data";

export const metadata: Metadata = {
  title: "Packages",
  description: "Our three website plans side by side: Basic, Premium, and All-Out. No contract.",
};

// Public, shareable version of document 10 (the Package Menu).
export default function PackagesPage() {
  const doc = findDoc("package-menu")!;
  return (
    <Container className="py-16">
      <doc.Render d={publicDocData()} />
    </Container>
  );
}
