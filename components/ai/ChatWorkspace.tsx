"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowUp,
  Check,
  Copy,
  Home,
  Loader2,
  LogOut,
  Menu,
  MessageSquarePlus,
  RotateCcw,
  Search,
  Square,
  Trash2,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";
import { ChatBlocks } from "./ChatBlocks";
import { RidePreviewCard } from "./RidePreviewCard";
import { ChatHttpError, streamChat, type ChatBlock } from "./chat-types";
import {
  groupThreads,
  loadThreads,
  newThread,
  relativeTime,
  saveThreads,
  uid,
  type ChatMessage,
  type ChatThread,
} from "./chat-store";

// The co-pilot talks to the Revvie API directly (cookie session), not the Next server.
const AI_API =
  (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "").replace(/\/api$/, "") + "/api/ai";

const STARTERS = [
  {
    title: "Diagnose a problem",
    text: "My bike vibrates at 60 kph — what could it be?",
    icon: Wrench,
  },
  {
    title: "Service schedule",
    text: "What's the service schedule for a Royal Enfield Classic 350?",
    icon: Zap,
  },
  {
    title: "Compare two bikes",
    text: "Compare the Bajaj Pulsar NS200 and the KTM Duke 200",
    icon: ArrowUp,
  },
  {
    title: "Find my next bike",
    text: "Which adventure bike under 4 lakh is best for touring?",
    icon: Search,
  },
];

const Markdown = ({ children }: { children: string }) => (
  <div className="space-y-2.5 text-[14.5px] leading-relaxed text-[#e6e6e9] [&_a]:text-brand-red-bright [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px] [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-[15px] [&_h3]:font-semibold [&_hr]:border-border [&_li]:ml-5 [&_ol]:list-decimal [&_p]:m-0 [&_strong]:text-white [&_ul]:list-disc">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
        table: (props) => (
          <div className="overflow-x-auto">
            <table {...props} className="w-full border-collapse text-[13px]" />
          </div>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);

export function ChatWorkspace() {
  const router = useRouter();
  const { user, hasSession, isPending } = useAuth();
  const userId = user?.id ?? null;

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<{ remaining: number; limit: number } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // In-flight assistant turn.
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [liveText, setLiveText] = useState("");
  const [liveBlocks, setLiveBlocks] = useState<ChatBlock[]>([]);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const hydratedFor = useRef<string | null>(null);
  const copiedTimer = useRef<number | null>(null);
  const [showJump, setShowJump] = useState(false);

  // ── history persistence ────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId || hydratedFor.current === userId) return;
    hydratedFor.current = userId;
    setThreads(loadThreads(userId));
  }, [userId]);

  useEffect(() => {
    if (!userId || hydratedFor.current !== userId) return;
    saveThreads(userId, threads);
  }, [threads, userId]);

  const active = useMemo(
    () => threads.find((t) => t.id === activeId) ?? null,
    [threads, activeId],
  );
  const messages = useMemo(() => active?.messages ?? [], [active]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.messages.some((m) => m.text.toLowerCase().includes(q)),
    );
  }, [threads, search]);

  // ── credits badge ──────────────────────────────────────────────────────────
  const loadCredits = useCallback(async () => {
    try {
      const res = await fetch(`${AI_API}/credits`, { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        credits?: { remaining: number; limit: number };
      };
      if (data.credits) setCredits(data.credits);
    } catch {
      // The badge is decoration; a failed read must not block chatting.
    }
  }, []);

  useEffect(() => {
    if (hasSession) void loadCredits();
  }, [hasSession, loadCredits]);

  // ── scroll behaviour ───────────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, liveText, liveBlocks, status, isLoading]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
    stickRef.current = near;
    setShowJump(!near);
  };

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [input]);

  const appendMessage = useCallback((threadId: string, message: ChatMessage) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, messages: [...t.messages, message], updatedAt: Date.now() }
          : t,
      ),
    );
  }, []);

  // ── one assistant turn ─────────────────────────────────────────────────────
  const runTurn = useCallback(
    async (threadId: string, message: string, history: Array<{ role: string; content: string }>) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);
      setStatus("Thinking");
      setLiveText("");
      setLiveBlocks([]);
      setError(null);
      stickRef.current = true;

      let streamed = "";
      let finished = false;

      try {
        for await (const ev of streamChat(
          `${AI_API}/chat/stream`,
          { message, history },
          controller.signal,
        )) {
          if (ev.event === "status") {
            setStatus(ev.data.text);
          } else if (ev.event === "delta") {
            streamed += ev.data.text;
            setLiveText(streamed);
            setStatus("");
          } else if (ev.event === "reset") {
            streamed = "";
            setLiveText("");
          } else if (ev.event === "blocks") {
            setLiveBlocks(ev.data.blocks);
          } else if (ev.event === "done") {
            finished = true;
            const { reply, blocks, credits: nextCredits, tools, rides } = ev.data;
            if (nextCredits) setCredits(nextCredits);
            appendMessage(threadId, {
              id: uid(),
              sender: "assistant",
              text: reply || "Done!",
              blocks: blocks?.length ? blocks : undefined,
              toolPills: tools?.length ? tools : undefined,
              rideCards: rides?.length ? rides : undefined,
              createdAt: Date.now(),
            });
          } else if (ev.event === "error") {
            finished = true;
            setError(ev.data.message || "Something went wrong. Please try again.");
          }
        }
        if (!finished) {
          appendMessage(threadId, {
            id: uid(),
            sender: "assistant",
            text: streamed || "The connection dropped before I could answer. Please try again.",
            createdAt: Date.now(),
          });
        }
      } catch (err) {
        if (controller.signal.aborted) {
          if (streamed) {
            appendMessage(threadId, {
              id: uid(),
              sender: "assistant",
              text: streamed,
              createdAt: Date.now(),
            });
          }
        } else if (err instanceof ChatHttpError) {
          if (err.body.remainingCredits !== undefined) {
            setCredits({
              remaining: err.body.remainingCredits,
              limit: err.body.dailyLimit ?? 0,
            });
          }
          setError(
            err.status === 401
              ? "Your session expired — sign in again to keep chatting."
              : err.status === 429
                ? "You've used today's messages. Your allowance resets tomorrow."
                : err.body.error || err.body.message || "Revvie AI is unavailable right now.",
          );
        } else {
          setError("Couldn't reach Revvie AI. Check your connection and try again.");
        }
      } finally {
        abortRef.current = null;
        setIsLoading(false);
        setStatus("");
        setLiveText("");
        setLiveBlocks([]);
      }
    },
    [appendMessage],
  );

  const historyOf = (list: ChatMessage[]) =>
    list.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

  // ── actions ────────────────────────────────────────────────────────────────
  const send = useCallback(
    async (raw?: string) => {
      const text = (raw ?? input).trim();
      if (!text || isLoading || !hasSession) return;
      setInput("");
      setSidebarOpen(false);

      const history = historyOf(messages);
      const userMessage: ChatMessage = {
        id: uid(),
        sender: "user",
        text,
        createdAt: Date.now(),
      };

      let threadId = activeId;
      if (!threadId) {
        const thread = newThread(text);
        threadId = thread.id;
        thread.messages = [userMessage];
        setThreads((prev) => [thread, ...prev]);
        setActiveId(threadId);
      } else {
        appendMessage(threadId, userMessage);
      }

      await runTurn(threadId, text, history);
    },
    [activeId, appendMessage, hasSession, input, isLoading, messages, runTurn],
  );

  const regenerate = useCallback(async () => {
    if (!active || isLoading) return;
    const list = active.messages;
    const fromEnd = [...list].reverse().findIndex((m) => m.sender === "user");
    if (fromEnd === -1) return;
    const idx = list.length - 1 - fromEnd;
    const lastUser = list[idx];
    if (!lastUser) return;

    const history = historyOf(list.slice(0, idx));
    setThreads((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? { ...t, messages: t.messages.slice(0, idx + 1), updatedAt: Date.now() }
          : t,
      ),
    );
    await runTurn(active.id, lastUser.text, history);
  }, [active, isLoading, runTurn]);

  const startNewChat = () => {
    abortRef.current?.abort();
    setActiveId(null);
    setInput("");
    setError(null);
    setSidebarOpen(false);
  };

  const openThread = (id: string) => {
    abortRef.current?.abort();
    setActiveId(id);
    setError(null);
    setSidebarOpen(false);
  };

  const removeThread = (id: string) => {
    const thread = threads.find((t) => t.id === id);
    if (!thread) return;
    if (!window.confirm(`Delete "${thread.title}"? This can't be undone.`)) return;
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const copy = async (m: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(m.text);
      setCopied(m.id);
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard blocked by the browser; nothing to show.
    }
  };

  // ── gates ──────────────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-canvas">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-glow-red">
          <Zap className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">Sign in to chat with Revvie AI</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The co-pilot acts on your account, so it needs a session before it can answer.
        </p>
        <Link
          href="/login?next=/chat"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-red"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const firstName = (user?.name ?? user?.email ?? "rider").split(/[\s@]/)[0];
  const grouped = groupThreads(visible);
  const lastIndex = messages.length - 1;

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-canvas text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-border bg-[#0b0b0d] transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Chat history"
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold tracking-wide">Revvie AI</p>
            <p className="text-[10px] text-muted-foreground">Garage mechanic · bikes</p>
          </div>
          <button
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={startNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-red"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New chat
          </button>
        </div>

        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 focus-within:border-primary/50">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats"
              aria-label="Search chats"
              className="w-full bg-transparent text-[12.5px] text-white placeholder:text-muted-foreground/60 outline-none"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-2">
          {grouped.length === 0 && (
            <p className="px-3 py-6 text-center text-[12px] text-muted-foreground/70">
              {search ? "No chats match that search." : "No conversations yet."}
            </p>
          )}
          {grouped.map(([label, items]) => (
            <div key={label} className="mb-2">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {label}
              </p>
              {items.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-xl transition-colors",
                    t.id === activeId ? "bg-primary/10" : "hover:bg-white/5",
                  )}
                >
                  <button
                    onClick={() => openThread(t.id)}
                    className="min-w-0 flex-1 px-3 py-2 text-left"
                    title={t.title}
                  >
                    <p
                      className={cn(
                        "truncate text-[12.5px] font-medium",
                        t.id === activeId ? "text-white" : "text-[#d4d4d8]",
                      )}
                    >
                      {t.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                      {t.messages.length} {t.messages.length === 1 ? "message" : "messages"} ·{" "}
                      {relativeTime(t.updatedAt)}
                    </p>
                  </button>
                  <button
                    onClick={() => removeThread(t.id)}
                    aria-label={`Delete ${t.title}`}
                    className="mr-1.5 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/15 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/home"
            className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Back to Revvie
          </Link>
          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">
              {(user?.name ?? user?.email ?? "R").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium">{user?.name ?? "Rider"}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
            </div>
            <button
              onClick={() => signOut().then(() => router.push("/"))}
              aria-label="Sign out"
              title="Sign out"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-3 sm:px-4">
          <button
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open chat history"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold">{active?.title ?? "Revvie AI"}</p>
            <p className="truncate text-[10.5px] text-muted-foreground">
              {isLoading && status ? status : "Ask about any bike, fault, or ride plan"}
            </p>
          </div>
          {credits && (
            <span
              className="hidden rounded-full border border-border bg-card px-2.5 py-1 text-[10.5px] font-medium text-muted-foreground sm:inline"
              title="Messages left today"
            >
              {credits.remaining}/{credits.limit} left
            </span>
          )}
          <button
            onClick={startNewChat}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
            aria-label="New chat"
            title="New chat"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </button>
        </header>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex-1 overflow-y-auto"
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
            {messages.length === 0 && !isLoading && (
              <div className="flex min-h-[calc(100dvh-14rem)] flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-glow-red">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <h1 className="mt-5 text-2xl font-bold tracking-tight">
                  Hey {firstName}, what are we working on?
                </h1>
                <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
                  Specs, service intervals, faults, buying advice — or tell me to plan a ride. I
                  read the catalog and the community so you don&apos;t have to.
                </p>
                <div className="mt-7 grid w-full max-w-2xl gap-2.5 sm:grid-cols-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s.title}
                      onClick={() => void send(s.text)}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 p-3.5 text-left transition-colors hover:border-primary/50 hover:bg-card"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <s.icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12.5px] font-semibold text-white">
                          {s.title}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
                          {s.text}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {messages.map((m, i) => (
                <div key={m.id} className={cn("flex gap-3", m.sender === "user" && "justify-end")}>
                  {m.sender === "assistant" && (
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={cn("min-w-0", m.sender === "user" ? "max-w-[85%]" : "flex-1")}>
                    {m.sender === "user" ? (
                      <div className="whitespace-pre-wrap rounded-3xl rounded-br-lg bg-primary px-4 py-2.5 text-[14px] leading-relaxed text-white">
                        {m.text}
                      </div>
                    ) : (
                      <Markdown>{m.text}</Markdown>
                    )}

                    {m.blocks && m.blocks.length > 0 && (
                      <ChatBlocks
                        blocks={m.blocks}
                        interactive={i === lastIndex && !isLoading}
                        onChoose={(v) => void send(v)}
                      />
                    )}

                    {m.toolPills?.map((p, idx) => (
                      <div
                        key={`${p.tool}-${idx}`}
                        className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] text-brand-red-bright"
                      >
                        <Check className="h-3 w-3" />
                        <span>
                          {p.tool}
                          {p.title ? `: ${p.title}` : ""}
                        </span>
                      </div>
                    ))}

                    {m.rideCards?.map((r) => (
                      <div key={r.rideId} className="max-w-md">
                        <RidePreviewCard {...r} />
                      </div>
                    ))}

                    {m.sender === "assistant" && !isLoading && (
                      <div className="mt-2 flex items-center gap-1">
                        <button
                          onClick={() => void copy(m)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
                        >
                          {copied === m.id ? (
                            <>
                              <Check className="h-3 w-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy
                            </>
                          )}
                        </button>
                        {i === lastIndex && (
                          <button
                            onClick={() => void regenerate()}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
                          >
                            <RotateCcw className="h-3 w-3" /> Regenerate
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {liveText && <Markdown>{liveText}</Markdown>}
                    {liveBlocks.length > 0 && (
                      <ChatBlocks blocks={liveBlocks} interactive={false} onChoose={() => {}} />
                    )}
                    {status && (
                      <div
                        className="mt-2 flex items-center gap-2 text-[12px] text-muted-foreground"
                        aria-live="polite"
                      >
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                        <span>{status}…</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-[12.5px] text-[#ffb3b8]"
                >
                  <span className="flex-1">{error}</span>
                  <button
                    onClick={() => setError(null)}
                    aria-label="Dismiss error"
                    className="rounded p-0.5 text-[#ffb3b8]/70 transition-colors hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {showJump && (
          <button
            onClick={() => {
              stickRef.current = true;
              scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
              });
            }}
            aria-label="Scroll to latest message"
            className="absolute bottom-28 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-lg transition-colors hover:text-white"
          >
            <ArrowUp className="h-4 w-4 rotate-180" />
          </button>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="shrink-0 border-t border-border bg-canvas/90 px-3 py-3 backdrop-blur sm:px-4"
        >
          <div className="mx-auto w-full max-w-3xl">
            <div className="flex items-end gap-2 rounded-3xl border border-border bg-card px-3 py-2 transition-colors focus-within:border-primary/60">
              <textarea
                ref={taRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Message Revvie AI — ask about a bike, a fault, or plan a ride…"
                aria-label="Message Revvie AI"
                className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] leading-relaxed text-white placeholder:text-muted-foreground/60 outline-none"
              />
              {isLoading ? (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  aria-label="Stop generating"
                  title="Stop"
                  className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-all hover:bg-brand-red disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 px-2 text-[10px] text-muted-foreground/60">
              <span>Revvie AI can make mistakes. Check specs and torque values against the manual.</span>
              <span className="hidden shrink-0 sm:inline">Enter to send · Shift+Enter for a new line</span>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
