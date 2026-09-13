# Architecture

KliqApp test platform: Playwright TypeScript with Page Object Model (POM) for UI and API clients for backend checks.

## Layout

```
src/config/env.ts          Environment loader and required-var checks
src/fixtures/test.fixture.ts   Shared fixtures: loginPage, authApi
src/pages/                 UI page objects (locators + actions)
src/api/                   Backend API clients
tests/e2e/                 Browser specs (use page objects only)
tests/api/                 API specs (use API clients only)
docs/                      Architecture, progress, and project rules
.cursor/rules/             Cursor agent conventions
```

## UI flow

1. Specs import `test` / `expect` from `src/fixtures/test.fixture.ts`.
2. The `loginPage` fixture gives a `LoginPage` instance.
3. Locators live on the page class. Specs call actions (`open`, `login`) and page assertions (`expectLoggedIn`).
4. Playwright `baseURL` comes from `WEB_BASE_URL` in the local env file.

Locator priority: `getByRole` / `getByLabel` / `getByPlaceholder`, then `getByTestId`. No CSS or XPath in spec files.

## API flow

1. Specs use the `authApi` fixture (`AuthApi` over Playwright `APIRequestContext`).
2. `AuthApi` builds URLs from `API_BASE_URL`. Specs never hardcode host names.
3. Auth contract used in this slice:
   - `POST /api/v1/auth/login/`
   - `POST /api/v1/auth/login/logout/`
   - `POST /api/v1/auth/login/refresh-token/`
   - `GET /api/v1/auth/login/my-profile/`

## Environment

Copy `.env.example` to `.env` (gitignored). Put URLs, users, and passwords only in local env files — never in source, specs, or docs.

Load order:

1. `.env`
2. `.env.${ENV}` if that file exists (overrides `.env`). `ENV` defaults to `sandbox`.

Switch environment with one value, for example `ENV=dev`, after you create a local `.env.dev`. Login path in the page object is `/login`.

| Variable | Used by |
|----------|---------|
| `ENV` | Which overlay file to load (default `sandbox`) |
| `WEB_BASE_URL` | Playwright `baseURL` |
| `API_BASE_URL` | API client |
| `BRAND_EMAIL` / `BRAND_PASSWORD` | Login UI and Auth API |
| `CREATOR_EMAIL` / `CREATOR_PASSWORD` | Reserved for later creator flows |

`src/config/env.ts` fails with a clear error when a required variable is missing. Do not point CI at production unless that is explicit.

## Projects

- `e2e` — `tests/e2e/**` in Desktop Chrome
- `api` — `tests/api/**` using the request context
