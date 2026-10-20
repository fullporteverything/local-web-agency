"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/** Re-renders the current CRM screen the moment anything changes in Convex (new lead, reply, task…). */
export function LiveRefresh() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return null;
  return <Watcher />;
}

function Watcher() {
  const router = useRouter();
  const version = useQuery(api.crm.version);
  const first = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (version === undefined) return;
    if (first.current === undefined) {
      first.current = version;
      return;
    }
    router.refresh();
  }, [version, router]);
  return null;
}
