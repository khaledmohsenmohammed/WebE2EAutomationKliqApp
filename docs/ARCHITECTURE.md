# Architecture

KliqApp test platform: Playwright TypeScript with Page Object Model (POM) for UI and API clients for backend checks.

## Layout

```
testdata/environments.json   Web/API URLs per environment
testdata/users.json          Named test accounts (emails, roles) — switch active user here
testdata/generated/          Runtime data created by tests (gitignored contents)
src/config/env.ts            Loads ENV + secrets from .env, merges testdata JSON
src/config/testdata.ts       JSON readers + saveGenerated helpers
src/fixtures/test.fixture.ts Shared fixtures: loginPage, authApi
src/pages/                   UI page objects (POM): base, auth, brand, creator, shared
src/api/                     Backend API clients
tests/e2e/                   Browser specs (use page objects only)
tests/api/                   API specs (use API clients only)
docs/                        Architecture, progress, and project rules
.cursor/rules/               Cursor agent conventions
```

## UI flow

1. Specs import `test` / `expect` from `src/fixtures/test.fixture.ts`.
2. The `loginPage` fixture gives a `LoginPage` instance (`src/pages/auth/LoginPage.ts`).
3. Locators live on page/component classes. Specs call actions (`open`, `login`) and page assertions (`expectLoggedIn`).
4. Logged-in pages extend `BasePage`, which composes `sidebar` and `header` (do not re-declare those locators).
5. Settings sub-items are **sections** (in-place content swap), not separate routes.
6. Playwright `baseURL` comes from `testdata/environments.json` for the current `ENV` (optional `.env` override).

Locator priority: `getByRole` / `getByLabel` / `getByPlaceholder`, then `getByTestId`. No CSS or XPath in spec files.

## API flow

1. Specs use the `authApi` fixture (`AuthApi` over Playwright `APIRequestContext`).
2. `AuthApi` builds URLs from `apiBaseUrl` in environments JSON (or `API_BASE_URL` override). Specs never hardcode host names.
3. Auth contract used in this slice:
   - `POST /api/v1/auth/login/`
   - `POST /api/v1/auth/login/logout/`
   - `POST /api/v1/auth/login/refresh-token/`
   - `GET /api/v1/auth/login/my-profile/`

## Environment and test data

| Source | What it holds | On Git? |
|--------|---------------|---------|
| `testdata/environments.json` | `webBaseUrl` / `apiBaseUrl` per env | Yes |
| `testdata/users.json` | Account keys, emails, roles, `activeUser` | Yes (no passwords) |
| `testdata/generated/` | Runtime artifacts, including `registrations.json` (every created sandbox account + later mutations) | Folder yes; files ignored |
| `.env` | `ENV`, `ACTIVE_USER`, passwords, optional URL overrides | No |

Load order:

1. Read `.env` (gitignored).
2. Resolve `ENV` (default `sandbox` from environments.json).
3. Load URLs from `testdata/environments.json[ENV]`. Optional `WEB_BASE_URL` / `API_BASE_URL` in `.env` override JSON.
4. Resolve active user from `ACTIVE_USER` or `users.json` → `activeUser`. Password from the user's `passwordEnv` key in `.env`.

Switch environment: set `ENV=dev` (or `production`). Switch account: set `ACTIVE_USER=brandAlt` or change `activeUser` in `users.json`.

Login path in the page object is `/login`.

| Variable | Used by |
|----------|---------|
| `ENV` | Which block in `environments.json` (default `sandbox`) |
| `ACTIVE_USER` | Which key in `users.json` |
| `WEB_BASE_URL` / `API_BASE_URL` | Optional overrides of JSON URLs |
| `BRAND_PASSWORD` / `CREATOR_PASSWORD` | Secrets only — never in JSON |

Do not point CI at production unless that is explicit.

## Projects

- `e2e` — `tests/e2e/**` in Desktop Chrome
- `api` — `tests/api/**` using the request context
