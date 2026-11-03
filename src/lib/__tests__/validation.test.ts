import { describe, expect, it } from "vitest";
import {
  hasErrors,
  validateDisplayName,
  validateEmail,
  validateGameInput,
  validatePassword,
} from "@/lib/validation";
import type { GameInput } from "@/lib/types";

const VALID: GameInput = {
  name: "Hollow Knight",
  platform: "PC",
  status: "completed",
  hours_played: 42.5,
  rating: 5,
  completed_at: "2026-03-10",
  cover_url: "https://exemplo.com/capa.png",
  notes: "Ótimo jogo.",
};

describe("validateEmail", () => {
  it("aceita e-mails válidos", () => {
    expect(validateEmail("jogador@exemplo.com")).toBeNull();
    expect(validateEmail("  jogador@exemplo.com.br  ")).toBeNull();
  });

  it("recusa vazio e formatos inválidos", () => {
    expect(validateEmail("")).toBe("Informe seu e-mail.");
    expect(validateEmail("jogador")).toBeTruthy();
    expect(validateEmail("jogador@")).toBeTruthy();
    expect(validateEmail("jogador@exemplo")).toBeTruthy();
    expect(validateEmail("a b@exemplo.com")).toBeTruthy();
  });
});

describe("validatePassword", () => {
  it("aceita senha com letras e números e 8+ caracteres", () => {
    expect(validatePassword("levelup2026")).toBeNull();
  });

  it("recusa senha curta ou sem número/letra", () => {
    expect(validatePassword("")).toBeTruthy();
    expect(validatePassword("abc123")).toBe(
      "A senha deve ter pelo menos 8 caracteres.",
    );
    expect(validatePassword("somenteletras")).toBeTruthy();
    expect(validatePassword("12345678")).toBeTruthy();
  });
});

describe("validateDisplayName", () => {
  it("aceita nomes entre 2 e 60 caracteres", () => {
    expect(validateDisplayName("Lu")).toBeNull();
    expect(validateDisplayName("a".repeat(60))).toBeNull();
  });

  it("recusa vazio, 1 caractere e acima de 60", () => {
    expect(validateDisplayName("  ")).toBeTruthy();
    expect(validateDisplayName("L")).toBeTruthy();
    expect(validateDisplayName("a".repeat(61))).toBeTruthy();
  });
});

describe("validateGameInput", () => {
  it("aceita um registro completo e válido", () => {
    expect(hasErrors(validateGameInput(VALID))).toBe(false);
  });

  it("aceita o mínimo: apenas o nome", () => {
    const errors = validateGameInput({
      name: "Celeste",
      platform: "",
      status: "wishlist",
      hours_played: 0,
      rating: null,
      completed_at: null,
      cover_url: "",
      notes: "",
    });
    expect(hasErrors(errors)).toBe(false);
  });

  it("exige o nome", () => {
    expect(validateGameInput({ ...VALID, name: "   " }).name).toBe(
      "Informe o nome do jogo.",
    );
  });

  it("limita o tamanho do nome e da plataforma", () => {
    expect(validateGameInput({ ...VALID, name: "a".repeat(121) }).name).toBeTruthy();
    expect(
      validateGameInput({ ...VALID, platform: "a".repeat(61) }).platform,
    ).toBeTruthy();
  });

  it("recusa horas negativas e valores absurdos", () => {
    expect(validateGameInput({ ...VALID, hours_played: -1 }).hours_played).toBeTruthy();
    expect(
      validateGameInput({ ...VALID, hours_played: 100000 }).hours_played,
    ).toBeTruthy();
    expect(
      validateGameInput({ ...VALID, hours_played: Number.NaN }).hours_played,
    ).toBeTruthy();
  });

  it("aceita avaliação de 1 a 5 ou nenhuma", () => {
    expect(validateGameInput({ ...VALID, rating: 1 }).rating).toBeUndefined();
    expect(validateGameInput({ ...VALID, rating: null }).rating).toBeUndefined();
    expect(validateGameInput({ ...VALID, rating: 0 }).rating).toBeTruthy();
    expect(validateGameInput({ ...VALID, rating: 6 }).rating).toBeTruthy();
    expect(validateGameInput({ ...VALID, rating: 3.5 }).rating).toBeTruthy();
  });

  it("recusa status fora da lista", () => {
    expect(
      validateGameInput({
        ...VALID,
        status: "zerado" as GameInput["status"],
      }).status,
    ).toBeTruthy();
  });

  it("recusa data inválida ou no futuro", () => {
    expect(validateGameInput({ ...VALID, completed_at: "10/03/2026" }).completed_at).toBeTruthy();
    expect(
      validateGameInput({ ...VALID, completed_at: "2099-01-01" }).completed_at,
    ).toBe("A data não pode estar no futuro.");
  });

  it("exige https na capa", () => {
    expect(
      validateGameInput({ ...VALID, cover_url: "http://exemplo.com/c.png" })
        .cover_url,
    ).toBeTruthy();
    expect(
      validateGameInput({ ...VALID, cover_url: "javascript:alert(1)" }).cover_url,
    ).toBeTruthy();
    expect(validateGameInput({ ...VALID, cover_url: "" }).cover_url).toBeUndefined();
  });

  it("limita as anotações a 1000 caracteres", () => {
    expect(validateGameInput({ ...VALID, notes: "a".repeat(1001) }).notes).toBeTruthy();
    expect(validateGameInput({ ...VALID, notes: "a".repeat(1000) }).notes).toBeUndefined();
  });
});
