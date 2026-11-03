import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata horas registradas: 0 → "0h", 12.5 → "12h30" */
export function formatHours(hours: number | null | undefined): string {
  const value = Number(hours ?? 0);
  if (!Number.isFinite(value) || value <= 0) return "0h";
  const whole = Math.floor(value);
  const minutes = Math.round((value - whole) * 60);
  if (minutes === 0) return `${whole}h`;
  return `${whole}h${String(minutes).padStart(2, "0")}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "—";
  return `${day}/${month}/${year}`;
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
