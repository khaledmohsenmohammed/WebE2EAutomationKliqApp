# WebE2EAutomationKliqApp

Playwright TypeScript platform for KliqApp: UI tests with Page Object Model and backend Auth API tests.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

Fill `WEB_BASE_URL`, `API_BASE_URL`, and test users in `.env`. Do not commit `.env`.

`ENV` defaults to `sandbox`. To switch, set `ENV=dev` or `ENV=production` and keep values in a local `.env.dev` / `.env.production` (also gitignored).

## Run tests

```bash
npm test                 # all projects
npm run test:e2e         # UI tests
npm run test:api         # API tests
npm run test:ui          # Playwright UI mode
npm run report           # last HTML report
```

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — folders, POM, API clients, env
- [docs/PROGRESS.md](docs/PROGRESS.md) — done vs next
- [docs/PROJECT-RULES.md](docs/PROJECT-RULES.md) — conventions for people and agents

## Notes

- Login locators are role/placeholder-based until they are tuned against the live app.
- Auth endpoints follow the KliqApp `/api/v1/auth/...` contract.
