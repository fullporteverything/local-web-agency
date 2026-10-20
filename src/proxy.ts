import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// Runs before every page request:
// 1. app.<domain> serves the CRM at its root (app.example.com/inbox -> /admin/inbox).
// 2. Convex Auth: finishes magic-link sign-ins, keeps the login session fresh across devices,
//    and serves /api/auth for the browser.

function appSubdomainRewrite(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const { pathname } = req.nextUrl;
  if (host.startsWith("app.") && !pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
    const url = req.nextUrl.clone();
    url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }
}

const withAuth = convexAuthNextjsMiddleware((req) => appSubdomainRewrite(req), {
  cookieConfig: { maxAge: 60 * 60 * 24 * 30 }, // stay signed in for 30 days
});

export default function proxy(req: NextRequest, event: Parameters<typeof withAuth>[1]) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return appSubdomainRewrite(req) ?? NextResponse.next();
  return withAuth(req, event);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|sw.js|offline.html|manifest.webmanifest|.*\\.(?:png|jpg|svg|webp)$).*)"],
};
