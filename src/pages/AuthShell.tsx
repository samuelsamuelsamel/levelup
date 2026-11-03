import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/contexts/AuthContext";

/** Moldura comum das telas de login e cadastro. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const { configured } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-base-900">
      <header className="border-b border-base-700">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
          <Link to="/">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>

          {!configured && (
            <div className="mt-5 flex gap-2.5 rounded-lg border border-amber-900/70 bg-amber-950/30 p-3 text-xs leading-relaxed text-amber-100/90">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                O Supabase ainda não está conectado. Defina{" "}
                <code className="text-amber-200">VITE_SUPABASE_URL</code> e{" "}
                <code className="text-amber-200">VITE_SUPABASE_ANON_KEY</code> para
                ativar o cadastro e o login.
              </span>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-base-700 bg-base-850 p-5">
            {children}
          </div>

          <div className="mt-5 text-center text-sm text-ink-muted">{footer}</div>
        </div>
      </main>
    </div>
  );
}
