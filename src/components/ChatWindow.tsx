import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { chatApi } from "@/services/api";
import { chatDb } from "@/services/indexedDb";
import { ChatMessage, ChatSession } from "@/types/chat";
import {
  Send,
  Loader2,
  ArrowLeft,
  Video,
  Phone,
  MoreVertical,
  Smile,
  Camera,
  Mic,
  Check,
  CheckCheck,
  Bot,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  session?: ChatSession | null;
  onSessionUpdate?: (session: ChatSession) => void;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function DateSeparator() {
  return (
    <div className="flex justify-center my-3">
      <span className="rounded-lg bg-chat-date-bg px-3 py-1 text-xs text-muted-foreground shadow-sm">
        Today
      </span>
    </div>
  );
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} px-3 mb-1`}>
      <div
        className={`relative max-w-[80%] rounded-lg px-3 py-1.5 text-sm leading-relaxed shadow-sm ${isUser
          ? "bg-chat-user text-foreground rounded-tr-none"
          : "bg-chat-bot text-foreground rounded-tl-none"
          }`}
      >
        {/* Tail notch */}
        <div
          className={`absolute top-0 w-3 h-3 ${isUser
            ? "-right-1.5 bg-chat-user"
            : "-left-1.5 bg-chat-bot"
            }`}
          style={{
            clipPath: isUser
              ? "polygon(0 0, 100% 0, 0 100%)"
              : "polygon(100% 0, 0 0, 100% 100%)",
          }}
        />
        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        <div className={`flex items-center gap-1 mt-0.5 ${isUser ? "justify-end" : "justify-end"}`}>
          <span className="text-[10px] text-muted-foreground/70">{formatTime(msg.timestamp)}</span>
          {isUser && <CheckCheck className="h-3.5 w-3.5 text-chat-tick" />}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start px-3 mb-1">
      <div className="relative max-w-[80%] rounded-lg rounded-tl-none bg-chat-bot px-4 py-3 shadow-sm">
        <div
          className="absolute top-0 -left-1.5 w-3 h-3 bg-chat-bot"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        />
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot [animation-delay:0.2s]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}

export default function ChatWindow({ session, onSessionUpdate }: Props) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

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
          ? ((rawResponse as Record<string, unknown>).text as string) ||
          JSON.stringify(rawResponse)
          : res.reply ||
          res.message ||
          (typeof rawResponse === "string"
            ? rawResponse
            : JSON.stringify(res));

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "bot",
        content: botContent,
        timestamp: Date.now(),
      };

      const allMessages = [...updatedMessages, botMsg];
      setMessages(allMessages);

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
    } catch {
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
    <div className="flex h-full flex-col bg-chat-bg">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 bg-chat-header px-2 py-2 shadow-md z-10">
        <button
          onClick={() => navigate("/")}
          className="p-1.5 rounded-full hover:bg-secondary/50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Bot avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chat-green">
          <Bot className="h-5 w-5 text-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">Seema AI</p>
          <p className="text-xs text-chat-green">Online</p>
        </div>

        {/* Action icons – no-op */}
        <button className="p-2 rounded-full hover:bg-secondary/50 transition-colors">
          <Video className="h-5 w-5 text-muted-foreground" />
        </button>
        <button className="p-2 rounded-full hover:bg-secondary/50 transition-colors">
          <Phone className="h-5 w-5 text-muted-foreground" />
        </button>
        <button className="p-2 rounded-full hover:bg-secondary/50 transition-colors">
          <MoreVertical className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center px-6">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-chat-green/20">
              <Bot className="h-8 w-8 text-chat-green" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Start a conversation</h2>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Type a message below to begin chatting with the AI assistant.
            </p>
          </div>
        )}

        {messages.length > 0 && <DateSeparator />}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} />
        ))}

        {loading && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="flex items-end gap-2 bg-chat-header px-2 py-2">
        {/* Emoji – no-op */}
        <button className="p-2 rounded-full hover:bg-secondary/50 transition-colors shrink-0">
          <Smile className="h-6 w-6 text-muted-foreground" />
        </button>

        <div className="flex flex-1 items-end rounded-3xl bg-chat-input-bg px-4 py-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 max-h-24 leading-5"
            style={{ minHeight: "20px" }}
          />
          {/* Camera – no-op */}
          <button className="ml-2 shrink-0">
            <Camera className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Send / Mic button */}
        {input.trim() ? (
          <button
            onClick={handleSend}
            disabled={loading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chat-green text-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        ) : (
          <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chat-green text-foreground">
            <Mic className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
