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
- [x] `testdata/environments.json` holds URLs per env; `users.json` holds switchable accounts
- [x] Passwords only in local `.env`; `ACTIVE_USER` / `ENV` switch environment and account
- [x] `testdata/generated/` for runtime-created test data

## Next

- [ ] Fill `apiBaseUrl` in `environments.json` and emails in `users.json`
- [ ] Set `BRAND_PASSWORD` / `CREATOR_PASSWORD` in local `.env`
- [ ] Tune `LoginPage` locators against sandbox login
- [ ] Campaigns UI page + matching API client
- [ ] Proposals UI page + matching API client
- [ ] CI workflow after local runs are green
