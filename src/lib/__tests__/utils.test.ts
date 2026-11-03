import { describe, expect, it } from "vitest";
import { formatDate, formatHours, initials } from "@/lib/utils";

describe("formatHours", () => {
  it("formata horas inteiras e com minutos", () => {
    expect(formatHours(0)).toBe("0h");
    expect(formatHours(12)).toBe("12h");
    expect(formatHours(12.5)).toBe("12h30");
    expect(formatHours(1.25)).toBe("1h15");
  });

  it("trata valores ausentes ou inválidos como zero", () => {
    expect(formatHours(null)).toBe("0h");
    expect(formatHours(undefined)).toBe("0h");
    expect(formatHours(-3)).toBe("0h");
    expect(formatHours(Number.NaN)).toBe("0h");
  });
});

describe("formatDate", () => {
  it("converte a data do banco para o formato brasileiro", () => {
    expect(formatDate("2026-03-10")).toBe("10/03/2026");
  });

  it("usa travessão quando não há data", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("")).toBe("—");
    expect(formatDate("invalido")).toBe("—");
  });
});

describe("initials", () => {
  it("usa até duas iniciais", () => {
    expect(initials("Lucas Passos")).toBe("LP");
    expect(initials("lucas")).toBe("L");
    expect(initials("Ana Maria Souza")).toBe("AM");
  });

  it("tem um substituto para nome ausente", () => {
    expect(initials(null)).toBe("?");
    expect(initials("")).toBe("?");
  });
});
