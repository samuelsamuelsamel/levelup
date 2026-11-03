/**
 * LevelUp — testes E2E da área autenticada (Playwright).
 *
 * A sessão é semeada no localStorage e as chamadas ao Supabase são
 * interceptadas na camada de rede por um backend simulado que imita o
 * PostgREST. Isso valida a INTERFACE e a lógica do cliente.
 *
 * O banco real, com as políticas de RLS, é testado separadamente contra
 * um Postgres de verdade em supabase/tests/01_rls_test.sql.
 *
 * Como rodar:
 *   npm run build
 *   npx vite preview --port 4173 --host 127.0.0.1 &
 *   node e2e/app.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:4173";
const USER_ID = "11111111-1111-1111-1111-111111111111";
const EMAIL = "jogador@exemplo.com";

const results = [];
let failures = 0;

function check(label, condition, detail = "") {
  if (condition) results.push(`PASS  ${label}`);
  else {
    failures += 1;
    results.push(`FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function b64url(value) {
  return Buffer.from(JSON.stringify(value))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
const accessToken = [
  b64url({ alg: "HS256", typ: "JWT" }),
  b64url({ sub: USER_ID, role: "authenticated", exp: expiresAt, email: EMAIL }),
  "assinatura-simulada",
].join(".");

const user = {
  id: USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: EMAIL,
  email_confirmed_at: "2026-01-01T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: { display_name: "Jogador Teste" },
  identities: [],
};

const session = {
  access_token: accessToken,
  token_type: "bearer",
  expires_in: 86400,
  expires_at: expiresAt,
  refresh_token: "refresh-simulado",
  user,
};

// ------------------------------------------------- backend simulado (estado)
function makeStore(games = []) {
  return {
    games: games.map((game, index) => ({
      id: `game-${index + 1}`,
      user_id: USER_ID,
      name: game.name,
      platform: game.platform ?? null,
      status: game.status ?? "wishlist",
      hours_played: game.hours_played ?? 0,
      rating: game.rating ?? null,
      completed_at: game.completed_at ?? null,
      cover_url: null,
      notes: null,
      created_at: game.created_at ?? `2026-01-0${index + 1}T00:00:00.000Z`,
      updated_at: `2026-01-0${index + 1}T00:00:00.000Z`,
    })),
    profile: {
      id: USER_ID,
      display_name: "Jogador Teste",
      favorite_platform: null,
      bio: null,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    nextId: games.length + 1,
  };
}

/** Lê os filtros no formato do PostgREST: ?id=eq.123 */
function parseEq(url, field) {
  const raw = url.searchParams.get(field);
  if (!raw) return null;
  return raw.startsWith("eq.") ? raw.slice(3) : raw;
}

async function installBackend(context, store) {
  await context.route("**/rest/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const table = url.pathname.split("/rest/v1/")[1]?.split("?")[0];
    const method = request.method();
    const wantsObject = (request.headers()["accept"] ?? "").includes(
      "pgrst.object",
    );

    const respond = (payload, status = 200) =>
      route.fulfill({
        status,
        contentType: wantsObject
          ? "application/vnd.pgrst.object+json"
          : "application/json",
        body: JSON.stringify(wantsObject ? (payload[0] ?? null) : payload),
      });

    if (table === "profiles") {
      if (method === "GET") return respond([store.profile]);
      if (method === "PATCH") {
        const patch = JSON.parse(request.postData() ?? "{}");
        store.profile = {
          ...store.profile,
          ...patch,
          updated_at: new Date().toISOString(),
        };
        return respond([store.profile]);
      }
      if (method === "POST") return respond([store.profile], 201);
    }

    if (table === "games") {
      if (method === "GET") return respond(store.games);

      if (method === "POST") {
        const body = JSON.parse(request.postData() ?? "{}");
        const rows = (Array.isArray(body) ? body : [body]).map((row) => ({
          id: `game-${store.nextId++}`,
          cover_url: null,
          notes: null,
          platform: null,
          rating: null,
          completed_at: null,
          hours_played: 0,
          status: "wishlist",
          ...row,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        // Mais recentes primeiro, como o order(created_at desc) do cliente.
        store.games = [...rows, ...store.games];
        return respond(rows, 201);
      }

      if (method === "PATCH") {
        const id = parseEq(url, "id");
        const patch = JSON.parse(request.postData() ?? "{}");
        const index = store.games.findIndex((game) => game.id === id);
        if (index === -1) return respond([]);
        store.games[index] = {
          ...store.games[index],
          ...patch,
          updated_at: new Date().toISOString(),
        };
        return respond([store.games[index]]);
      }

      if (method === "DELETE") {
        const id = parseEq(url, "id");
        store.games = store.games.filter((game) => game.id !== id);
        return route.fulfill({ status: 204, body: "" });
      }
    }

    return route.fulfill({ status: 404, body: "[]" });
  });

  // Logout e refresh de token
  await context.route("**/auth/v1/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/logout"))
      return route.fulfill({ status: 204, body: "" });
    if (url.pathname.endsWith("/token"))
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(session),
      });
    if (url.pathname.endsWith("/user"))
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(user),
      });
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
}

async function openApp(browser, store, { viewport } = {}) {
  const context = await browser.newContext({
    viewport: viewport ?? { width: 1440, height: 900 },
  });
  await installBackend(context, store);
  // Semeia a sessão uma única vez por contexto: o addInitScript roda em
  // cada navegação e, sem a marca, restauraria a sessão após o logout.
  await context.addInitScript(
    ([key, value]) => {
      if (!window.localStorage.getItem("levelup-e2e-seeded")) {
        window.localStorage.setItem(key, value);
        window.localStorage.setItem("levelup-e2e-seeded", "1");
      }
    },
    ["levelup-auth", JSON.stringify(session)],
  );
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    // "Failed to load resource" é falha de rede (ex.: a prévia de capa com
    // URL inválida que os testes digitam de propósito), não erro de script.
    if (message.type() === "error" && !/Failed to load resource/.test(message.text()))
      errors.push(message.text());
  });
  return { context, page, errors };
}

const browser = await chromium.launch({ args: ["--no-sandbox"] });

// =====================================================================
// 1. Biblioteca vazia — estados vazios e primeiro cadastro
// =====================================================================
{
  const store = makeStore([]);
  const { context, page, errors } = await openApp(browser, store);

  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  check(
    "01 sessão válida dá acesso ao dashboard",
    new URL(page.url()).pathname === "/dashboard",
    page.url(),
  );
  check(
    "02 dashboard saúda o usuário pelo nome do perfil",
    (await page.getByText("Olá, Jogador").count()) === 1,
  );
  check(
    "03 dashboard mostra zero em biblioteca vazia",
    (await page.getByText("Nada por aqui ainda").count()) === 1,
  );

  await page.goto(`${BASE}/biblioteca`, { waitUntil: "networkidle" });
  check(
    "04 biblioteca vazia mostra estado vazio com ação",
    (await page.getByText("Sua biblioteca está vazia").count()) === 1 &&
      (await page.getByRole("button", { name: /Adicionar o primeiro jogo/ }).count()) === 1,
  );

  await page.goto(`${BASE}/estatisticas`, { waitUntil: "networkidle" });
  check(
    "05 estatísticas sem dados mostram estado vazio",
    (await page.getByText("Sem dados para calcular").count()) === 1,
  );

  // Cadastro do primeiro jogo
  await page.goto(`${BASE}/biblioteca`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Adicionar o primeiro jogo/ }).click();
  check(
    "06 modal de cadastro abre",
    (await page.getByRole("dialog").count()) === 1,
  );

  // Validação: nome obrigatório
  await page.getByRole("button", { name: "Adicionar à biblioteca" }).click();
  check(
    "07 formulário recusa jogo sem nome",
    (await page.getByText("Informe o nome do jogo.").count()) === 1,
  );

  // Validação: capa precisa ser https
  await page.fill("#game-name", "Hollow Knight");
  await page.fill("#game-cover", "http://exemplo.com/capa.png");
  await page.getByRole("button", { name: "Adicionar à biblioteca" }).click();
  check(
    "08 formulário recusa capa sem https",
    (await page.getByText("Use um endereço que comece com https://").count()) === 1,
  );

  await page.fill("#game-cover", "");
  await page.fill("#game-platform", "PC");
  await page.selectOption("#game-status", "completed");
  check(
    "09 status Zerado habilita o campo de data de conclusão",
    await page.locator("#game-completed").isEnabled(),
  );
  await page.fill("#game-hours", "42.5");
  await page.getByRole("button", { name: "5 estrelas" }).click();
  await page.getByRole("button", { name: "Adicionar à biblioteca" }).click();

  await page.waitForSelector("text=entrou na biblioteca", { timeout: 5000 });
  check("10 confirmação aparece após o cadastro", true);
  check(
    "11 jogo cadastrado aparece na biblioteca",
    (await page.getByRole("heading", { name: "Hollow Knight" }).count()) === 1,
  );
  check(
    "12 jogo foi persistido no backend com os dados corretos",
    store.games.length === 1 &&
      store.games[0].name === "Hollow Knight" &&
      store.games[0].platform === "PC" &&
      store.games[0].status === "completed" &&
      store.games[0].hours_played === 42.5 &&
      store.games[0].rating === 5 &&
      store.games[0].user_id === USER_ID,
    JSON.stringify(store.games[0] ?? {}),
  );

  // Dashboard reflete o cadastro
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.waitForURL(/dashboard/);
  const dashboardText = await page.locator("main").innerText();
  check(
    "13 dashboard soma o novo jogo (total, zerados e horas)",
    dashboardText.includes("42h30") &&
      /Zerados[\s\S]*?\b1\b/i.test(dashboardText) &&
      /Jogos cadastrados[\s\S]*?\b1\b/i.test(dashboardText),
    dashboardText.replace(/\n+/g, " | ").slice(0, 240),
  );

  check("14 nenhum erro de JavaScript no fluxo de cadastro", errors.length === 0,
    errors.slice(0, 2).join(" | "));
  await context.close();
}

// =====================================================================
// 2. Biblioteca povoada — filtros, busca, ordenação, edição, exclusão
// =====================================================================
{
  const store = makeStore([
    { name: "Hollow Knight", platform: "PC", status: "completed", hours_played: 42, rating: 5, completed_at: "2026-03-10" },
    { name: "Elden Ring", platform: "PlayStation 5", status: "playing", hours_played: 90, rating: 4 },
    { name: "Celeste", platform: "PC", status: "wishlist", hours_played: 0 },
    { name: "Pokémon Scarlet", platform: null, status: "paused", hours_played: 12, rating: 3 },
    { name: "Cyberpunk 2077", platform: "PC", status: "abandoned", hours_played: 8, rating: 2 },
  ]);
  const { context, page, errors } = await openApp(browser, store);

  await page.goto(`${BASE}/biblioteca`, { waitUntil: "networkidle" });
  const cards = page.locator("article");
  check("15 biblioteca lista todos os jogos", (await cards.count()) === 5);

  // Busca
  await page.fill('input[type="search"]', "ring");
  await page.waitForTimeout(150);
  check(
    "16 busca filtra pelo nome",
    (await cards.count()) === 1 &&
      (await page.getByRole("heading", { name: "Elden Ring" }).count()) === 1,
  );

  await page.fill('input[type="search"]', "pokemon");
  await page.waitForTimeout(150);
  check(
    "17 busca ignora acentos",
    (await cards.count()) === 1 &&
      (await page.getByRole("heading", { name: "Pokémon Scarlet" }).count()) === 1,
  );

  await page.fill('input[type="search"]', "zelda");
  await page.waitForTimeout(150);
  check(
    "18 busca sem resultados mostra estado vazio com ação de limpar",
    (await page.getByText("Nenhum jogo encontrado").count()) === 1 &&
      (await page.getByRole("button", { name: "Limpar filtros" }).count()) === 1,
  );
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await page.waitForTimeout(150);
  check("19 limpar filtros restaura a lista", (await cards.count()) === 5);

  // Filtro por status
  await page.getByRole("button", { name: /^Zerado/ }).click();
  await page.waitForTimeout(150);
  check(
    "20 filtro por status Zerado",
    (await cards.count()) === 1 &&
      (await page.getByRole("heading", { name: "Hollow Knight" }).count()) === 1,
  );
  await page.getByRole("button", { name: /^Todos/ }).click();
  await page.waitForTimeout(150);

  // Filtro por plataforma
  await page.selectOption('select[aria-label="Filtrar por plataforma"]', "PC");
  await page.waitForTimeout(150);
  check("21 filtro por plataforma PC devolve 3 jogos", (await cards.count()) === 3);

  await page.selectOption('select[aria-label="Filtrar por plataforma"]', "Sem plataforma");
  await page.waitForTimeout(150);
  check(
    "22 filtro agrupa quem não informou plataforma",
    (await cards.count()) === 1 &&
      (await page.getByRole("heading", { name: "Pokémon Scarlet" }).count()) === 1,
  );
  await page.selectOption('select[aria-label="Filtrar por plataforma"]', "all");
  await page.waitForTimeout(150);

  // Ordenação
  await page.selectOption('select[aria-label="Ordenar biblioteca"]', "hours");
  await page.waitForTimeout(150);
  const firstByHours = await cards.first().locator("h3").innerText();
  check("23 ordenação por horas põe Elden Ring primeiro", firstByHours === "Elden Ring", firstByHours);

  await page.selectOption('select[aria-label="Ordenar biblioteca"]', "name");
  await page.waitForTimeout(150);
  const firstByName = await cards.first().locator("h3").innerText();
  check("24 ordenação por nome põe Celeste primeiro", firstByName === "Celeste", firstByName);

  // Edição
  await page.getByRole("button", { name: "Editar Celeste" }).click();
  check(
    "25 modal de edição vem preenchido com os dados do jogo",
    (await page.inputValue("#game-name")) === "Celeste" &&
      (await page.inputValue("#game-platform")) === "PC",
  );
  await page.fill("#game-hours", "15");
  await page.selectOption("#game-status", "playing");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await page.waitForSelector("text=Jogo atualizado.", { timeout: 5000 });
  const celeste = store.games.find((game) => game.name === "Celeste");
  check(
    "26 edição persiste status e horas no backend",
    celeste?.status === "playing" && Number(celeste?.hours_played) === 15,
    JSON.stringify(celeste ?? {}),
  );

  // Exclusão com confirmação
  await page.getByRole("button", { name: "Excluir Cyberpunk 2077" }).click();
  check(
    "27 exclusão pede confirmação antes de apagar",
    (await page.getByText(/não pode ser desfeita/).count()) >= 1,
  );
  await page.getByRole("button", { name: "Cancelar" }).click();
  await page.waitForTimeout(150);
  check(
    "28 cancelar a confirmação preserva o jogo",
    store.games.some((game) => game.name === "Cyberpunk 2077") &&
      (await cards.count()) === 5,
  );

  await page.getByRole("button", { name: "Excluir Cyberpunk 2077" }).click();
  await page.getByRole("button", { name: "Excluir", exact: true }).click();
  await page.waitForSelector("text=foi removido", { timeout: 5000 });
  check(
    "29 confirmar exclui do backend e da tela",
    !store.games.some((game) => game.name === "Cyberpunk 2077") &&
      (await cards.count()) === 4,
  );

  // Estatísticas reais
  await page.getByRole("link", { name: "Estatísticas" }).click();
  await page.waitForURL(/estatisticas/);
  const statsText = await page.locator("main").innerText();
  check(
    "30 estatísticas somam as horas registradas (42+90+15+12 = 159h)",
    statsText.includes("159h"),
    statsText.replace(/\n+/g, " | ").slice(0, 200),
  );
  check(
    "31 estatísticas calculam a nota média dos avaliados (5+4+3)/3 = 4.0",
    statsText.includes("4.0") && statsText.includes("3 jogo(s) avaliado(s)"),
  );
  check(
    "32 estatísticas listam distribuição por plataforma",
    statsText.includes("PlayStation 5") && statsText.includes("Sem plataforma"),
  );

  check("33 nenhum erro de JavaScript no fluxo da biblioteca", errors.length === 0,
    errors.slice(0, 2).join(" | "));
  await context.close();
}

// =====================================================================
// 3. Perfil, configurações e logout
// =====================================================================
{
  const store = makeStore([
    { name: "Hollow Knight", platform: "PC", status: "completed", hours_played: 42, rating: 5 },
  ]);
  const { context, page, errors } = await openApp(browser, store);

  await page.goto(`${BASE}/perfil`, { waitUntil: "networkidle" });
  check(
    "34 perfil mostra o e-mail da conta somente leitura",
    (await page.inputValue("#profile-email")) === EMAIL &&
      (await page.locator("#profile-email").isDisabled()),
  );
  check(
    "35 perfil mostra os números reais da biblioteca",
    (await page.locator("main").innerText()).includes("42h"),
  );

  await page.fill("#profile-name", "L");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  check(
    "36 perfil recusa nome de exibição com 1 caractere",
    (await page.getByText("Use pelo menos 2 caracteres.").count()) === 1,
  );

  await page.fill("#profile-name", "Lucas Passos");
  await page.fill("#profile-platform", "PC");
  await page.fill("#profile-bio", "Prefiro metroidvanias.");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await page.waitForSelector("text=Perfil atualizado.", { timeout: 5000 });
  check(
    "37 perfil salva nome, plataforma e bio no backend",
    store.profile.display_name === "Lucas Passos" &&
      store.profile.favorite_platform === "PC" &&
      store.profile.bio === "Prefiro metroidvanias.",
    JSON.stringify(store.profile),
  );

  await page.goto(`${BASE}/configuracoes`, { waitUntil: "networkidle" });
  check(
    "38 configurações oferece exportação com a contagem real",
    (await page.getByRole("button", { name: /Baixar 1 registro/ }).count()) === 1,
  );

  await page.fill("#settings-password", "curta1");
  await page.fill("#settings-confirm", "curta1");
  await page.getByRole("button", { name: "Atualizar senha" }).click();
  check(
    "39 troca de senha valida o tamanho mínimo",
    (await page.getByText("A senha deve ter pelo menos 8 caracteres.").count()) === 1,
  );

  await page.fill("#settings-password", "levelup2026");
  await page.fill("#settings-confirm", "levelup2027");
  await page.getByRole("button", { name: "Atualizar senha" }).click();
  check(
    "40 troca de senha detecta confirmação diferente",
    (await page.getByText("As senhas não coincidem.").count()) === 1,
  );

  // Esvaziar biblioteca
  await page.getByRole("button", { name: "Excluir todos os jogos" }).click();
  await page.getByRole("button", { name: "Excluir tudo" }).click();
  await page.waitForSelector("text=Biblioteca esvaziada.", { timeout: 5000 });
  check("41 esvaziar biblioteca remove todos os registros", store.games.length === 0);
  check(
    "42 exportação fica desabilitada com a biblioteca vazia",
    await page.getByRole("button", { name: /Baixar 0 registro/ }).isDisabled(),
  );

  // Logout
  await page.getByRole("button", { name: "Sair da conta" }).first().click();
  await page.waitForURL(/\/login/, { timeout: 5000 });
  check("43 logout redireciona para /login", new URL(page.url()).pathname === "/login");

  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
  check(
    "44 após o logout a área privada volta a exigir login",
    new URL(page.url()).pathname === "/login",
    page.url(),
  );

  check("45 nenhum erro de JavaScript em perfil/configurações", errors.length === 0,
    errors.slice(0, 2).join(" | "));
  await context.close();
}

// =====================================================================
// 4. Responsividade da área autenticada
// =====================================================================
{
  const store = makeStore([
    { name: "Hollow Knight", platform: "PC", status: "completed", hours_played: 42, rating: 5 },
    { name: "Elden Ring", platform: "PS5", status: "playing", hours_played: 90, rating: 4 },
  ]);
  const { context, page } = await openApp(browser, store, {
    viewport: { width: 390, height: 844 },
  });

  for (const route of ["/dashboard", "/biblioteca", "/estatisticas", "/perfil", "/configuracoes"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    check(`46 ${route} sem rolagem horizontal em 390px`, overflow <= 1, `overflow=${overflow}px`);
  }

  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  check(
    "47 sidebar fica oculta no celular",
    !(await page.locator("aside").isVisible()),
  );
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.waitForTimeout(250);
  check(
    "48 menu mobile abre com todos os links de navegação",
    (await page.getByRole("link", { name: "Minha biblioteca" }).isVisible()) &&
      (await page.getByRole("link", { name: "Estatísticas" }).isVisible()),
  );
  await page.getByRole("link", { name: "Minha biblioteca" }).click();
  await page.waitForURL(/biblioteca/);
  check("49 navegação pelo menu mobile funciona", page.url().includes("/biblioteca"));

  // Modal de cadastro usável no celular
  await page.getByRole("button", { name: "Adicionar jogo" }).click();
  const dialog = await page.getByRole("dialog").boundingBox();
  check(
    "50 modal cabe na largura do celular",
    Boolean(dialog) && dialog.width <= 390,
    `largura=${dialog?.width}`,
  );
  await context.close();
}

await browser.close();

console.log(results.join("\n"));
console.log(`\n${results.length - failures}/${results.length} verificações passaram.`);
process.exit(failures > 0 ? 1 : 0);
