# Progress

Update this file after each meaningful change.

## Done

- [x] Playwright + TypeScript scaffold (`package.json`, `playwright.config.ts`, `tsconfig.json`)
- [x] `.env.example` and `src/config/env.ts`
- [x] POM: `BasePage`, `LoginPage` (locators + actions)
- [x] Shared fixture: `loginPage`, `authApi`
- [x] E2E specs: valid brand login, invalid password
- [x] `AuthApi` client: login, logout, refresh token, my profile
- [x] Auth API specs: success login, wrong password, profile, logout
- [x] Docs: architecture, progress, project rules, README, AGENTS.md
- [x] Cursor rules for core, POM, E2E, and API
- [x] Git remote `origin` (no push)
- [x] `tsconfig.json` uses `moduleResolution: bundler` (not deprecated `node`/`node10`)

## Next

- [ ] Fill `.env` with real `WEB_BASE_URL`, `API_BASE_URL`, and test users
- [ ] Tune `LoginPage` locators against the live web app
- [ ] Confirm login path (`/login`) matches production routing
- [ ] Campaigns UI page + matching API client
- [ ] Proposals UI page + matching API client
- [ ] CI workflow after local runs are green
