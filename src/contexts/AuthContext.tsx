import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { authErrorMessage, isSupabaseConfigured, supabase } from "@/lib/supabase";

interface AuthResult {
  error: string | null;
  /** true quando o Supabase exige confirmação de e-mail antes do primeiro login. */
  needsEmailConfirmation?: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updatePassword: (password: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Assina as mudanças antes de ler a sessão, para não perder eventos.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (!supabase) return { error: "Supabase não configurado." };
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: displayName.trim() } },
      });
      if (error) return { error: authErrorMessage(error.message) };
      return {
        error: null,
        needsEmailConfirmation: Boolean(data.user && !data.session),
      };
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: "Supabase não configurado." };
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error: error ? authErrorMessage(error.message) : null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) return { error: "Supabase não configurado." };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? authErrorMessage(error.message) : null };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return { error: "Supabase não configurado." };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });
    return { error: error ? authErrorMessage(error.message) : null };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      configured: isSupabaseConfigured,
      signUp,
      signIn,
      signOut,
      updatePassword,
      resetPassword,
    }),
    [session, loading, signUp, signIn, signOut, updatePassword, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return context;
}
