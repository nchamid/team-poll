# Team Poll

A small internal app for settling quick team decisions: create a poll, vote once, see results. Built on the firm's Tier 1 framework (production-grade internal applications).

## ▶️ Live demo

**https://nchamid.github.io/team-poll/**

A static, UI-only showcase hosted on GitHub Pages. It runs the real app shell and screens against an **in-memory mock API seeded with synthetic data** — no sign-in, no backend, no real data. Vote, create a poll, close or delete one, and watch results update; everything resets on reload.

> The live demo is for showing the interface only. The production app is a different deployment entirely — Entra-authenticated, backed by a .NET API and SQL Server (see [Demo vs. production](#demo-vs-production)).

## Overview

| Layer        | Stack                                                                 |
| ------------ | --------------------------------------------------------------------- |
| Web          | React 19 + TypeScript + Vite + Vitest + CSS Modules                   |
| API          | ASP.NET Core 10 (controllers) + EF Core + Microsoft.Identity.Web + Serilog |
| Database     | SQL Server (Azure SQL in prod, LocalDB in dev)                        |
| Auth         | Single-tenant Entra ID; `Poll.Admin` app role + poll ownership        |
| Hosting      | Azure App Service + Azure SQL                                         |

Authenticated firm members can create polls and cast one vote each. A poll's owner — or anyone holding the `Poll.Admin` role — can close or delete it. Results stay hidden to a member until they have voted.

## Repository layout

```
web/         React SPA (frontend)
  src/demo/  Static GitHub Pages demo — mock API client + sample data (build-flag gated)
api/         ASP.NET Core API (TeamPoll.slnx)
database/    SQL migrations, stored procedures, tSQLt tests  (see database/README.md)
artifacts/   Planning, design, and product docs
```

## Local development

Prerequisites: **Node 24**, **.NET 10 SDK**, and SQL Server / LocalDB for the API.

### Web

```bash
cd web
npm ci
cp .env.example .env   # fill in the Entra / API values for the real (signed-in) app
npm run dev            # http://localhost:5173
```

Run the **demo** (no sign-in, mock data) locally — handy for working on the UI without the API or Entra:

```bash
cd web
VITE_DEMO_MODE=true npm run dev
```

### API

```bash
cd api
dotnet build TeamPoll.slnx
dotnet test  TeamPoll.slnx
```

### Database

Migrations, stored procedures, and tSQLt tests live under `database/` — see [`database/README.md`](database/README.md).

## Web scripts

| Script               | Purpose                                                        |
| -------------------- | ------------------------------------------------------------- |
| `npm run dev`        | Vite dev server                                               |
| `npm run build`      | Production build                                              |
| `npm run build:demo` | Demo build for GitHub Pages (`VITE_DEMO_MODE`, `/team-poll/` base) |
| `npm run preview`    | Preview a build                                               |
| `npm run lint`       | ESLint                                                        |
| `npm run format`     | Prettier check                                                |
| `npm run test`       | Vitest                                                        |
| `npm run test:coverage` | Vitest with coverage                                       |

## Demo vs. production

| | Live demo (GitHub Pages) | Production |
| --- | --- | --- |
| Data | Synthetic, in-memory, resets on reload | Real, in Azure SQL |
| API | Mock client in the browser | ASP.NET Core API |
| Auth | None (no sign-in) | Entra ID |
| Build | `npm run build:demo` (`VITE_DEMO_MODE=true`) | `npm run build` |

The demo build is **gated behind `VITE_DEMO_MODE`** and is dynamically imported, so demo code (the mock API and sample data) is tree-shaken out of the production bundle entirely.

### How the demo deploys

[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) builds the demo and publishes it to GitHub Pages on every push to `dev` (the integration branch). Pages is configured with **Source = GitHub Actions**.

## Conventions

This is a Tier 1 project; the engineering and design standards it follows are documented in [`CLAUDE.md`](CLAUDE.md) and `.claude/rules/`.
