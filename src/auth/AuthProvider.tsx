// src/auth/AuthProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useIdleLogout } from "@/hooks/useIdleLogout";

export type Role = "student" | "teacher" | "admin";

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
  authLoading: boolean; // ✅ added
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

const LOCAL_TOKEN_KEY = "edulinkx_token";
const LOCAL_USER_KEY = "edulinkx_user";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUserState] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* -------------------------------------------------------
     Load auth state once on app start
  ------------------------------------------------------- */
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(LOCAL_TOKEN_KEY);
      const storedUser = localStorage.getItem(LOCAL_USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUserState(JSON.parse(storedUser));
      } else {
        setToken(null);
        setUserState(null);
      }
    } catch (err) {
      console.error("Auth load failed:", err);
      setToken(null);
      setUserState(null);
    } finally {
      setAuthLoading(false); // ✅ hydration finished
    }
  }, []);

  /* -------------------------------------------------------
     Keep localStorage in sync
  ------------------------------------------------------- */
  useEffect(() => {
    // ✅ Do not sync to storage until hydration is finished
    if (authLoading) return;

    try {
      if (token) localStorage.setItem(LOCAL_TOKEN_KEY, token);
      else localStorage.removeItem(LOCAL_TOKEN_KEY);

      if (user) localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(LOCAL_USER_KEY);
    } catch (err) {
      console.error("Auth storage sync failed:", err);
    }
  }, [token, user, authLoading]);

  /* -------------------------------------------------------
     Login
  ------------------------------------------------------- */
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUserState(newUser);
  };

  /* -------------------------------------------------------
     Logout
  ------------------------------------------------------- */
  const logout = () => {
    setToken(null);
    setUserState(null);

    try {
      localStorage.removeItem(LOCAL_TOKEN_KEY);
      localStorage.removeItem(LOCAL_USER_KEY);
    } catch {}
  };

  /* -------------------------------------------------------
     Derived auth state
  ------------------------------------------------------- */
  const isAuthenticated = Boolean(token && user);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      authLoading,
      login,
      logout,
      setUser: setUserState,
    }),
    [user, token, isAuthenticated, authLoading]
  );

  /* -------------------------------------------------------
     Idle auto logout (30 min)
  ------------------------------------------------------- */
  useIdleLogout(logout);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
