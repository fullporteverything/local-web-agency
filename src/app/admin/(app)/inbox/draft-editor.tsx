"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ActionButton } from "@/components/admin/action-button";
import { approveMessage, discardMessage } from "@/lib/crm/actions";
import type { Message } from "@/lib/crm/types";

/** A pinned AI draft: read why, edit if needed, approve in one tap. Edits feed the learning loop. */
export function DraftEditor({ message }: { message: Message }) {
  const [body, setBody] = useState(message.body ?? "");
  const [handled, setHandled] = useState(false);
  const edited = body.trim() !== (message.body ?? "").trim();

  if (handled) {
    return <p className="rounded-2xl border border-line px-4 py-3 text-center text-sm text-muted">Handled.</p>;
  }

  return (
    <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.04] p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Sparkles size={14} className="text-emerald-300" />
        <span className="font-medium text-emerald-200">AI draft waiting for you</span>
        {message.ai_confidence !== null && (
          <span className="text-muted">· {Math.round(message.ai_confidence * 100)}% confident</span>
        )}
      </div>
      {message.ai_reasoning && <p className="mt-2 text-sm text-muted">{message.ai_reasoning}</p>}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={Math.min(14, Math.max(5, body.split("\n").length + 1))}
        className="mt-3 w-full resize-y rounded-xl border border-line bg-[#0b0d0c] px-3.5 py-3 text-sm leading-relaxed focus:border-white/30 focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ActionButton
          variant="green"
          action={() => approveMessage(message.id, edited ? body : undefined)}
          onDone={(r) => r.ok && !r.demo && setHandled(true)}
        >
          {edited ? "Approve with my edits" : "Approve & send"}
        </ActionButton>
        {edited && (
          <button type="button" onClick={() => setBody(message.body ?? "")} className="rounded-full px-3 py-2 text-sm text-muted hover:text-ink">
            Undo edits
          </button>
        )}
        <ActionButton variant="danger" className="ml-auto" confirm="Discard this draft?" action={() => discardMessage(message.id)} onDone={(r) => r.ok && !r.demo && setHandled(true)}>
          Discard
        </ActionButton>
      </div>
      {edited && <p className="mt-2 text-xs text-muted">Your edits get saved so the AI writes more like you next time.</p>}
    </div>
  );
}
