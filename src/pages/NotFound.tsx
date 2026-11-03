import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/contexts/AuthContext";

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-base-900 px-4 text-center">
      <Logo />
      <div>
        <p className="text-5xl font-semibold tabular-nums text-moss-500">404</p>
        <h1 className="mt-3 text-lg font-semibold text-ink">Página não encontrada</h1>
        <p className="mt-1.5 max-w-sm text-sm text-ink-muted">
          O endereço acessado não existe ou foi movido.
        </p>
      </div>
      <Link to={user ? "/dashboard" : "/"}>
        <Button>{user ? "Voltar ao dashboard" : "Voltar ao início"}</Button>
      </Link>
    </div>
  );
}
