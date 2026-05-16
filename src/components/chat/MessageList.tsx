import type { Message } from "@/src/types/chat";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";

export interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div
      role="log"
      aria-label="Conversation"
      aria-live="polite"
      className="flex flex-col gap-6 px-4 py-4 overflow-y-auto flex-1"
    >
      {messages.map((msg) =>
        msg.role === "user" ? (
          <UserMessage key={msg.id} message={msg} />
        ) : (
          <AssistantMessage key={msg.id} message={msg} />
        ),
      )}
    </div>
  );
}
