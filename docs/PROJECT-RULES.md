# Project rules

## Language

- Write code, comments, commit messages, Cursor rules, and docs in English.
- Explain in Arabic only when the user asks in Arabic.

## Page Object Model

- One page class per screen under `src/pages/{auth,brand,creator}/`. Settings sub-items are sections, not pages.
- Shared shell (sidebar/header) is composed on `BasePage`. Repeated campaign card/table/tab UI lives in `src/pages/shared/`.
- Define locators as class fields. Specs must not declare locators.
- Pages expose actions and page-level assertions. Keep flows in specs.

## Tests

- E2E specs use fixtures and page objects only.
- API specs use API clients only. Do not hardcode base URLs.
- Prefer role/label/placeholder locators, then `getByTestId`.
- Do not put CSS or XPath selectors in spec files.

## Environments and test data

- URLs live in `testdata/environments.json`. Accounts (emails/roles) live in `testdata/users.json`.
- Passwords live only in local `.env` / `.env.*` (gitignored).
- Do not hardcode hosts, emails, or credentials in specs. Use `src/config/env.ts` / `testdata.ts`.
- Default `ENV` is `sandbox`. Switch with `ENV=dev` or `ENV=production`.
- Switch account with `ACTIVE_USER` or `users.json` → `activeUser`.
- Persist runtime-created data with `saveGenerated()` under `testdata/generated/`.
- For an accumulating dated/typed record (e.g. registration runs), use `appendGenerated(fileName, entry)` instead — merges into one shared JSON file under `testdata/generated/`, keyed by ISO timestamp.
- **Generated accounts:** any test that creates a sandbox account must go through `registerAndOnboard()`, which writes `testdata/generated/registrations.json` itself (including on failure). Specs must not also call `appendGenerated('registrations')` — that would double-log. Any later mutation of that account (profile completion, settings, etc.) must call `recordAccountUpdate()` so the same row is patched instead of a second timestamp being created.
- Do not point tests at production unless that is explicit.

## Secrets

- Never commit `.env`, `.env.sandbox`, `.env.dev`, `.env.production`, tokens, or real passwords.
- `.env.example` may list keys only, with empty values. Never put passwords in JSON.

## Docs

- Read `docs/ARCHITECTURE.md`, `docs/PROGRESS.md`, and this file before changing tests.
- Update `docs/PROGRESS.md` after meaningful work.

## QA style

- When writing bugs or test cases for KliqApp, use Khaled's KLIQ-387 / KLIQ-390 style (Bug ID, Title, Related TC, Summary, Steps, Expected, Actual, Severity, Priority, Type, Status, Notes).
- Do not invent acceptance criteria.
