# Devedores ao Estado

https://debtors.fmacedo.com

Portugal publishes two public debtors lists — the Tax Authority (AT/Fisco) and Segurança Social. This app makes them actually browsable in one place: instant accent-insensitive search by name or NIF/NIPC, filtering by type and debt bracket, sorting, and CSV export.

It reads from a JSON file updated daily by the [debtors-scraper](https://github.com/franciscobmacedo/debtors-scraper):

```
https://raw.githubusercontent.com/franciscobmacedo/debtors-scraper/main/data/debtors.json
```

That URL is also consumed directly by the PowerBI dashboards embedded on the page (by [O INVESTIGADOR](https://www.instagram.com/oinvestigador.pt/)) — it's a stable contract.

## Routes

- `/` — search, table, charts
- `/table` — table only (for embedding)

## Stack

Vite + vanilla TypeScript, no runtime dependencies. Hosted on Cloudflare Pages.

## Local setup

```shell
npm install
npm run dev
```

`npm run build` outputs to `dist/`.
