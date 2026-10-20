"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, FlaskConical, XCircle } from "lucide-react";
import type { ActionResult } from "@/lib/crm/actions";
import { cn } from "@/lib/utils";

type ToastItem = { id: number; text: string; kind: "ok" | "demo" | "error" };
const ToastContext = createContext<(r: ActionResult) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = useCallback((r: ActionResult) => {
    const item: ToastItem = {
      id: Date.now() + Math.random(),
      text: r.ok ? r.message ?? "Done." : r.error,
      kind: !r.ok ? "error" : r.demo ? "demo" : "ok",
    };
    setItems((xs) => [...xs, item]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== item.id)), 4200);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm shadow-2xl backdrop-blur-xl",
              t.kind === "error" ? "border-rose-400/30 bg-rose-950/80" : t.kind === "demo" ? "border-amber-400/30 bg-amber-950/80" : "border-emerald-400/30 bg-emerald-950/80",
            )}
          >
            {t.kind === "error" ? <XCircle size={16} className="text-rose-300" /> : t.kind === "demo" ? <FlaskConical size={16} className="text-amber-300" /> : <CheckCircle2 size={16} className="text-emerald-300" />}
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
