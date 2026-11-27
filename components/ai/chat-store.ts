import type { ChatBlock } from "./chat-types";
import type { RidePreviewProps } from "./RidePreviewCard";

/**
 * Per-rider chat history for the full-page co-pilot.
 *
 * The backend keeps no conversation table — the agent is stateless and takes
 * history from the client on every turn — so threads live in localStorage,
 * namespaced by user id. That keeps two riders on the same browser apart and
 * makes a thread list possible without a migration.
 */

export interface ToolPill {
  tool: string;
  title?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  blocks?: ChatBlock[];
  toolPills?: ToolPill[];
  rideCards?: RidePreviewProps[];
  createdAt: number;
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

/** Threads kept per rider. Old ones fall off rather than growing forever. */
const MAX_THREADS = 40;
/** Messages kept per thread, mirroring the backend's history window. */
const MAX_MESSAGES = 80;
const STORAGE_PREFIX = "revvie-chat:v1";

export function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function threadTitle(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "New chat";
  return clean.length > 52 ? `${clean.slice(0, 52).trimEnd()}…` : clean;
}

export function newThread(firstMessage?: string): ChatThread {
  const now = Date.now();
  return {
    id: uid(),
    title: firstMessage ? threadTitle(firstMessage) : "New chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

/** Stored JSON is user-writable, so treat it as untrusted input. */
function toThread(value: unknown): ChatThread | null {
  if (!isRecord(value)) return null;
  const { id, title, createdAt, updatedAt, messages } = value;
  if (typeof id !== "string" || !Array.isArray(messages)) return null;

  const clean = messages.filter(
    (m): m is ChatMessage =>
      isRecord(m) &&
      typeof m.text === "string" &&
      (m.sender === "user" || m.sender === "assistant"),
  );

  return {
    id,
    title: typeof title === "string" && title.trim() ? title : "New chat",
    createdAt: typeof createdAt === "number" ? createdAt : Date.now(),
    updatedAt: typeof updatedAt === "number" ? updatedAt : Date.now(),
    messages: clean,
  };
}

export function loadThreads(userId: string): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(toThread)
      .filter((t): t is ChatThread => t !== null)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_THREADS);
  } catch {
    return [];
  }
}

export function saveThreads(userId: string, threads: ChatThread[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = threads.slice(0, MAX_THREADS).map((t) => ({
      ...t,
      messages: t.messages.slice(-MAX_MESSAGES),
    }));
    window.localStorage.setItem(storageKey(userId), JSON.stringify(trimmed));
  } catch {
    // Quota exceeded or private mode: history is a convenience, not a contract.
  }
}

export const THREAD_GROUPS = [
  "Today",
  "Yesterday",
  "Previous 7 days",
  "Previous 30 days",
  "Older",
] as const;

export type ThreadGroup = (typeof THREAD_GROUPS)[number];

export function groupThreads(threads: ChatThread[]): Array<[ThreadGroup, ChatThread[]]> {
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const buckets = new Map<ThreadGroup, ChatThread[]>();

  for (const thread of threads) {
    const day = new Date(thread.updatedAt).setHours(0, 0, 0, 0);
    const days = Math.round((startOfToday - day) / 86_400_000);
    const group: ThreadGroup =
      days <= 0
        ? "Today"
        : days === 1
          ? "Yesterday"
          : days <= 7
            ? "Previous 7 days"
            : days <= 30
              ? "Previous 30 days"
              : "Older";
    buckets.set(group, [...(buckets.get(group) ?? []), thread]);
  }

  return THREAD_GROUPS.filter((g) => buckets.has(g)).map(
    (g) => [g, buckets.get(g)!] as [ThreadGroup, ChatThread[]],
  );
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
