import { Link } from "react-router-dom";
import { BarChart3, Gamepad2, Library, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

const FEATURES = [
  {
    icon: Library,
    title: "Biblioteca organizada",
    text: "Cadastre cada jogo com plataforma, status, horas e avaliação. Tudo em um só lugar, do backlog ao platinado.",
  },
  {
    icon: BarChart3,
    title: "Estatísticas reais",
    text: "Horas registradas, jogos por status e média das suas notas — calculado a partir da sua biblioteca, nunca estimado.",
  },
  {
    icon: ShieldCheck,
    title: "Só sua",
    text: "Cada conta vê apenas os próprios registros, com as permissões aplicadas no banco de dados e não só na tela.",
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-base-900">
      <header className="border-b border-base-700">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm">Ir para o dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link to="/cadastro">
                  <Button size="sm">Criar conta</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-moss-700/70 bg-moss-800/40 px-2.5 py-1 text-xs font-medium text-moss-200">
            <Gamepad2 className="h-3.5 w-3.5" aria-hidden />
            LevelUp
          </p>
          <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Sua biblioteca é o registro da sua história como jogador.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Organize os jogos que você quer jogar, está jogando e já zerou.
            Registre horas, notas e datas de conclusão — e veja sua trajetória
            tomar forma.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={user ? "/dashboard" : "/cadastro"}>
              <Button size="lg" className="w-full sm:w-auto">
                {user ? "Abrir minha biblioteca" : "Começar minha biblioteca"}
              </Button>
            </Link>
            {!user && (
              <Link to="/login">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Já tenho conta
                </Button>
              </Link>
            )}
          </div>
        </section>

        <section className="border-t border-base-700 bg-base-850/40">
          <div className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-14 sm:grid-cols-3 sm:px-6">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-xl border border-base-700 bg-base-850 p-5"
              >
                <Icon className="h-5 w-5 text-moss-400" aria-hidden />
                <h2 className="mt-3.5 text-sm font-semibold text-ink">{title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-base-700">
        <div className="mx-auto w-full max-w-5xl px-4 py-7 text-xs text-ink-faint sm:px-6">
          LevelUp — plataforma pessoal para organizar bibliotecas de jogos.
        </div>
      </footer>
    </div>
  );
}
