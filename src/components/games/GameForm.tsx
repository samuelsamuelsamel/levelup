import { useEffect, useState } from "react";
import type { Game, GameInput, GameStatus } from "@/lib/types";
import { GAME_STATUSES, PLATFORM_SUGGESTIONS } from "@/lib/constants";
import { hasErrors, validateGameInput, type Errors } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { RatingInput } from "@/components/games/RatingStars";
import { GameCover } from "@/components/games/GameCover";

const EMPTY: GameInput = {
  name: "",
  platform: "",
  status: "wishlist",
  hours_played: 0,
  rating: null,
  completed_at: null,
  cover_url: "",
  notes: "",
};

function fromGame(game: Game): GameInput {
  return {
    name: game.name,
    platform: game.platform ?? "",
    status: game.status,
    hours_played: Number(game.hours_played) || 0,
    rating: game.rating,
    completed_at: game.completed_at,
    cover_url: game.cover_url ?? "",
    notes: game.notes ?? "",
  };
}

export function GameForm({
  game,
  onSubmit,
  onCancel,
}: {
  game?: Game | null;
  onSubmit: (input: GameInput) => Promise<{ error: string | null }>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<GameInput>(game ? fromGame(game) : EMPTY);
  const [errors, setErrors] = useState<Errors<GameInput>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hoursText, setHoursText] = useState(
    game ? String(Number(game.hours_played) || 0) : "0",
  );

  useEffect(() => {
    setValues(game ? fromGame(game) : EMPTY);
    setHoursText(game ? String(Number(game.hours_played) || 0) : "0");
    setErrors({});
    setFormError(null);
  }, [game]);

  const set = <K extends keyof GameInput>(key: K, value: GameInput[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleStatusChange = (status: GameStatus) => {
    setValues((current) => ({
      ...current,
      status,
      // Ao marcar como zerado, sugere hoje; ao sair de zerado, limpa a data.
      completed_at:
        status === "completed"
          ? (current.completed_at ?? new Date().toISOString().slice(0, 10))
          : null,
    }));
    setErrors((current) => ({ ...current, status: undefined, completed_at: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const parsedHours = hoursText.trim() === "" ? 0 : Number(hoursText.replace(",", "."));
    const candidate: GameInput = { ...values, hours_played: parsedHours };

    const nextErrors = validateGameInput(candidate);
    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    const { error } = await onSubmit(candidate);
    setSaving(false);
    if (error) setFormError(error);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field label="Nome do jogo" htmlFor="game-name" error={errors.name} required>
        <Input
          id="game-name"
          value={values.name}
          onChange={(event) => set("name", event.target.value)}
          placeholder="Hollow Knight"
          maxLength={120}
          invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "game-name-error" : undefined}
          autoFocus
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Plataforma" htmlFor="game-platform" error={errors.platform}>
          <Input
            id="game-platform"
            list="platform-suggestions"
            value={values.platform ?? ""}
            onChange={(event) => set("platform", event.target.value)}
            placeholder="PC, PlayStation 5, Switch..."
            maxLength={60}
            invalid={Boolean(errors.platform)}
          />
          <datalist id="platform-suggestions">
            {PLATFORM_SUGGESTIONS.map((platform) => (
              <option key={platform} value={platform} />
            ))}
          </datalist>
        </Field>

        <Field label="Status" htmlFor="game-status" error={errors.status} required>
          <Select
            id="game-status"
            value={values.status}
            onChange={(event) => handleStatusChange(event.target.value as GameStatus)}
            invalid={Boolean(errors.status)}
          >
            {GAME_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Horas jogadas"
          htmlFor="game-hours"
          error={errors.hours_played}
          hint="Aceita decimais: 12.5 equivale a 12h30"
        >
          <Input
            id="game-hours"
            type="number"
            inputMode="decimal"
            min={0}
            max={99999}
            step={0.5}
            value={hoursText}
            onChange={(event) => {
              setHoursText(event.target.value);
              setErrors((current) => ({ ...current, hours_played: undefined }));
            }}
            invalid={Boolean(errors.hours_played)}
          />
        </Field>

        {values.status === "completed" ? (
          <Field
            label="Data de conclusão"
            htmlFor="game-completed"
            error={errors.completed_at}
          >
            <Input
              id="game-completed"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={values.completed_at ?? ""}
              onChange={(event) => set("completed_at", event.target.value || null)}
              invalid={Boolean(errors.completed_at)}
            />
          </Field>
        ) : (
          <Field
            label="Data de conclusão"
            htmlFor="game-completed-disabled"
            hint="Disponível para jogos com status Zerado"
          >
            <Input id="game-completed-disabled" type="date" disabled value="" />
          </Field>
        )}
      </div>

      <Field label="Avaliação pessoal" htmlFor="game-rating" error={errors.rating}>
        <RatingInput
          id="game-rating"
          value={values.rating}
          onChange={(rating) => set("rating", rating)}
        />
      </Field>

      <Field
        label="Capa (URL)"
        htmlFor="game-cover"
        error={errors.cover_url}
        hint="Opcional. Sem capa, usamos um substituto do tema."
      >
        <div className="flex gap-3">
          <Input
            id="game-cover"
            type="url"
            value={values.cover_url ?? ""}
            onChange={(event) => set("cover_url", event.target.value)}
            placeholder="https://..."
            invalid={Boolean(errors.cover_url)}
          />
          <GameCover
            url={values.cover_url?.trim() ? values.cover_url : null}
            name={values.name || "Prévia"}
            className="h-10 w-10 shrink-0"
          />
        </div>
      </Field>

      <Field
        label="Anotações"
        htmlFor="game-notes"
        error={errors.notes}
        hint={`${(values.notes ?? "").length}/1000`}
      >
        <Textarea
          id="game-notes"
          value={values.notes ?? ""}
          onChange={(event) => set("notes", event.target.value)}
          maxLength={1000}
          placeholder="O que marcou essa partida?"
          invalid={Boolean(errors.notes)}
        />
      </Field>

      {formError && (
        <p role="alert" className="rounded-lg border border-red-900/70 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {formError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          {game ? "Salvar alterações" : "Adicionar à biblioteca"}
        </Button>
      </div>
    </form>
  );
}
