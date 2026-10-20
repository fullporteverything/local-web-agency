"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** Re-renders the current CRM screen whenever pipeline, messages, tasks, or activity change. */
export function LiveRefresh() {
  const router = useRouter();
  useEffect(() => {
    if (!configured) return;
    const sb = supabaseBrowser();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 400);
    };
    const channel = sb.channel("crm-live");
    for (const table of ["pipeline", "messages", "tasks", "activity_log", "edit_requests"]) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
    }
    channel.subscribe();
    return () => {
      clearTimeout(timer);
      sb.removeChannel(channel);
    };
  }, [router]);
  return null;
}
