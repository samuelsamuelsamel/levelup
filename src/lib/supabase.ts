import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

const env = import.meta.env;

/**
 * Aceita os dois padrões de nome usados pela integração Supabase do Lovable
 * (ANON_KEY nos projetos mais antigos, PUBLISHABLE_KEY nos mais recentes) e
 * também monta a URL a partir do PROJECT_ID quando só ele é fornecido.
 * Assim o projeto funciona sem ajustes depois de conectar o Supabase lá.
 */
const url =
  env.VITE_SUPABASE_URL ||
  (env.VITE_SUPABASE_PROJECT_ID
    ? `https://${env.VITE_SUPABASE_PROJECT_ID}.supabase.co`
    : undefined);

const anonKey =
  env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * O cliente só é criado quando as variáveis existem. Assim a aplicação
 * carrega e mostra uma instrução clara em vez de quebrar na tela branca
 * quando o Supabase ainda não foi conectado.
 *
 * Apenas a chave pública (anon) é usada aqui. A service_role nunca deve
 * aparecer no frontend.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient<Database>(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "levelup-auth",
      },
    })
  : null;

/** Uso interno: garante o cliente em código que só roda autenticado. */
export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (ou VITE_SUPABASE_PUBLISHABLE_KEY).",
    );
  }
  return supabase;
}

/** Traduz os erros mais comuns do Supabase Auth para português. */
export function authErrorMessage(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha incorretos.",
    "Email not confirmed":
      "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
    "User already registered": "Já existe uma conta com este e-mail.",
    "Password should be at least 6 characters":
      "A senha deve ter pelo menos 6 caracteres.",
    "Unable to validate email address: invalid format":
      "Informe um e-mail válido.",
    "For security purposes, you can only request this after 60 seconds.":
      "Aguarde alguns segundos antes de tentar novamente.",
  };
  return map[message] ?? message;
}
