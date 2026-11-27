import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { ChatWorkspace } from "../ChatWorkspace";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/chat",
}));

vi.mock("@/lib/auth-client", () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/use-auth", () => ({
  useAuth: () => ({
    user: { id: "u1", name: "Krithik M", email: "rider@example.com" },
    hasSession: true,
    isAuthenticated: true,
    isPending: false,
    error: null,
  }),
}));

// The transport is exercised by the backend suite; here we only care that the
// workspace renders the stream and persists the thread.
vi.mock("../chat-types", () => ({
  ChatHttpError: class ChatHttpError extends Error {},
  streamChat: async function* () {
    yield { event: "status", data: { text: "Thinking" } };
    yield { event: "delta", data: { text: "Hello rider" } };
    yield {
      event: "done",
      data: {
        reply: "Hello rider",
        blocks: [],
        credits: { remaining: 18, limit: 20 },
      },
    };
  },
}));

describe("ChatWorkspace", () => {
  beforeEach(() => {
    window.localStorage.clear();
    push.mockReset();
  });

  it("greets the rider with starters and a composer", () => {
    render(<ChatWorkspace />);

    expect(screen.getByRole("heading", { name: /what are we working on/i })).toBeDefined();
    expect(screen.getByLabelText("Message Revvie AI")).toBeDefined();
    // Sidebar and header both offer a new chat.
    expect(screen.getAllByRole("button", { name: /new chat/i }).length).toBeGreaterThan(0);
  });

  it("streams an answer into the thread and saves it", async () => {
    render(<ChatWorkspace />);

    const box = screen.getByLabelText("Message Revvie AI");
    fireEvent.change(box, { target: { value: "What is the service interval?" } });
    fireEvent.submit(box.closest("form")!);

    await waitFor(() => {
      const saved = window.localStorage.getItem("revvie-chat:v1:u1") ?? "";
      expect(saved).toContain("What is the service interval?");
      expect(saved).toContain("Hello rider");
    });
  });
});
