import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "./client-provider";

/**
 * Wraps signed-in areas (CRM, portal, login pages) with Convex + auth.
 * The public marketing site doesn't use it, so those pages stay static and fast.
 * Without Convex configured (demo mode) it renders children as-is.
 */
export function AuthProviders({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return <>{children}</>;
  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
