import { describe, expect, it } from "vitest";
import { applyQuery, countByStatus, listPlatforms, normalize } from "@/lib/filters";
import type { Game } from "@/lib/types";

function game(partial: Partial<Game> & { name: string }): Game {
  return {
    id: partial.name,
    user_id: "user-1",
    platform: null,
    status: "wishlist",
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

const LIBRARY: Game[] = [
  game({
    name: "Hollow Knight",
    platform: "PC",
    status: "completed",
    hours_played: 42,
    rating: 5,
    completed_at: "2026-03-10",
    created_at: "2026-01-03T00:00:00.000Z",
  }),
  game({
    name: "Elden Ring",
    platform: "PlayStation 5",
    status: "playing",
    hours_played: 90,
    rating: 4,
    created_at: "2026-01-02T00:00:00.000Z",
  }),
  game({
    name: "Celeste",
    platform: "PC",
    status: "wishlist",
    hours_played: 0,
    created_at: "2026-01-01T00:00:00.000Z",
  }),
  game({
    name: "Pokémon Scarlet",
    platform: null,
    status: "paused",
    hours_played: 12,
    rating: 3,
    completed_at: "2026-02-01",
    created_at: "2026-01-04T00:00:00.000Z",
  }),
];

const BASE = { search: "", status: "all", platform: "all", sort: "recent" } as const;

describe("normalize", () => {
  it("ignora acentos e caixa", () => {
    expect(normalize("Pokémon")).toBe("pokemon");
    expect(normalize("  CELESTE ")).toBe("celeste");
  });
});

describe("applyQuery — busca", () => {
  it("encontra por parte do nome", () => {
    const result = applyQuery(LIBRARY, { ...BASE, search: "ring" });
    expect(result.map((item) => item.name)).toEqual(["Elden Ring"]);
  });

  it("encontra mesmo sem o acento digitado", () => {
    const result = applyQuery(LIBRARY, { ...BASE, search: "pokemon" });
    expect(result.map((item) => item.name)).toEqual(["Pokémon Scarlet"]);
  });

  it("devolve lista vazia quando nada corresponde", () => {
    expect(applyQuery(LIBRARY, { ...BASE, search: "zelda" })).toEqual([]);
  });
});

describe("applyQuery — filtros", () => {
  it("filtra por status", () => {
    const result = applyQuery(LIBRARY, { ...BASE, status: "completed" });
    expect(result.map((item) => item.name)).toEqual(["Hollow Knight"]);
  });

  it("filtra por plataforma", () => {
    const result = applyQuery(LIBRARY, { ...BASE, platform: "PC" });
    expect(result.map((item) => item.name)).toEqual(["Hollow Knight", "Celeste"]);
  });

  it("agrupa quem não tem plataforma informada", () => {
    const result = applyQuery(LIBRARY, { ...BASE, platform: "Sem plataforma" });
    expect(result.map((item) => item.name)).toEqual(["Pokémon Scarlet"]);
  });

  it("combina busca, status e plataforma", () => {
    const result = applyQuery(LIBRARY, {
      ...BASE,
      search: "e",
      status: "wishlist",
      platform: "PC",
    });
    expect(result.map((item) => item.name)).toEqual(["Celeste"]);
  });
});

describe("applyQuery — ordenação", () => {
  it("ordena por adição mais recente por padrão", () => {
    const result = applyQuery(LIBRARY, BASE);
    expect(result.map((item) => item.name)).toEqual([
      "Pokémon Scarlet",
      "Hollow Knight",
      "Elden Ring",
      "Celeste",
    ]);
  });

  it("ordena por nome respeitando o português", () => {
    const result = applyQuery(LIBRARY, { ...BASE, sort: "name" });
    expect(result.map((item) => item.name)).toEqual([
      "Celeste",
      "Elden Ring",
      "Hollow Knight",
      "Pokémon Scarlet",
    ]);
  });

  it("ordena por horas jogadas", () => {
    const result = applyQuery(LIBRARY, { ...BASE, sort: "hours" });
    expect(result.map((item) => item.hours_played)).toEqual([90, 42, 12, 0]);
  });

  it("ordena por avaliação, deixando os sem nota no fim", () => {
    const result = applyQuery(LIBRARY, { ...BASE, sort: "rating" });
    expect(result.map((item) => item.rating)).toEqual([5, 4, 3, null]);
  });

  it("ordena por conclusão mais recente", () => {
    const result = applyQuery(LIBRARY, { ...BASE, sort: "completed" });
    expect(result.slice(0, 2).map((item) => item.name)).toEqual([
      "Hollow Knight",
      "Pokémon Scarlet",
    ]);
  });

  it("não altera o array original", () => {
    const snapshot = LIBRARY.map((item) => item.name);
    applyQuery(LIBRARY, { ...BASE, sort: "name" });
    expect(LIBRARY.map((item) => item.name)).toEqual(snapshot);
  });
});

describe("contagens e plataformas", () => {
  it("conta por status incluindo o total", () => {
    expect(countByStatus(LIBRARY)).toEqual({
      all: 4,
      wishlist: 1,
      playing: 1,
      paused: 1,
      abandoned: 0,
      completed: 1,
    });
  });

  it("lista plataformas sem repetir, em ordem alfabética", () => {
    expect(listPlatforms(LIBRARY)).toEqual([
      "PC",
      "PlayStation 5",
      "Sem plataforma",
    ]);
  });
});
