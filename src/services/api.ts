import { LoginRequest, LoginResponse } from "@/types/auth";
import { ChatApiRequest, ChatApiResponse } from "@/types/chat";

// BASE_URL from environment variable. Falls back to empty string for relative URLs.
const BASE_URL = import.meta.env.VITE_BASE_URL || "";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(errorBody || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    request<LoginResponse>("/api/v1/Auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const chatApi = {
  send: (data: ChatApiRequest, token: string): Promise<ChatApiResponse> =>
    request<ChatApiResponse>("/api/v1/interakt/chat-ai", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
};
