"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import type { ActionResult } from "@/lib/crm/actions";
import { cn } from "@/lib/utils";
import { useToast } from "./toast";

export const btn = {
  base: "inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all disabled:opacity-50 active:scale-[0.97]",
  primary: "bg-[#ecebe6] text-[#0b0c0b] hover:bg-white",
  green: "bg-emerald-500 text-[#04140b] hover:bg-emerald-400",
  ghost: "border border-line text-ink hover:bg-white/5",
  danger: "border border-rose-400/30 text-rose-300 hover:bg-rose-400/10",
};

/** Runs a server action on tap, shows a spinner, then a toast with the result. */
export function ActionButton({
  action,
  variant = "ghost",
  confirm,
  className,
  children,
  onDone,
}: {
  action: () => Promise<ActionResult>;
  variant?: keyof Omit<typeof btn, "base">;
  confirm?: string;
  className?: string;
  children: React.ReactNode;
  onDone?: (r: ActionResult) => void;
}) {
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <button
      type="button"
      disabled={pending}
      className={cn(btn.base, btn[variant], className)}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          const r = await action();
          toast(r);
          onDone?.(r);
        });
      }}
    >
      {pending && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
