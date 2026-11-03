import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User as UserIcon,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { cn, initials } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/biblioteca", label: "Minha biblioteca", icon: Gamepad2 },
  { to: "/estatisticas", label: "Estatísticas", icon: BarChart3 },
  { to: "/perfil", label: "Meu perfil", icon: UserIcon },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border border-moss-700/70 bg-moss-800/50 text-ink"
                : "border border-transparent text-ink-muted hover:bg-base-800 hover:text-ink",
            )
          }
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const name = profile?.display_name || user?.email?.split("@")[0] || "Jogador";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-base-900">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-base-700 bg-base-850 p-4 lg:flex">
        <Link to="/dashboard" className="mb-7 px-2 pt-1">
          <Logo />
        </Link>
        <NavItems />
        <div className="mt-auto space-y-2 border-t border-base-700 pt-4">
          <Link
            to="/perfil"
            className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-base-800"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-moss-700 bg-moss-800/60 text-xs font-semibold text-moss-200">
              {initials(name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">
                {name}
              </span>
              <span className="block truncate text-xs text-ink-faint">
                {user?.email}
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-base-800 hover:text-ink"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Topbar — mobile e tablet */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-base-700 bg-base-850/95 px-4 backdrop-blur lg:hidden">
        <Link to="/dashboard">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-base-800 hover:text-ink"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-base-950/80"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div className="relative ml-auto flex h-full w-72 max-w-[85%] flex-col border-l border-base-700 bg-base-850 p-4 animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
                className="rounded-lg p-2 text-ink-muted hover:bg-base-800 hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavItems onNavigate={() => setMenuOpen(false)} />
            <div className="mt-auto border-t border-base-700 pt-4">
              <p className="px-3 pb-3 text-xs text-ink-faint">{user?.email}</p>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-base-800 hover:text-ink"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
