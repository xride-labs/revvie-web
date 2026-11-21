"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Send,
  Sparkles,
  CheckCircle2,
  Loader2,
  Maximize2,
  Minimize2,
  Square,
  SquarePen,
} from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { authClient } from "@/lib/auth-client";
import { RidePreviewCard } from "./RidePreviewCard";
import { ChatBlocks } from "./ChatBlocks";
import { ChatHttpError, streamChat, type ChatBlock } from "./chat-types";

// The co-pilot talks to the Revvie API directly (cookie session), not the Next server.
const AI_API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "").replace(/\/api$/, "") + "/api/ai";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  blocks?: ChatBlock[];
  toolPills?: Array<{ tool: string; title?: string }>;
  rideCards?: any[];
}

const WELCOME: Message = {
  id: "welcome",
  sender: "assistant",
  text: "Hey rider! I'm your Revvie Co-Pilot and garage mechanic. Ask me about any bike — specs, servicing, faults — or tell me to plan a ride.",
};

const STARTERS = [
  "🔧 My bike vibrates at 60 kph",
  "📖 Service schedule for a Royal Enfield Classic 350",
  "🏍️ Create a breakfast ride to Nandi Hills tomorrow 6 AM",
  "🔍 Find upcoming rides",
];

const MAX_STORED = 40;

const Markdown = ({ children }: { children: string }) => (
  <div className="space-y-2 [&_a]:text-[#ff4d57] [&_a]:underline [&_code]:rounded [&_code]:bg-black/40 [&_code]:px-1 [&_h1]:text-sm [&_h1]:font-bold [&_h2]:text-[13px] [&_h2]:font-bold [&_h3]:font-semibold [&_hr]:border-[#3a3a3c] [&_li]:ml-4 [&_ol]:list-decimal [&_ul]:list-disc [&_strong]:text-white">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
        table: (props) => (
          <div className="overflow-x-auto">
            <table {...props} className="w-full border-collapse text-[11px]" />
          </div>
        ),
        th: (props) => <th {...props} className="border border-[#3a3a3c] bg-black/30 px-2 py-1 text-left" />,
        td: (props) => <td {...props} className="border border-[#3a3a3c] px-2 py-1 align-top" />,
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);

export const AiCoPilot: React.FC = () => {
  const { data: session } = authClient.useSession();
  const userId = (session as any)?.user?.id as string | undefined;
  const storageKey = userId ? `revvie-copilot:${userId}` : null;

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [credits, setCredits] = useState<{ remaining: number; limit: number } | null>(null);

  // Live (in-flight) assistant turn.
  const [status, setStatus] = useState<string>("");
  const [liveText, setLiveText] = useState("");
  const [liveBlocks, setLiveBlocks] = useState<ChatBlock[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const hydrated = useRef(false);

  // Restore the conversation for this rider.
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Message[];
        if (Array.isArray(saved) && saved.length) setMessages(saved);
      }
    } catch {
      // storage unavailable or corrupt: start fresh
    }
    hydrated.current = true;
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || !hydrated.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
      // quota/private mode: persistence is a nicety only
    }
  }, [messages, storageKey]);

  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${AI_API}/credits`, { withCredentials: true })
        .then((res) => {
          if (res.data?.credits) {
            setCredits({ remaining: res.data.credits.remaining, limit: res.data.credits.limit });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, liveText, liveBlocks, status]);

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([WELCOME]);
    setInput("");
    setLiveText("");
    setLiveBlocks([]);
    setStatus("");
    setIsLoading(false);
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || isLoading) return;

    const history = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));

    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text: query }]);
    if (textToSend === undefined) setInput("");
    setIsLoading(true);
    setStatus("Thinking");
    setLiveText("");
    setLiveBlocks([]);

    const controller = new AbortController();
    abortRef.current = controller;
    let streamed = "";
    let finished = false;

    try {
      for await (const ev of streamChat(`${AI_API}/chat/stream`, { message: query, history }, controller.signal)) {
        if (ev.event === "status") setStatus(ev.data.text);
        else if (ev.event === "delta") {
          streamed += ev.data.text;
          setLiveText(streamed);
          setStatus("");
        } else if (ev.event === "reset") {
          streamed = "";
          setLiveText("");
        } else if (ev.event === "blocks") setLiveBlocks(ev.data.blocks);
        else if (ev.event === "done") {
          finished = true;
          const d = ev.data as any;
          if (d.credits) setCredits(d.credits);
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: "assistant",
              text: d.reply || "Done!",
              blocks: d.blocks?.length ? d.blocks : undefined,
              toolPills: d.tools?.length ? d.tools : undefined,
              rideCards: d.rides?.length ? d.rides : undefined,
            },
          ]);
        } else if (ev.event === "error") {
          finished = true;
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: "assistant",
              text: ev.data.message || "Sorry, something went wrong. Please try again.",
            },
          ]);
        }
      }
      if (!finished) {
        // Stream ended without a terminal event (network drop): keep what we got.
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "assistant",
            text: streamed || "The connection dropped before I could answer. Please try again.",
          },
        ]);
      }
    } catch (err: any) {
      if (controller.signal.aborted) {
        if (streamed) {
          setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: "assistant", text: streamed }]);
        }
      } else {
        if (err instanceof ChatHttpError && err.body.remainingCredits !== undefined) {
          setCredits({ remaining: err.body.remainingCredits, limit: err.body.dailyLimit ?? 0 });
        }
        const text =
          err instanceof ChatHttpError
            ? err.body.error || err.body.message || "Sorry, I had trouble connecting to the AI brain."
            : "Sorry, I had trouble connecting to the AI brain. Please try again.";
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: "assistant", text }]);
      }
    } finally {
      abortRef.current = null;
      setIsLoading(false);
      setStatus("");
      setLiveText("");
      setLiveBlocks([]);
    }
  };

  if (!session) return null; // the assistant acts on the rider's account, so signed-in only

  const lastIndex = messages.length - 1;

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full border border-[#ff1d2d]/40 bg-[#0d0d0f]/90 px-4 py-3 text-white shadow-2xl backdrop-blur-xl transition-all hover:border-[#ff1d2d] hover:shadow-[#ff1d2d]/25 cursor-pointer"
          aria-label="Revvie AI"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff1d2d] opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#ff1d2d]"></span>
          </span>
          <Sparkles className="h-4 w-4 text-[#ff4d57]" />
          <span className="text-xs font-bold tracking-wider uppercase">Revvie AI</span>
        </motion.button>
      )}

      {/* Co-Pilot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 flex flex-col border border-[#3a3a3c] bg-[#0d0d0f]/95 shadow-2xl backdrop-blur-2xl transition-all ${
              isExpanded
                ? "inset-2 rounded-2xl sm:inset-6"
                : "bottom-6 right-6 h-[560px] w-[380px] rounded-2xl sm:w-[420px]"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#3a3a3c] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#ff1d2d]" />
                <h3 className="text-sm font-bold tracking-wide text-white">Revvie Co-Pilot</h3>
                {credits && (
                  <span className="rounded-full border border-[#3a3a3c] bg-[#1c1c1e] px-2 py-0.5 text-[10px] font-medium text-[#aaaaaa]">
                    {credits.remaining}/{credits.limit} left
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={newChat}
                  className="rounded-lg p-1.5 text-[#aaaaaa] hover:bg-[#1c1c1e] hover:text-white cursor-pointer"
                  aria-label="New chat"
                  title="New chat"
                >
                  <SquarePen className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="rounded-lg p-1.5 text-[#aaaaaa] hover:bg-[#1c1c1e] hover:text-white cursor-pointer"
                  aria-label="Toggle expanded view"
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-[#aaaaaa] hover:bg-[#1c1c1e] hover:text-white cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 text-xs">
              <div className={`mx-auto space-y-3.5 ${isExpanded ? "max-w-3xl" : ""}`}>
                {messages.map((m, idx) => (
                  <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                        m.sender === "user"
                          ? "bg-[#ff1d2d] text-white"
                          : "border border-[#3a3a3c] bg-[#1c1c1e] text-[#dddddd]"
                      }`}
                    >
                      {m.sender === "assistant" ? <Markdown>{m.text}</Markdown> : m.text}
                    </div>

                    {m.blocks && m.blocks.length > 0 && (
                      <ChatBlocks
                        blocks={m.blocks}
                        interactive={idx === lastIndex && !isLoading}
                        onChoose={(v) => handleSend(v)}
                      />
                    )}

                    {/* Tool execution badge */}
                    {m.toolPills?.map((p, i) => (
                      <div
                        key={i}
                        className="mt-1.5 flex items-center gap-1.5 rounded-full bg-[#ff1d2d]/10 px-2.5 py-0.5 text-[10px] text-[#ff4d57]"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>
                          {p.tool}: {p.title}
                        </span>
                      </div>
                    ))}

                    {m.rideCards?.map((r, i) => (
                      <div key={i} className="w-full max-w-[85%]">
                        <RidePreviewCard
                          rideId={r.rideId}
                          title={r.title}
                          startLocation={r.startLocation}
                          endLocation={r.endLocation}
                          scheduledAt={r.scheduledAt}
                        />
                      </div>
                    ))}
                  </div>
                ))}

                {/* In-flight turn: progress, streamed text, early blocks */}
                {isLoading && (
                  <div className="flex flex-col items-start">
                    {liveText && (
                      <div className="max-w-[92%] rounded-2xl border border-[#3a3a3c] bg-[#1c1c1e] px-3.5 py-2.5 leading-relaxed text-[#dddddd]">
                        <Markdown>{liveText}</Markdown>
                      </div>
                    )}
                    {liveBlocks.length > 0 && (
                      <ChatBlocks blocks={liveBlocks} interactive={false} onChoose={() => {}} />
                    )}
                    {status && (
                      <div className="mt-2 flex items-center gap-2 text-[#aaaaaa]" aria-live="polite">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ff1d2d]" />
                        <span>{status}…</span>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Starters */}
            {messages.length <= 1 && !isLoading && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                {STARTERS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="rounded-full border border-[#3a3a3c] bg-[#1c1c1e] px-2.5 py-1 text-[10px] text-[#aaaaaa] transition-colors hover:border-[#ff1d2d] hover:text-white cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="border-t border-[#3a3a3c] p-3"
            >
              <div className={`mx-auto flex items-center gap-2 rounded-xl border border-[#3a3a3c] bg-[#1c1c1e] px-3 py-1.5 focus-within:border-[#ff1d2d] ${isExpanded ? "max-w-3xl" : ""}`}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about any bike, a fault, or plan a ride..."
                  className="w-full bg-transparent text-xs text-white placeholder-[#8e8e93] outline-none"
                />
                {isLoading ? (
                  <button
                    type="button"
                    onClick={() => abortRef.current?.abort()}
                    className="rounded-lg p-1.5 text-[#ff1d2d] transition-colors hover:bg-[#ff1d2d]/20 cursor-pointer"
                    aria-label="Stop"
                  >
                    <Square className="h-4 w-4 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="rounded-lg p-1.5 text-[#ff1d2d] transition-colors hover:bg-[#ff1d2d]/20 disabled:opacity-40 cursor-pointer"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
