import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useLibrary } from "@/contexts/GamesContext";
import { useLibraryStats } from "@/hooks/useGames";
import { PLATFORM_SUGGESTIONS } from "@/lib/constants";
import { validateDisplayName } from "@/lib/validation";
import { formatHours, initials } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PageLoader } from "@/components/ui/Spinner";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useToast } from "@/components/ui/Toast";

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { games } = useLibrary();
  const stats = useLibraryStats(games);
  const toast = useToast();

  const [displayName, setDisplayName] = useState("");
  const [favoritePlatform, setFavoritePlatform] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<{ displayName?: string; bio?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? "");
    setFavoritePlatform(profile.favorite_platform ?? "");
    setBio(profile.bio ?? "");
  }, [profile]);

  if (loading) return <PageLoader label="Carregando seu perfil..." />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors = {
      displayName: validateDisplayName(displayName) ?? undefined,
      bio: bio.length > 280 ? "Use no máximo 280 caracteres." : undefined,
    };
    if (nextErrors.displayName || nextErrors.bio) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    setSaving(true);
    const { error } = await updateProfile({
      display_name: displayName,
      favorite_platform: favoritePlatform,
      bio,
    });
    setSaving(false);

    if (error) toast.error("Não foi possível salvar o perfil.");
    else toast.success("Perfil atualizado.");
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <>
      <SectionHeader
        title="Meu perfil"
        description="Informações básicas da sua conta."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-base-700 bg-base-850 p-5 lg:col-span-1">
          <div className="flex items-center gap-3.5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-moss-700 bg-moss-800/60 text-lg font-semibold text-moss-200">
              {initials(profile?.display_name || user?.email)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {profile?.display_name || "Jogador"}
              </p>
              <p className="truncate text-xs text-ink-faint">{user?.email}</p>
            </div>
          </div>

          {profile?.bio && (
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              {profile.bio}
            </p>
          )}

          <dl className="mt-5 space-y-2.5 border-t border-base-700 pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Na plataforma desde</dt>
              <dd className="text-ink">{memberSince}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Jogos cadastrados</dt>
              <dd className="tabular-nums text-ink">{stats.total}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Jogos zerados</dt>
              <dd className="tabular-nums text-ink">{stats.completed}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Horas registradas</dt>
              <dd className="tabular-nums text-ink">
                {formatHours(stats.totalHours)}
              </dd>
            </div>
            {profile?.favorite_platform && (
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Plataforma favorita</dt>
                <dd className="truncate text-ink">{profile.favorite_platform}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-xl border border-base-700 bg-base-850 p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-ink">Editar informações</h2>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field
              label="Nome de exibição"
              htmlFor="profile-name"
              error={errors.displayName}
              required
            >
              <Input
                id="profile-name"
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setErrors((current) => ({ ...current, displayName: undefined }));
                }}
                maxLength={60}
                invalid={Boolean(errors.displayName)}
              />
            </Field>

            <Field label="Plataforma favorita" htmlFor="profile-platform">
              <Input
                id="profile-platform"
                list="platform-suggestions-profile"
                value={favoritePlatform}
                onChange={(event) => setFavoritePlatform(event.target.value)}
                placeholder="PC, PlayStation 5, Switch..."
                maxLength={60}
              />
              <datalist id="platform-suggestions-profile">
                {PLATFORM_SUGGESTIONS.map((platform) => (
                  <option key={platform} value={platform} />
                ))}
              </datalist>
            </Field>

            <Field
              label="Sobre você"
              htmlFor="profile-bio"
              error={errors.bio}
              hint={`${bio.length}/280`}
            >
              <Textarea
                id="profile-bio"
                value={bio}
                onChange={(event) => {
                  setBio(event.target.value);
                  setErrors((current) => ({ ...current, bio: undefined }));
                }}
                maxLength={280}
                placeholder="Que tipo de jogo marcou sua história?"
                invalid={Boolean(errors.bio)}
              />
            </Field>

            <div className="flex justify-end pt-1">
              <Button type="submit" loading={saving}>
                <Save className="h-4 w-4" aria-hidden />
                Salvar alterações
              </Button>
            </div>
          </form>

          <div className="mt-6 border-t border-base-700 pt-5">
            <Field label="E-mail da conta" htmlFor="profile-email">
              <Input id="profile-email" value={user?.email ?? ""} disabled readOnly />
            </Field>
            <p className="mt-1.5 text-xs text-ink-faint">
              O e-mail é usado para entrar e não pode ser alterado por aqui.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
