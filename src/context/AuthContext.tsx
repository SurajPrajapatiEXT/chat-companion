import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { AuthState, LoginResponse, UserProfile } from "@/types/auth";

const AUTH_STORAGE_KEY = "chatbot_auth";

interface AuthContextType extends AuthState {
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadAuth(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { user: null, token: null, expiresAt: null, isAuthenticated: false };
    const parsed = JSON.parse(raw) as { user: UserProfile; token: string; expiresAt: number };
    // Check expiry
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return { user: null, token: null, expiresAt: null, isAuthenticated: false };
    }
    return { ...parsed, isAuthenticated: true };
  } catch {
    return { user: null, token: null, expiresAt: null, isAuthenticated: false };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadAuth);

  // Re-check expiry on mount
  useEffect(() => {
    if (auth.expiresAt && Date.now() > auth.expiresAt) {
      logout();
    }
  }, []);

  const login = useCallback((data: LoginResponse) => {
    const expiresAt = Date.now() + data.expiresIn * 1000;
    const state: AuthState = {
      user: data.user,
      token: data.token,
      expiresAt,
      isAuthenticated: true,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: data.user, token: data.token, expiresAt }));
    setAuth(state);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth({ user: null, token: null, expiresAt: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
