// src/auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Role = "student" | "teacher" | "admin" | string;

export type User = {
  id: number;
  name?: string;
  email: string;
  role: Role;
  studentId?: string | null;
  employeeCode?: string | null;
};

type AuthContextShape = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

const LOCAL_TOKEN_KEY = "edulinkx_token";
const LOCAL_USER_KEY = "edulinkx_user";

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOCAL_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUserState] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // keep localStorage in sync if token/user changed
    try {
      if (token) localStorage.setItem(LOCAL_TOKEN_KEY, token);
      else localStorage.removeItem(LOCAL_TOKEN_KEY);
    } catch {}

    try {
      if (user) localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(LOCAL_USER_KEY);
    } catch {}
  }, [token, user]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUserState(newUser);
  };

  const logout = () => {
    setToken(null);
    setUserState(null);
    try {
      localStorage.removeItem(LOCAL_TOKEN_KEY);
      localStorage.removeItem(LOCAL_USER_KEY);
    } catch {}
    // optionally: redirect handled by consumer
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      setUser: setUserState,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
