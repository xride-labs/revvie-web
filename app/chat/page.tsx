import type { Metadata } from "next";
import { ChatWorkspace } from "@/components/ai/ChatWorkspace";

export const metadata: Metadata = {
  title: "Revvie AI — Chat",
  description:
    "Chat with the Revvie AI co-pilot: motorcycle specs, service schedules, fault diagnosis, buying advice and ride planning.",
};

export default function ChatPage() {
  return <ChatWorkspace />;
}
