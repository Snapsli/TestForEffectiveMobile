import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { UsersAPI } from "@/lib/api";

type User = {
  id: string;
  fullName: string;
  birthDate: string | Date;
  email: string;
  role: "admin" | "user";
  isActive: boolean;
};

type AuthContextState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(null);

  const login = (t: string) => {
    setToken(t);
    localStorage.setItem("token", t);
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  const value = useMemo(() => ({ user, token, isAuthenticated: Boolean(token), login, logout, setUser }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Загрузка профиля при наличии токена
export function AuthBootstrap() {
  const { token, setUser } = useAuth();
  useEffect(() => {
    const run = async () => {
      if (!token) return;
      try {
        const me = await UsersAPI.me(token);
        setUser(me);
      } catch {
        // ignore
      }
    };
    run();
  }, [token, setUser]);
  return null;
}

