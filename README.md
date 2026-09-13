# WebE2EAutomationKliqApp

Playwright TypeScript platform for KliqApp: UI tests with Page Object Model and backend Auth API tests.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

1. Put emails in [testdata/users.json](testdata/users.json) and set `activeUser` (or `ACTIVE_USER` in `.env`).
2. Put `apiBaseUrl` in [testdata/environments.json](testdata/environments.json) when you have it (web URLs are already there).
3. Put passwords only in `.env` (`BRAND_PASSWORD`, `CREATOR_PASSWORD`). Do not commit `.env`.

Switch environment: `ENV=sandbox` | `dev` | `production`.  
Switch account: `ACTIVE_USER=brandAlt` or change `activeUser` in `users.json`.

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
- Runtime-created data goes under `testdata/generated/` (contents gitignored).
