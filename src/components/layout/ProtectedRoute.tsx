import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/ui/Spinner";

/** Toda rota privada passa por aqui. O RLS protege os dados; isto protege a navegação. */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Verificando sua sessão..." />;
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <>{children}</>;
}

/** Evita que quem já está logado veja login/cadastro novamente. */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
