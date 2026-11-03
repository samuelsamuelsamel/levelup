/**
 * LevelUp — testes de fumaça no navegador (Playwright).
 *
 * Cobre o que não depende de um Supabase real: navegação, proteção de rotas,
 * validação de formulários, estados visuais e responsividade.
 *
 * Como rodar:
 *   npm run build
 *   npx vite preview --port 4173 &
 *   node e2e/smoke.mjs
 *
 * Requer o Playwright disponível no ambiente (`npm i -D playwright`
 * se ainda não estiver instalado).
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:4173";
const results = [];
let failures = 0;

function check(label, condition, detail = "") {
  if (condition) {
    results.push(`PASS  ${label}`);
  } else {
    failures += 1;
    results.push(`FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

const browser = await chromium.launch({ args: ["--no-sandbox"] });

// ---------------------------------------------------------------- desktop
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await desktop.newPage();

const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(String(error)));

// 1. Landing
await page.goto(BASE, { waitUntil: "networkidle" });
check(
  "01 landing exibe o conceito do projeto",
  (await page.locator("h1").first().innerText()).includes("história como jogador"),
);
check(
  "02 landing mostra os caminhos de entrada e cadastro",
  (await page.getByRole("link", { name: "Entrar" }).count()) > 0 &&
    (await page.getByRole("link", { name: "Criar conta" }).count()) > 0,
);
const bodyBg = await page.evaluate(() =>
  getComputedStyle(document.body).backgroundColor,
);
check("03 fundo escuro aplicado", bodyBg === "rgb(21, 24, 23)", bodyBg);

// 2. Proteção de rotas privadas
for (const route of [
  "/dashboard",
  "/biblioteca",
  "/estatisticas",
  "/perfil",
  "/configuracoes",
]) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
  check(
    `04 rota privada ${route} redireciona para /login sem sessão`,
    new URL(page.url()).pathname === "/login",
    page.url(),
  );
}

// 3. Rotas em inglês redirecionam para as oficiais
await page.goto(`${BASE}/register`, { waitUntil: "networkidle" });
check(
  "05 /register redireciona para /cadastro",
  new URL(page.url()).pathname === "/cadastro",
  page.url(),
);

// 4. 404
await page.goto(`${BASE}/rota-que-nao-existe`, { waitUntil: "networkidle" });
check(
  "06 rota inexistente mostra a página 404",
  (await page.getByText("Página não encontrada").count()) === 1,
);

// 5. Validação do login
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Entrar" }).click();
check(
  "07 login vazio mostra erros de e-mail e senha",
  (await page.getByText("Informe seu e-mail.").count()) === 1 &&
    (await page.getByText("Informe sua senha.").count()) === 1,
);

await page.fill("#login-email", "nao-e-email");
await page.fill("#login-password", "qualquer");
await page.getByRole("button", { name: "Entrar" }).click();
check(
  "08 login recusa e-mail em formato inválido",
  (await page.getByText("Informe um e-mail válido.").count()) === 1,
);

// 6. Validação do cadastro
await page.goto(`${BASE}/cadastro`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Criar minha conta" }).click();
check(
  "09 cadastro vazio aponta todos os campos obrigatórios",
  (await page.getByText("Informe como quer ser chamado.").count()) === 1 &&
    (await page.getByText("Informe seu e-mail.").count()) === 1 &&
    (await page.getByText("Informe uma senha.").count()) === 1,
);

await page.fill("#register-name", "Jogador Teste");
await page.fill("#register-email", "jogador@exemplo.com");
await page.fill("#register-password", "curta1");
await page.fill("#register-confirm", "curta1");
await page.getByRole("button", { name: "Criar minha conta" }).click();
check(
  "10 cadastro exige senha com 8+ caracteres",
  (await page.getByText("A senha deve ter pelo menos 8 caracteres.").count()) === 1,
);

await page.fill("#register-password", "levelup2026");
await page.fill("#register-confirm", "levelup2027");
await page.getByRole("button", { name: "Criar minha conta" }).click();
check(
  "11 cadastro detecta senhas diferentes",
  (await page.getByText("As senhas não coincidem.").count()) === 1,
);

// 7. Acessibilidade básica dos formulários
const labelled = await page.evaluate(() => {
  const fields = [...document.querySelectorAll("input")];
  return fields.every((field) => {
    if (!field.id) return false;
    return Boolean(document.querySelector(`label[for="${field.id}"]`));
  });
});
check("12 todos os campos do cadastro têm label associado", labelled);

// 8. Navegação por teclado
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.keyboard.press("Tab");
await page.keyboard.press("Tab");
const focusedId = await page.evaluate(() => document.activeElement?.id ?? "");
check(
  "13 navegação por Tab alcança o campo de e-mail",
  focusedId === "login-email",
  focusedId,
);

// 9. Links internos da landing
await page.goto(BASE, { waitUntil: "networkidle" });
await page.getByRole("link", { name: "Criar conta" }).click();
await page.waitForURL(/\/cadastro/);
check("14 botão Criar conta navega para /cadastro", page.url().endsWith("/cadastro"));
await page.getByRole("link", { name: "Entrar" }).click();
await page.waitForURL(/\/login/);
check("15 link Entrar navega para /login", page.url().endsWith("/login"));

// ------------------------------------------------------------ responsivo
const viewports = [
  { label: "celular 390x844", width: 390, height: 844 },
  { label: "tablet 820x1180", width: 820, height: 1180 },
  { label: "desktop 1440x900", width: 1440, height: 900 },
];

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  });
  const responsivePage = await context.newPage();
  for (const route of ["/", "/login", "/cadastro"]) {
    await responsivePage.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    const overflow = await responsivePage.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    check(
      `16 ${route} sem rolagem horizontal em ${viewport.label}`,
      overflow <= 1,
      `overflow=${overflow}px`,
    );
  }
  await responsivePage.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  const button = await responsivePage
    .getByRole("button", { name: "Entrar" })
    .boundingBox();
  check(
    `17 botão principal com área de toque adequada em ${viewport.label}`,
    Boolean(button) && button.height >= 40,
    `altura=${button?.height}`,
  );
  await context.close();
}

check(
  "18 nenhum erro de JavaScript no console durante a navegação",
  consoleErrors.length === 0,
  consoleErrors.slice(0, 3).join(" | "),
);

await browser.close();

console.log(results.join("\n"));
console.log(
  `\n${results.length - failures}/${results.length} verificações passaram.`,
);
process.exit(failures > 0 ? 1 : 0);
