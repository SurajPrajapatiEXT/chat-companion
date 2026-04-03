export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface ChatApiRequest {
  mobile: string;
  name: string;
  instructionKey: string;
  message: string;
  data: string;
}

export interface ChatApiResponse {
  reply?: string;
  message?: string;
  response?: string;
  [key: string]: unknown;
}
