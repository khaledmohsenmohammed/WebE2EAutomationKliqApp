# Project rules

## Language

- Write code, comments, commit messages, Cursor rules, and docs in English.
- Explain in Arabic only when the user asks in Arabic.

## Page Object Model

- One page class per screen under `src/pages/`.
- Define locators as class fields. Specs must not declare locators.
- Pages expose actions and page-level assertions. Keep flows in specs.

## Tests

- E2E specs use fixtures and page objects only.
- API specs use API clients only. Do not hardcode base URLs.
- Prefer role/label/placeholder locators, then `getByTestId`.
- Do not put CSS or XPath selectors in spec files.

## Environments

- Read URLs, users, and passwords from local env files only (`src/config/env.ts`).
- Do not hardcode hosts, emails, or credentials in source, specs, or docs.
- Default `ENV` is `sandbox`. Switch with `ENV=dev` or `ENV=production` plus a matching local `.env.*` file.
- Do not point tests at production unless that is explicit.

## Secrets

- Never commit `.env`, `.env.sandbox`, `.env.dev`, `.env.production`, tokens, or real passwords.
- `.env.example` may list keys only, with empty values.

## Docs

- Read `docs/ARCHITECTURE.md`, `docs/PROGRESS.md`, and this file before changing tests.
- Update `docs/PROGRESS.md` after meaningful work.

## QA style

- When writing bugs or test cases for KliqApp, use Khaled's KLIQ-387 / KLIQ-390 style (Bug ID, Title, Related TC, Summary, Steps, Expected, Actual, Severity, Priority, Type, Status, Notes).
- Do not invent acceptance criteria.
