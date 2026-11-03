import type { GameInput, GameStatus } from "@/lib/types";
import { GAME_STATUSES } from "@/lib/constants";

export type Errors<T> = Partial<Record<keyof T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return "Informe seu e-mail.";
  if (!EMAIL_RE.test(value)) return "Informe um e-mail válido.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Informe uma senha.";
  if (password.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
    return "Use pelo menos uma letra e um número.";
  return null;
}

export function validateDisplayName(name: string): string | null {
  const value = name.trim();
  if (!value) return "Informe como quer ser chamado.";
  if (value.length < 2) return "Use pelo menos 2 caracteres.";
  if (value.length > 60) return "Use no máximo 60 caracteres.";
  return null;
}

/** Espelha as constraints do banco, para o erro aparecer antes do request. */
export function validateGameInput(input: GameInput): Errors<GameInput> {
  const errors: Errors<GameInput> = {};

  const name = input.name.trim();
  if (!name) errors.name = "Informe o nome do jogo.";
  else if (name.length > 120) errors.name = "Use no máximo 120 caracteres.";

  if (input.platform && input.platform.length > 60)
    errors.platform = "Use no máximo 60 caracteres.";

  const validStatuses = GAME_STATUSES.map((status) => status.value) as GameStatus[];
  if (!validStatuses.includes(input.status)) errors.status = "Status inválido.";

  if (!Number.isFinite(input.hours_played) || input.hours_played < 0)
    errors.hours_played = "Informe um número de horas válido.";
  else if (input.hours_played > 99999)
    errors.hours_played = "Valor muito alto.";

  if (
    input.rating !== null &&
    (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5)
  )
    errors.rating = "A avaliação vai de 1 a 5.";

  if (input.completed_at) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.completed_at))
      errors.completed_at = "Data inválida.";
    else if (input.completed_at > new Date().toISOString().slice(0, 10))
      errors.completed_at = "A data não pode estar no futuro.";
  }

  if (input.cover_url) {
    if (!/^https:\/\/\S+$/i.test(input.cover_url))
      errors.cover_url = "Use um endereço que comece com https://";
  }

  if (input.notes && input.notes.length > 1000)
    errors.notes = "Use no máximo 1000 caracteres.";

  return errors;
}

export function hasErrors<T>(errors: Errors<T>): boolean {
  return Object.values(errors).some(Boolean);
}
