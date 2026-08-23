import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";

export type Role = "trainer" | "student" | null;

export type AuthValue = {
  session: Session | null;
  role: Role;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ error: string | null }>;
};

export const AuthContext = createContext<AuthValue | undefined>(undefined);
