"use client";

import type { ChatScope } from "@/src/types/chat";
import { useChat } from "./ChatProvider";
import { formatDate } from "@/src/lib/utils";

function scopeKey(scope: ChatScope): string {
  if (scope.kind === "day") return `day:${scope.date}`;
  if (scope.kind === "repo") return `repo:${scope.repoId}`;
  return `window:${scope.from}:${scope.to}`;
}

function scopeLabel(scope: ChatScope): string {
  if (scope.kind === "day") return formatDate(scope.date, "short");
  if (scope.kind === "repo") return scope.repoName;
  return `${scope.from} – ${scope.to}`;
}

export function ScopeBar() {
  const { state, removeScope } = useChat();
  if (state.scopes.length === 0) return null;

  return (
    <div
      className="border-b border-border-muted px-4 py-2 flex flex-wrap gap-2"
      aria-label="Active scopes"
    >
      {state.scopes.map((scope) => (
        <span
          key={scopeKey(scope)}
          className="inline-flex items-center gap-1 text-xs font-mono bg-surface-2 border border-border-muted rounded-full px-2.5 py-0.5 text-fg-dim"
        >
          {scopeLabel(scope)}
          <button
            type="button"
            aria-label={`Remove ${scopeLabel(scope)} scope`}
            className="ml-0.5 rounded-full hover:text-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent cursor-pointer"
            onClick={() => removeScope(scope)}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
