import "./style.css";
import uFuzzy from "@leeoniya/ufuzzy";

const DATA_URL =
  "https://raw.githubusercontent.com/franciscobmacedo/debtors-scraper/main/data/debtors.json";
const SS_DATA_URL =
  "https://raw.githubusercontent.com/franciscobmacedo/debtors-scraper/main/data/ss-debtors.json";

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
type Source = "at" | "ss";

const SOURCE_LABEL: Record<Source, string> = { at: "Fisco", ss: "Seg. Social" };

interface Debtor {
  name: string;
  id: number; // NIF or NIPC
  kind: Kind;
  source: Source;
  step: Step;
  /** normalized (lowercase, accent-stripped) name for searching */
  q: string;
  idStr: string;
}

interface State {
  query: string;
  kind: Kind | "todos";
  source: Source | "todas";
  stepKey: string; // "" = all, otherwise "start-end"
  sort: "none" | "name" | "debt-desc" | "debt-asc";
  shown: number;
}

const PAGE = 100;

const state: State = {
  query: "",
  kind: "todos",
  source: "todas",
  stepKey: "",
  sort: "none",
  shown: PAGE,
};

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
          <div class="chip-group" id="source-chips" role="radiogroup" aria-label="Fonte">
            <button data-source="todas" class="chip">Ambas</button>
            <button data-source="at" class="chip">Fisco</button>
            <button data-source="ss" class="chip">Seg. Social</button>
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
      <h1>Devedores ao Estado</h1>
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
        Toda a informação nesta página provém das listas públicas divulgadas pela
        <a href="https://static.portaldasfinancas.gov.pt/app/devedores_static/de-devedores.html" target="_blank" rel="noopener">Autoridade Tributária (AT)</a>
        e pela
        <a href="https://www.seg-social.pt/ptss/sef/lista-devedores/consulta-lista-devedores" target="_blank" rel="noopener">Segurança Social</a>,
        e não sofre qualquer alteração da nossa parte. Os dados apresentados são da exclusiva responsabilidade dessas
        entidades; qualquer inconsistência deverá ser-lhes reportada diretamente.
      </p>
      <p>
        Dados em bruto:
        <a href="${DATA_URL}" target="_blank" rel="noopener">debtors.json</a> ·
        <a href="${SS_DATA_URL}" target="_blank" rel="noopener">ss-debtors.json</a>
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

  document.querySelectorAll<HTMLButtonElement>("#source-chips .chip").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.source = btn.dataset.source as State["source"];
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
  document
    .querySelectorAll<HTMLButtonElement>("#source-chips .chip")
    .forEach((b) => b.classList.toggle("active", b.dataset.source === state.source));
}

const matchesFacets = (d: Debtor) =>
  (state.kind === "todos" || d.kind === state.kind) &&
  (state.source === "todas" || d.source === state.source);

// Typo-tolerant search: allows one insertion/deletion/substitution/transposition
// inside each term, so "jime" finds JAIME and "alxandre" finds ALEXANDRE.
// Terms can appear in any order ("antonio joao" finds JOÃO ANTONIO).
const uf = new uFuzzy({ intraMode: 1, intraIns: 1, intraSub: 1, intraTrn: 1, intraDel: 1 });
let haystack: string[] = [];

function searchNames(q: string): Debtor[] {
  const [idxs, info, order] = uf.search(haystack, q, 1);
  if (!idxs || idxs.length === 0) return [];
  // When ranking info is available, use relevance order; otherwise raw match order.
  if (info && order) return order.map((i) => debtors[info.idx[i]]);
  return Array.from(idxs, (i) => debtors[i]);
}

function filtered(): Debtor[] {
  const q = normalize(state.query.trim());
  const isNum = /^\d+$/.test(q);
  const base = !q || isNum ? debtors : searchNames(q);
  let out = base.filter((d) => {
    if (!matchesFacets(d)) return false;
    if (state.stepKey && stepKey(d.step) !== state.stepKey) return false;
    if (isNum) return d.idStr.startsWith(q);
    return true;
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
            <td class="col-name">${escapeHtml(d.name)}<span class="kind-tag">${d.kind} · ${SOURCE_LABEL[d.source]}</span></td>
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
    ["numero", "nome", "tipo", "fonte", "divida"],
    ...current.map((d) => [String(d.id), d.name, d.kind, SOURCE_LABEL[d.source], stepLabel(d.step)]),
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
    if (!matchesFacets(d)) continue;
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
    const fetchJson = async (url: string): Promise<ApiResponse | null> => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    };
    const [at, ss] = await Promise.all([fetchJson(DATA_URL), fetchJson(SS_DATA_URL)]);
    if (!at && !ss) throw new Error("no data");
    lastUpdated = at?.last_updated ?? ss?.last_updated ?? "";

    const mk = (raw: RawDebtor, kind: Kind, source: Source, id: number): Debtor => ({
      name: raw.name,
      id,
      kind,
      source,
      step: raw.step,
      q: normalize(raw.name),
      idStr: String(id),
    });
    const fromApi = (data: ApiResponse, source: Source): Debtor[] => [
      ...data.colective_debtors.map((d) => mk(d, "empresa", source, d.nipc!)),
      ...data.singular_debtors.map((d) => mk(d, "pessoa", source, d.nif!)),
    ];
    debtors = [...(at ? fromApi(at, "at") : []), ...(ss ? fromApi(ss, "ss") : [])];
    haystack = debtors.map((d) => d.q);

    const totals = document.getElementById("totals");
    if (totals) {
      const empresas = debtors.filter((d) => d.kind === "empresa").length;
      const pessoas = debtors.length - empresas;
      const updates = [
        at ? `Fisco a ${at.last_updated}` : null,
        ss ? `Seg. Social a ${ss.last_updated}` : null,
      ]
        .filter(Boolean)
        .join(", ");
      totals.innerHTML = `<strong>${fmtInt(empresas)}</strong> empresas · <strong>${fmtInt(
        pessoas,
      )}</strong> pessoas · atualizado: ${updates}`;
    }
    // Hide the source filter until the SS dataset actually exists.
    if (!ss || !at) document.getElementById("source-chips")?.remove();
    buildStepOptions();
    update();
  } catch (err) {
    results.innerHTML = `<p class="empty">Falha ao carregar os dados. Tente novamente mais tarde.</p>`;
    console.error(err);
  }
}

load();
