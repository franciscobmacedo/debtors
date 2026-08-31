import "./style.css";

const DATA_URL =
  "https://raw.githubusercontent.com/franciscobmacedo/debtors-scraper/main/data/debtors.json";

const CHARTS = [
  {
    title: "Dívidas à AT — Empresas",
    src: "https://app.powerbi.com/view?r=eyJrIjoiMzliZjU4ZTItMmJkYy00MTUzLTg2OGMtOWQzYjRjNDJlMmEzIiwidCI6IjkyNzQyZWFlLWExMTktNDNmYi1hOTU2LWQ3ZGVmNzQ0ODgxYSIsImMiOjh9",
  },
  {
    title: "Dívidas à AT — Pessoas",
    src: "https://app.powerbi.com/view?r=eyJrIjoiYjQ5NWU1ZGUtNTNjMS00ZGI4LWExNzItMTcyOGZkOGViODI4IiwidCI6IjkyNzQyZWFlLWExMTktNDNmYi1hOTU2LWQ3ZGVmNzQ0ODgxYSIsImMiOjh9",
  },
];

interface Step {
  start: number;
  end: number | null;
}

interface RawDebtor {
  name: string;
  step: Step;
  nif?: number;
  nipc?: number;
}

interface ApiResponse {
  singular_debtors: RawDebtor[];
  colective_debtors: RawDebtor[];
  last_updated: string;
}

type Kind = "empresa" | "pessoa";

interface Debtor {
  name: string;
  id: number; // NIF or NIPC
  kind: Kind;
  step: Step;
  /** normalized (lowercase, accent-stripped) name for searching */
  q: string;
  idStr: string;
}

interface State {
  query: string;
  kind: Kind | "todos";
  stepKey: string; // "" = all, otherwise "start-end"
  sort: "none" | "name" | "debt-desc" | "debt-asc";
  shown: number;
}

const PAGE = 100;

const state: State = { query: "", kind: "todos", stepKey: "", sort: "none", shown: PAGE };

let debtors: Debtor[] = [];
let lastUpdated = "";

const app = document.getElementById("app")!;
const embed = location.pathname.replace(/\/$/, "") === "/table";

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const fmtInt = (n: number) => n.toLocaleString("pt-PT");

const stepLabel = (s: Step) =>
  s.end === null ? `mais de ${fmtInt(s.start)} €` : `${fmtInt(s.start)} — ${fmtInt(s.end)} €`;

const stepKey = (s: Step) => `${s.start}-${s.end ?? "x"}`;

/** 0..5 severity tier for coloring, based on bracket start */
const severity = (s: Step) => {
  if (s.start >= 1_000_000) return 5;
  if (s.start >= 250_000) return 4;
  if (s.start >= 100_000) return 3;
  if (s.start >= 50_000) return 2;
  if (s.start >= 25_000) return 1;
  return 0;
};

function render() {
  app.innerHTML = `
    ${embed ? "" : header()}
    <main class="wrap">
      <section class="search-panel">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>
          <input id="q" type="search" placeholder="Pesquisar por nome, NIF ou NIPC…" autocomplete="off" spellcheck="false" autofocus />
        </div>
        <div class="filters">
          <div class="chip-group" id="kind-chips" role="radiogroup" aria-label="Tipo de devedor">
            <button data-kind="todos" class="chip">Todos</button>
            <button data-kind="empresa" class="chip">Empresas</button>
            <button data-kind="pessoa" class="chip">Pessoas</button>
          </div>
          <select id="step-select" aria-label="Escalão de dívida"></select>
          <select id="sort-select" aria-label="Ordenação">
            <option value="none">Ordem original</option>
            <option value="name">Nome A–Z</option>
            <option value="debt-desc">Maior dívida primeiro</option>
            <option value="debt-asc">Menor dívida primeiro</option>
          </select>
          <button id="export" class="export-btn" title="Exportar resultados filtrados para CSV">
            Exportar CSV
          </button>
        </div>
      </section>
      <p class="result-count" id="count" role="status"></p>
      <section id="results"></section>
      ${embed ? "" : chartsSection() + footer()}
    </main>
  `;
  bind();
  syncControls();
  update();
}

function header() {
  return `
    <header class="masthead">
      <h1>Devedores ao Fisco</h1>
      <p class="meta" id="totals">A carregar…</p>
    </header>
  `;
}

function chartsSection() {
  return `
    <section class="charts">
      <h2>Análise</h2>
      <p class="charts-note">Painéis interativos construídos sobre os mesmos dados, por <a href="https://www.instagram.com/oinvestigador.pt/" target="_blank" rel="noopener">O INVESTIGADOR</a>.</p>
      ${CHARTS.map(
        (c) => `
        <details class="chart">
          <summary>${c.title}</summary>
          <div class="chart-frame" data-src="${c.src}" data-title="${c.title}"></div>
        </details>`,
      ).join("")}
    </section>
  `;
}

function footer() {
  return `
    <footer class="site-footer">
      <p>
        Toda a informação nesta página provém dos dados públicos divulgados pela
        <a href="https://static.portaldasfinancas.gov.pt/app/devedores_static/de-devedores.html" target="_blank" rel="noopener">Autoridade Tributária (AT)</a>
        e não sofre qualquer alteração da nossa parte. Os dados apresentados são da exclusiva responsabilidade da AT;
        qualquer inconsistência deverá ser-lhe reportada diretamente.
      </p>
      <p>
        Dados em bruto:
        <a href="${DATA_URL}" target="_blank" rel="noopener">debtors.json</a>
        · Código:
        <a href="https://github.com/franciscobmacedo/debtors" target="_blank" rel="noopener">frontend</a> /
        <a href="https://github.com/franciscobmacedo/debtors-scraper" target="_blank" rel="noopener">scraper</a>
      </p>
      <p>
        Scraper e pesquisa por <a href="https://fmacedo.com/" target="_blank" rel="noopener">fmacedo</a> ·
        gráficos por <a href="https://www.instagram.com/oinvestigador.pt/" target="_blank" rel="noopener">O INVESTIGADOR</a>
      </p>
    </footer>
  `;
}

function bind() {
  const q = document.getElementById("q") as HTMLInputElement;
  let t: number | undefined;
  q.addEventListener("input", () => {
    clearTimeout(t);
    t = window.setTimeout(() => {
      state.query = q.value;
      state.shown = PAGE;
      update();
    }, 80);
  });

  document.querySelectorAll<HTMLButtonElement>("#kind-chips .chip").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.kind = btn.dataset.kind as State["kind"];
      state.shown = PAGE;
      buildStepOptions();
      syncControls();
      update();
    }),
  );

  (document.getElementById("step-select") as HTMLSelectElement).addEventListener("change", (e) => {
    state.stepKey = (e.target as HTMLSelectElement).value;
    state.shown = PAGE;
    update();
  });

  (document.getElementById("sort-select") as HTMLSelectElement).addEventListener("change", (e) => {
    state.sort = (e.target as HTMLSelectElement).value as State["sort"];
    state.shown = PAGE;
    update();
  });

  document.getElementById("export")!.addEventListener("click", exportCsv);

  // lazy-load PowerBI iframes when opened
  document.querySelectorAll<HTMLDetailsElement>("details.chart").forEach((d) =>
    d.addEventListener("toggle", () => {
      const frame = d.querySelector<HTMLElement>(".chart-frame")!;
      if (d.open && !frame.querySelector("iframe")) {
        const iframe = document.createElement("iframe");
        iframe.src = frame.dataset.src!;
        iframe.title = frame.dataset.title!;
        iframe.allowFullscreen = true;
        frame.appendChild(iframe);
      }
    }),
  );
}

function syncControls() {
  document
    .querySelectorAll<HTMLButtonElement>("#kind-chips .chip")
    .forEach((b) => b.classList.toggle("active", b.dataset.kind === state.kind));
}

function filtered(): Debtor[] {
  const q = normalize(state.query.trim());
  const isNum = /^\d+$/.test(q);
  let out = debtors.filter((d) => {
    if (state.kind !== "todos" && d.kind !== state.kind) return false;
    if (state.stepKey && stepKey(d.step) !== state.stepKey) return false;
    if (!q) return true;
    return isNum ? d.idStr.startsWith(q) : d.q.includes(q);
  });
  if (state.sort === "name") out = out.slice().sort((a, b) => a.q.localeCompare(b.q));
  else if (state.sort === "debt-desc") out = out.slice().sort((a, b) => b.step.start - a.step.start);
  else if (state.sort === "debt-asc") out = out.slice().sort((a, b) => a.step.start - b.step.start);
  return out;
}

let current: Debtor[] = [];

function update() {
  current = filtered();
  const count = document.getElementById("count")!;
  count.textContent = `${fmtInt(current.length)} ${current.length === 1 ? "resultado" : "resultados"}`;
  renderRows();
}

function renderRows() {
  const results = document.getElementById("results")!;
  const slice = current.slice(0, state.shown);
  results.innerHTML = `
    <table class="results-table">
      <thead><tr><th class="col-id">NIF / NIPC</th><th>Nome</th><th class="col-step">Dívida</th></tr></thead>
      <tbody>
        ${slice
          .map(
            (d) => `
          <tr>
            <td class="col-id">${d.id}</td>
            <td class="col-name">${escapeHtml(d.name)}<span class="kind-tag ${d.kind}">${d.kind}</span></td>
            <td class="col-step"><span class="step-badge s${severity(d.step)}">${stepLabel(d.step)}</span></td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>
    ${
      current.length > state.shown
        ? `<button id="more" class="more-btn">Mostrar mais (${fmtInt(current.length - state.shown)} restantes)</button>`
        : ""
    }
    ${current.length === 0 ? `<p class="empty">Nenhum devedor encontrado — bom sinal.</p>` : ""}
  `;
  document.getElementById("more")?.addEventListener("click", () => {
    state.shown += PAGE * 5;
    renderRows();
  });
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function exportCsv() {
  const rows = [
    ["numero", "nome", "tipo", "divida"],
    ...current.map((d) => [String(d.id), d.name, d.kind, stepLabel(d.step)]),
  ];
  const csv = rows
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `devedores-${lastUpdated || "export"}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function buildStepOptions() {
  // Escalões differ between empresas and pessoas, so the dropdown only offers
  // the brackets that exist for the selected type.
  const select = document.getElementById("step-select") as HTMLSelectElement;
  const seen = new Map<string, Step>();
  for (const d of debtors) {
    if (state.kind !== "todos" && d.kind !== state.kind) continue;
    const k = stepKey(d.step);
    if (!seen.has(k)) seen.set(k, d.step);
  }
  const steps = [...seen.values()].sort((a, b) => a.start - b.start);
  select.innerHTML =
    `<option value="">Todos os escalões</option>` +
    steps.map((s) => `<option value="${stepKey(s)}">${stepLabel(s)}</option>`).join("");
  if (state.stepKey && !seen.has(state.stepKey)) state.stepKey = "";
  select.value = state.stepKey;
}

async function load() {
  render();
  const results = document.getElementById("results")!;
  results.innerHTML = `<p class="loading">A carregar ${embed ? "" : "os cerca de 54 mil "}registos…</p>`;
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiResponse = await res.json();
    lastUpdated = data.last_updated;

    const mk = (raw: RawDebtor, kind: Kind, id: number): Debtor => ({
      name: raw.name,
      id,
      kind,
      step: raw.step,
      q: normalize(raw.name),
      idStr: String(id),
    });
    debtors = [
      ...data.colective_debtors.map((d) => mk(d, "empresa", d.nipc!)),
      ...data.singular_debtors.map((d) => mk(d, "pessoa", d.nif!)),
    ];

    const totals = document.getElementById("totals");
    if (totals)
      totals.innerHTML = `<strong>${fmtInt(data.colective_debtors.length)}</strong> empresas · <strong>${fmtInt(
        data.singular_debtors.length,
      )}</strong> pessoas · atualizada em ${lastUpdated}`;
    buildStepOptions();
    update();
  } catch (err) {
    results.innerHTML = `<p class="empty">Falha ao carregar os dados. Tente novamente mais tarde.</p>`;
    console.error(err);
  }
}

load();
