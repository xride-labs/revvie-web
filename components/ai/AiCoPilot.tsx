"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Sparkles, CheckCircle2, Loader2, Maximize2, Minimize2 } from "lucide-react";
import axios from "axios";
import { authClient } from "@/lib/auth-client";

// The co-pilot talks to the Revvie API directly (cookie session), not the Next server.
const AI_API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "").replace(/\/api$/, "") + "/api/ai";
import { RidePreviewCard } from "./RidePreviewCard";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  toolPills?: Array<{ tool: string; title?: string }>;
  rideCards?: any[];
}

export const AiCoPilot: React.FC = () => {
  const { data: session } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hey rider! I'm your Revvie Co-Pilot. You can tell me in plain English to plan rides, check your garage, or find upcoming group routes.",
    },
  ]);

  const [credits, setCredits] = useState<{ remaining: number; limit: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${AI_API}/chat`,
        {
          message: query,
          history: messages
            .slice(1)
            .map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })),
        },
        { withCredentials: true },
      );
      const data = res.data;

      if (data.credits) {
        setCredits(data.credits);
      }

      const toolPills = (data.toolCallsExecuted || []).map((t: any) => ({
        tool: t.tool,
        title: t.result?.title || t.args?.title || t.tool,
      }));

      const rideCards = (data.toolCallsExecuted || [])
        .filter((t: any) => t.tool === "create_ride" && t.result?.rideId)
        .map((t: any) => t.result);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: data.reply || "Done!",
        toolPills: toolPills.length ? toolPills : undefined,
        rideCards: rideCards.length ? rideCards : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      if (err.response?.data?.remainingCredits !== undefined) {
        setCredits({ remaining: err.response.data.remainingCredits, limit: err.response.data.dailyLimit });
      }
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: err.response?.data?.error || "Sorry, I had trouble connecting to the AI brain. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null; // the assistant acts on the rider's account, so signed-in only

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
            className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-[#3a3a3c] bg-[#0d0d0f]/95 shadow-2xl backdrop-blur-2xl transition-all ${
              isExpanded ? "h-[85vh] w-[90vw] md:w-[700px]" : "h-[560px] w-[380px] sm:w-[420px]"
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
            <div className="flex-1 space-y-3.5 overflow-y-auto p-4 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      m.sender === "user"
                        ? "bg-[#ff1d2d] text-white"
                        : "border border-[#3a3a3c] bg-[#1c1c1e] text-[#dddddd]"
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Tool execution badge */}
                  {m.toolPills?.map((p, idx) => (
                    <div
                      key={idx}
                      className="mt-1.5 flex items-center gap-1.5 rounded-full bg-[#ff1d2d]/10 px-2.5 py-0.5 text-[10px] text-[#ff4d57]"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>
                        {p.tool}: {p.title}
                      </span>
                    </div>
                  ))}

                  {/* Render Ride Cards if any */}
                  {m.rideCards?.map((r, idx) => (
                    <div key={idx} className="w-full max-w-[85%]">
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

              {isLoading && (
                <div className="flex items-center gap-2 text-[#aaaaaa]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ff1d2d]" />
                  <span>Planning route & thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starters */}
            {messages.length <= 2 && (
              <div className="flex gap-1.5 overflow-x-auto px-4 pb-2">
                {[
                  "🏍️ Create a breakfast ride to Nandi Hills tomorrow 6 AM",
                  "🔍 Find upcoming rides",
                  "🔧 Check my garage",
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="whitespace-nowrap rounded-full border border-[#3a3a3c] bg-[#1c1c1e] px-2.5 py-1 text-[10px] text-[#aaaaaa] transition-colors hover:border-[#ff1d2d] hover:text-white cursor-pointer"
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
              <div className="flex items-center gap-2 rounded-xl border border-[#3a3a3c] bg-[#1c1c1e] px-3 py-1.5 focus-within:border-[#ff1d2d]">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Revvie AI or create a ride..."
                  className="w-full bg-transparent text-xs text-white placeholder-[#8e8e93] outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="rounded-lg p-1.5 text-[#ff1d2d] transition-colors hover:bg-[#ff1d2d]/20 disabled:opacity-40 cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
