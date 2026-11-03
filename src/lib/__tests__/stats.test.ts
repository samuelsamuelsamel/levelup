import { describe, expect, it } from "vitest";
import { computeStats } from "@/lib/stats";
import type { Game, GameStatus } from "@/lib/types";

function game(partial: Partial<Game> & { name: string }): Game {
  return {
    id: crypto.randomUUID(),
    user_id: "user-1",
    platform: null,
    status: "wishlist" as GameStatus,
    hours_played: 0,
    rating: null,
    completed_at: null,
    cover_url: null,
    notes: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("computeStats", () => {
  it("devolve tudo zerado para uma biblioteca vazia", () => {
    const stats = computeStats([]);
    expect(stats.total).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.totalHours).toBe(0);
    expect(stats.averageRating).toBeNull();
    expect(stats.platforms).toEqual([]);
  });

  it("conta jogos por status", () => {
    const stats = computeStats([
      game({ name: "A", status: "completed" }),
      game({ name: "B", status: "completed" }),
      game({ name: "C", status: "playing" }),
      game({ name: "D", status: "paused" }),
      game({ name: "E", status: "abandoned" }),
      game({ name: "F", status: "wishlist" }),
    ]);
    expect(stats.total).toBe(6);
    expect(stats.completed).toBe(2);
    expect(stats.playing).toBe(1);
    expect(stats.paused).toBe(1);
    expect(stats.abandoned).toBe(1);
    expect(stats.wishlist).toBe(1);
  });

  it("soma horas com decimais sem acumular erro de ponto flutuante", () => {
    const stats = computeStats([
      game({ name: "A", hours_played: 10.1 }),
      game({ name: "B", hours_played: 0.2 }),
      game({ name: "C", hours_played: 5.7 }),
    ]);
    expect(stats.totalHours).toBe(16);
  });

  it("calcula a média apenas dos jogos avaliados", () => {
    const stats = computeStats([
      game({ name: "A", rating: 5 }),
      game({ name: "B", rating: 4 }),
      game({ name: "C", rating: null }),
    ]);
    expect(stats.ratedCount).toBe(2);
    expect(stats.averageRating).toBe(4.5);
  });

  it("agrupa plataformas e usa rótulo para quem não informou", () => {
    const stats = computeStats([
      game({ name: "A", platform: "PC" }),
      game({ name: "B", platform: "PC" }),
      game({ name: "C", platform: "Switch" }),
      game({ name: "D", platform: "  " }),
      game({ name: "E", platform: null }),
    ]);
    expect(stats.platforms).toEqual([
      { platform: "PC", count: 2 },
      { platform: "Sem plataforma", count: 2 },
      { platform: "Switch", count: 1 },
    ]);
  });

  it("tolera horas vindas do banco como string numérica", () => {
    const stats = computeStats([
      game({ name: "A", hours_played: "12.5" as unknown as number }),
    ]);
    expect(stats.totalHours).toBe(12.5);
  });
});
