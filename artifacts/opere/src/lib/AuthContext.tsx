import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getToken, getUser, setToken, setUser, removeToken, removeUser, api } from "./api";

interface User {
  id: string;
  name?: string | null;
  email: string;
  organizationId?: string | null;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = getToken();
    const u = getUser();
    if (t && u) {
      setTokenState(t);
      setUserState(u as User);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.auth.login(email, password);
    setToken(data.token);
    setUser(data.user);
    setTokenState(data.token);
    setUserState(data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await api.auth.register(name, email, password);
    setToken(data.token);
    setUser(data.user);
    setTokenState(data.token);
    setUserState(data.user);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    removeUser();
    setTokenState(null);
    setUserState(null);
  }, []);

  const updateUser = useCallback((u: User) => {
    setUser(u);
    setUserState(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
