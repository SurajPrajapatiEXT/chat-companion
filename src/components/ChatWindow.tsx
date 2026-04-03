import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { chatApi } from "@/services/api";
import { chatDb } from "@/services/indexedDb";
import { ChatMessage, ChatSession } from "@/types/chat";
import { Send, Loader2, Bot, UserIcon } from "lucide-react";

interface Props {
  session?: ChatSession | null;
  onSessionUpdate?: (session: ChatSession) => void;
}

export default function ChatWindow({ session, onSessionUpdate }: Props) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Init or load session
  useEffect(() => {
    if (session) {
      setMessages(session.messages);
      setSessionId(session.id);
    } else {
      const id = crypto.randomUUID();
      setSessionId(id);
      setMessages([]);
    }
  }, [session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildContextData = useCallback((): string => {
    // Build previous context from messages for the API "data" field
    if (messages.length === 0) return "";
    return messages
      .map((m) => `${m.role === "user" ? "User" : "Bot"}: ${m.content}`)
      .join("\n");
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || !token) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await chatApi.send(
        {
          // Mobile is not available from login response; using a placeholder.
          // TODO: Replace with actual mobile number if available in user data.
          mobile: "0000000000",
          name: user?.username || "User",
          instructionKey: "instruction_force_to_visit_gym",
          message: text,
          data: buildContextData(),
        },
        token
      );

      const rawResponse = res.response;
      const botContent =
        typeof rawResponse === "object" && rawResponse !== null
          ? (rawResponse as Record<string, unknown>).text as string || JSON.stringify(rawResponse)
          : res.reply || res.message || (typeof rawResponse === "string" ? rawResponse : JSON.stringify(res));
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "bot",
        content: botContent,
        timestamp: Date.now(),
      };

      const allMessages = [...updatedMessages, botMsg];
      setMessages(allMessages);

      // Persist to IndexedDB
      const title = updatedMessages[0]?.content.slice(0, 60) || "New Chat";
      const now = Date.now();
      const chatSession: ChatSession = {
        id: sessionId,
        title,
        createdAt: session?.createdAt || now,
        updatedAt: now,
        messages: allMessages,
      };
      await chatDb.save(chatSession);
      onSessionUpdate?.(chatSession);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "bot",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Start a conversation</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Type a message below to begin chatting with the AI assistant.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex max-w-[80%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "user" ? "bg-primary" : "bg-secondary"
                }`}
              >
                {msg.role === "user" ? (
                  <UserIcon className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-foreground" />
                )}
              </div>
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-chat-user text-primary-foreground"
                    : "bg-chat-bot text-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                <Bot className="h-4 w-4 text-foreground" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl bg-chat-bot px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-input bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
