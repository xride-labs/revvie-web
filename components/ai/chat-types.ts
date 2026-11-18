export interface ChatImage {
  url: string;
  thumb: string;
  title: string;
  license: string | null;
  author: string | null;
  page: string;
}

/** Structured UI the assistant attaches to a reply (mirrors the backend). */
export type ChatBlock =
  | { type: "choices"; question: string; multi: boolean; options: Array<{ label: string; value: string }> }
  | {
      type: "bike_card";
      card: {
        title: string;
        year: number | null;
        model_id: number;
        highlights: Array<{ label: string; value: string }>;
        image: ChatImage | null;
      };
    }
  | { type: "images"; images: ChatImage[] }
  | { type: "sources"; sources: Array<{ title: string; url: string }> };

export type StreamEvent =
  | { event: "status"; data: { text: string } }
  | { event: "delta"; data: { text: string } }
  | { event: "reset"; data: Record<string, never> }
  | { event: "blocks"; data: { blocks: ChatBlock[] } }
  | {
      event: "done";
      data: {
        reply: string;
        blocks: ChatBlock[];
        credits: { remaining: number; limit: number } | null;
      };
    }
  | { event: "error"; data: { error: string; message?: string } };

export class ChatHttpError extends Error {
  constructor(
    public status: number,
    public body: { error?: string; message?: string; remainingCredits?: number; dailyLimit?: number },
  ) {
    super(body.message || body.error || `HTTP ${status}`);
  }
}

/**
 * POSTs to the streaming chat endpoint and yields parsed server-sent events.
 * Throws ChatHttpError for failures that happen before streaming starts
 * (401, 429 credits, 400...).
 */
export async function* streamChat(
  url: string,
  body: { message: string; history: Array<{ role: string; content: string }> },
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json", accept: "text/event-stream" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    let parsed: ChatHttpError["body"] = {};
    try {
      parsed = await res.json();
    } catch {
      // non-JSON error body
    }
    throw new ChatHttpError(res.status, parsed);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) >= 0) {
      const raw = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      let event = "message";
      const dataLines: string[] = [];
      for (const line of raw.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
      }
      if (!dataLines.length) continue;
      try {
        yield { event, data: JSON.parse(dataLines.join("\n")) } as StreamEvent;
      } catch {
        // ignore a malformed frame rather than killing the stream
      }
    }
  }
}
