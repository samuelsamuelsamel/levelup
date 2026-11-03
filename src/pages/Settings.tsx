import { useState } from "react";
import { Download, KeyRound, LogOut, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLibrary } from "@/contexts/GamesContext";
import { validatePassword } from "@/lib/validation";
import { STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useToast } from "@/components/ui/Toast";

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-base-700 bg-base-850 p-5">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function Settings() {
  const { user, signOut, updatePassword } = useAuth();
  const { games, deleteGame, reload } = useLibrary();
  const navigate = useNavigate();
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{
    password?: string;
    confirm?: string;
  }>({});
  const [savingPassword, setSavingPassword] = useState(false);

  const [wipeOpen, setWipeOpen] = useState(false);
  const [wiping, setWiping] = useState(false);

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = {
      password: validatePassword(password) ?? undefined,
      confirm: confirm === password ? undefined : "As senhas não coincidem.",
    };
    if (nextErrors.password || nextErrors.confirm) {
      setPasswordErrors(nextErrors);
      return;
    }
    setPasswordErrors({});

    setSavingPassword(true);
    const { error } = await updatePassword(password);
    setSavingPassword(false);

    if (error) {
      toast.error(error);
      return;
    }
    setPassword("");
    setConfirm("");
    toast.success("Senha atualizada.");
  };

  /** Exporta a biblioteca do próprio usuário como JSON, sem servidor. */
  const handleExport = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      account: user?.email,
      total: games.length,
      games: games.map((game) => ({
        nome: game.name,
        plataforma: game.platform,
        status: STATUS_LABELS[game.status],
        horas_jogadas: Number(game.hours_played),
        avaliacao: game.rating,
        data_conclusao: game.completed_at,
        capa: game.cover_url,
        anotacoes: game.notes,
        criado_em: game.created_at,
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `levelup-biblioteca-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Arquivo gerado.");
  };

  const handleWipe = async () => {
    setWiping(true);
    const results = await Promise.all(games.map((game) => deleteGame(game.id)));
    setWiping(false);
    setWipeOpen(false);

    const failed = results.filter((result) => result.error).length;
    if (failed > 0) {
      toast.error(`${failed} registro(s) não puderam ser excluídos.`);
      await reload();
      return;
    }
    toast.success("Biblioteca esvaziada.");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <SectionHeader
        title="Configurações"
        description="Apenas opções que já funcionam nesta versão."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Alterar senha"
          description="Defina uma nova senha para entrar na sua conta. Mínimo de 8 caracteres, com letras e números."
        >
          <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
            <Field
              label="Nova senha"
              htmlFor="settings-password"
              error={passwordErrors.password}
              required
            >
              <Input
                id="settings-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setPasswordErrors((current) => ({ ...current, password: undefined }));
                }}
                placeholder="••••••••"
                invalid={Boolean(passwordErrors.password)}
              />
            </Field>
            <Field
              label="Confirmar nova senha"
              htmlFor="settings-confirm"
              error={passwordErrors.confirm}
              required
            >
              <Input
                id="settings-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => {
                  setConfirm(event.target.value);
                  setPasswordErrors((current) => ({ ...current, confirm: undefined }));
                }}
                placeholder="••••••••"
                invalid={Boolean(passwordErrors.confirm)}
              />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" loading={savingPassword}>
                <KeyRound className="h-4 w-4" aria-hidden />
                Atualizar senha
              </Button>
            </div>
          </form>
        </Card>

        <Card
          title="Exportar biblioteca"
          description="Baixe um arquivo JSON com todos os seus registros. Útil como cópia de segurança."
        >
          <Button variant="secondary" onClick={handleExport} disabled={games.length === 0}>
            <Download className="h-4 w-4" aria-hidden />
            Baixar {games.length} registro(s)
          </Button>
          {games.length === 0 && (
            <p className="mt-2 text-xs text-ink-faint">
              Sua biblioteca está vazia — não há nada para exportar.
            </p>
          )}
        </Card>

        <Card
          title="Sessão"
          description="Encerrar a sessão neste navegador. Seus dados continuam salvos no banco de dados."
        >
          <Button variant="secondary" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" aria-hidden />
            Sair da conta
          </Button>
        </Card>

        <Card
          title="Esvaziar biblioteca"
          description="Remove todos os jogos cadastrados nesta conta. Sua conta e seu perfil permanecem. Essa ação não pode ser desfeita."
        >
          <Button
            variant="danger"
            onClick={() => setWipeOpen(true)}
            disabled={games.length === 0}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Excluir todos os jogos
          </Button>
          {games.length === 0 && (
            <p className="mt-2 text-xs text-ink-faint">
              Nada para excluir no momento.
            </p>
          )}
        </Card>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-faint">
        A exclusão definitiva da conta precisa ser feita no painel do Supabase
        (Authentication → Users) ou por uma Edge Function com privilégios de
        administrador, que ainda não faz parte desta versão. Ao excluir o
        usuário lá, o perfil e todos os jogos são removidos em cascata.
      </p>

      <ConfirmDialog
        open={wipeOpen}
        title="Excluir todos os jogos"
        description={`Os ${games.length} registros da sua biblioteca serão apagados permanentemente. Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir tudo"
        loading={wiping}
        onConfirm={handleWipe}
        onCancel={() => setWipeOpen(false)}
      />
    </>
  );
}
