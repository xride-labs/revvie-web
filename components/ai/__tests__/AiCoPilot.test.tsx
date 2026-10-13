import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { AiCoPilot } from "../AiCoPilot";

vi.mock("@/lib/auth-client", () => ({
  authClient: { useSession: () => ({ data: { user: { id: "u1" } } }) },
}));

vi.mock("axios", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { credits: { remaining: 20, limit: 20 } } }),
    post: vi.fn().mockResolvedValue({
      data: {
        success: true,
        reply: "Here is your plan!",
        toolCallsExecuted: [],
      },
    }),
  },
}));

describe("AiCoPilot Component", () => {
  it("renders trigger button and opens co-pilot panel on click", () => {
    render(<AiCoPilot />);
    const trigger = screen.getByRole("button", { name: /revvie ai/i });
    expect(trigger).toBeDefined();

    fireEvent.click(trigger);
    expect(screen.getByRole("heading", { name: /revvie co-pilot/i })).toBeDefined();
  });
});
