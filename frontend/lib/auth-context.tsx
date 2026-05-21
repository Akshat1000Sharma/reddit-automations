"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { authApi } from "./api";

interface User {
  id: number;
  email: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      authApi.me()
        .then((res) => setUser(res.data))
        .catch(() => { Cookies.remove("token"); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    Cookies.set("token", res.data.access_token, { expires: 7 });
    setUser(res.data.user);
  };

  const register = async (email: string, password: string, confirmPassword: string) => {
    const res = await authApi.register(email, password, confirmPassword);
    Cookies.set("token", res.data.access_token, { expires: 7 });
    setUser(res.data.user);
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
