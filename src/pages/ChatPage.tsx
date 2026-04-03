import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ChatWindow from "@/components/ChatWindow";
import { ChatSession } from "@/types/chat";
import { chatDb } from "@/services/indexedDb";
import { useEffect } from "react";

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(!!sessionId);

  useEffect(() => {
    if (sessionId) {
      setLoading(true);
      chatDb.get(sessionId).then((s) => {
        setSession(s || null);
        setLoading(false);
      });
    } else {
      setSession(null);
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <ChatWindow key={session?.id || "new"} session={session} />;
}
