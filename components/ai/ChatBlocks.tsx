"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import type { ChatBlock, ChatImage } from "./chat-types";

interface Props {
  blocks: ChatBlock[];
  /** Only the newest assistant message has live buttons. */
  interactive: boolean;
  onChoose: (value: string) => void;
}

function Attribution({ image }: { image: ChatImage }) {
  const line = [image.author, image.license].filter(Boolean).join(" · ") || image.title;
  return (
    <a
      href={image.page}
      target="_blank"
      rel="noopener noreferrer"
      className="block truncate px-2 py-1 text-[9px] text-[#8e8e93] hover:text-white"
      title={line}
    >
      Photo: {line}
    </a>
  );
}

export const ChatBlocks: React.FC<Props> = ({ blocks, interactive, onChoose }) => (
  <div className="mt-2 w-full space-y-2.5">
    {blocks.map((b, i) => {
      if (b.type === "bike_card") {
        const c = b.card;
        return (
          <div key={i} className="max-w-[420px] overflow-hidden rounded-2xl border border-[#3a3a3c] bg-[#1c1c1e]">
            {c.image && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image.thumb} alt={c.title} className="h-44 w-full object-cover" loading="lazy" />
                <Attribution image={c.image} />
              </>
            )}
            <div className="p-3">
              <div className="text-sm font-bold text-white">
                {c.title}
                {c.year ? <span className="font-normal text-[#8e8e93]"> · {c.year}</span> : null}
              </div>
              {c.highlights.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.highlights.map((h) => (
                    <div key={h.label} className="rounded-lg bg-[#0d0d0f] px-2 py-1">
                      <div className="text-[9px] uppercase tracking-wide text-[#8e8e93]">{h.label}</div>
                      <div className="text-[11px] font-semibold text-white">{h.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }

      if (b.type === "images") {
        return (
          <div key={i} className="flex gap-2 overflow-x-auto pb-1">
            {b.images.map((img) => (
              <div key={img.url} className="w-56 shrink-0 overflow-hidden rounded-xl border border-[#3a3a3c] bg-[#1c1c1e]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.thumb} alt={img.title} className="h-36 w-full object-cover" loading="lazy" />
                <Attribution image={img} />
              </div>
            ))}
          </div>
        );
      }

      if (b.type === "sources") {
        return (
          <div key={i} className="flex flex-wrap gap-1.5">
            {b.sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex max-w-[220px] items-center gap-1 rounded-full border border-[#3a3a3c] px-2.5 py-1 text-[10px] text-[#aaaaaa] transition-colors hover:border-[#ff1d2d] hover:text-white"
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate">{s.title}</span>
              </a>
            ))}
          </div>
        );
      }

      // choices
      return (
        <div key={i} className="flex flex-wrap gap-2">
          {b.options.map((o) => (
            <button
              key={o.label}
              type="button"
              disabled={!interactive}
              onClick={() => onChoose(o.value)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                interactive
                  ? "cursor-pointer border-[#ff1d2d] bg-[#ff1d2d]/10 text-white hover:bg-[#ff1d2d]/30"
                  : "cursor-default border-[#3a3a3c] bg-[#1c1c1e] text-[#8e8e93] opacity-60"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      );
    })}
  </div>
);
