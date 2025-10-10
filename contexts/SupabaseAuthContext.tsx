"use client";

import { createContext, useContext } from "react";

// Minimal local types to avoid supabase dependency
interface UserProfile {
  id: string;
  email: string;
  role: "customer" | "admin";
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  created_at?: string;
}

interface Session {
  access_token?: string;
}
interface User {
  id: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; profile?: UserProfile }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  isAdmin: boolean;
}

const defaultUser: User = { id: "anon", email: "admin@local" };
const defaultProfile: UserProfile = { id: "anon", email: "admin@local", role: "admin" };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const value: AuthContextType = {
    user: defaultUser,
    session: null,
    profile: defaultProfile,
    isLoading: false,
    signIn: async () => ({ error: "Auth disabled" }),
    signUp: async () => ({ error: "Auth disabled" }),
    signOut: async () => Promise.resolve(),
    updateProfile: async () => ({ error: "Auth disabled" }),
    isAdmin: true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a SupabaseAuthProvider");
  }
  return context;
}