# Progress

Update this file after each meaningful change.

## Done

- [x] Playwright + TypeScript scaffold (`package.json`, `playwright.config.ts`, `tsconfig.json`)
- [x] `.env.example` and `src/config/env.ts`
- [x] POM: `BasePage`, `LoginPage` (locators + actions)
- [x] POM restructure: `src/pages/{base,auth,brand,creator,shared}` with composed Sidebar/Header, shared campaign card/table/tabs, brand + creator settings sections
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
- [x] Create-campaign wizard branches: Public (`PublicCampaignDetailsStep`) vs Invitation-Only STEP 1 (`InvitationCampaignBriefStep`)
- [x] Creator registration E2E flow: `registrationData.factory.ts` (random brand/creator inputs via `@faker-js/faker`), `registration.flow.ts` orchestrator with `RegistrationProgress` step flags (`formSubmitted`/`otpVerified`/`onboardingCompleted`/`accountCreated`), `register-creator.spec.ts` persisting generated data + progress via `saveGenerated()`
- [x] `RegisterPage.fillPhoneNumber()` fixed against real sandbox behavior: the phone field's value already starts with `+966` by default (Saudi Arabia is the default country) — `.fill(localNumber)` was silently overwriting that prefix and causing "Please enter a valid phone number"; now clicks in, moves to end, and types the local digits after it
- [x] `OtpPage` rebuilt against the real `/email-verification` screen (verified live on sandbox): 6 unlabeled single-digit textboxes (`getByRole('textbox')`, selected by index — no accessible name), `Verify`/`Resend` buttons confirmed
- [x] Fixed a step-flag false-positive: `registerAndOnboard` was marking `otpVerified`/`formSubmitted` `true` whenever `otpPage.isVisible()` came back `false`, even when that was because a *previous* step (the phone bug) silently failed rather than the step not applying — `formSubmitted` and `otpVerified` are now gated on hard URL assertions (`waitForUrl(/email-verification/i)`, `expectVerified()`) instead
- [x] Static test OTP confirmed for sandbox/dev: `200937` (never set for production). Exposed via `testdata/environments.json` → `testOtpCode` and `src/config/env.ts` → `requireTestOtpCode()`; `register-creator.spec.ts` uses it instead of a placeholder
- [x] `OnboardingPage` rebuilt against the real `/onboarding/creator` wizard (verified live on sandbox): 3 steps, each with a "Skip For Now" button that bypasses required fields; skipping all 3 lands on `/creator/campaigns`. Fixed a second step-flag false-positive here too — `isVisible()` has no auto-wait, so calling it an instant after the OTP redirect read "not rendered yet" as "onboarding doesn't apply" and marked `accountCreated: true` while the run was actually stuck on `/onboarding/creator`; `completeOnboarding()` now waits for real render before checking, and onboarding is a hard-gated step like OTP, not a soft skip
- [x] Found and handled a recurring "Notifications Blocked" `role="dialog"` modal (unrelated to onboarding — the browser's notification permission) that intercepts clicks on the wizard and can reappear mid-interaction; `completeOnboarding()` now re-dismisses and retries around each click instead of trusting one upfront dismissal

## Next

- [ ] Fill `apiBaseUrl` in `environments.json` and emails in `users.json`
- [ ] Set `BRAND_PASSWORD` / `CREATOR_PASSWORD` in local `.env`
- [ ] Tune remaining `// TODO: verify locator` comments against sandbox (header icons, campaign cards, invitation-only wizard steps 2+)
- [ ] `register-creator.spec.ts` is still intermittently flaky: a `formSubmitted: false` timeout waiting for `/email-verification` was observed after repeated back-to-back runs against sandbox during this debugging session — looks like backend rate-limiting on rapid registrations from one IP rather than a client bug, but unconfirmed; avoid hammering sandbox with repeated runs until this is understood, and check with the backend team if it recurs in normal CI usage
- [ ] Verify brand's onboarding route/behavior — only the creator path (`/onboarding/creator`) has been confirmed live; `OnboardingPage`/`completeOnboarding()` may need role-specific handling once brand is checked
- [ ] Add a matching `register-brand.spec.ts` using `buildBrandRegistrationData`
- [ ] Add `AuthApi` register/OTP endpoints once the real API paths are known
- [ ] Campaigns UI specs using the new page objects + matching API client
- [ ] Proposals UI page + matching API client
- [ ] CI workflow after local runs are green
