import { appendGenerated, updateGenerated } from '../config/testdata';
import type { OnboardingPage } from '../pages/auth/OnboardingPage';
import type { OtpPage } from '../pages/auth/OtpPage';
import type { RegisterPage } from '../pages/auth/RegisterPage';
import {
  buildBrandRegistrationData,
  buildCreatorRegistrationData,
  type RegistrationData,
} from '../utils/registrationData.factory';

/** Shared dated log under testdata/generated/registrations.json. */
const GENERATED_ACCOUNTS_FILE = 'registrations';

/** Sandbox data collisions (duplicate phone/email) and phone-format rejections get this many submit attempts before the case fails. */
const MAX_REGISTRATION_ATTEMPTS = 3;

/**
 * Step flags for a brand/creator registration run. Updated in place as
 * `registerAndOnboard` progresses, so a failed run still tells you exactly
 * which step it reached. The flow persists this into
 * `testdata/generated/registrations.json` itself (including on throw).
 */
export type RegistrationProgress = {
  formSubmitted: boolean;
  otpVerified: boolean;
  onboardingCompleted: boolean;
  accountCreated: boolean;
  startedAt: string;
  updatedAt: string;
  error?: string;
  /** Timestamp key of this run's row in registrations.json, set after persist. */
  logKey?: string;
};

/** One mutation applied to a generated account after the initial persist. */
export type AccountUpdate = {
  at: string;
  kind: string;
  details?: Record<string, unknown>;
};

/**
 * One row of the shared `testdata/generated/registrations.json` log (see
 * `appendGenerated` in `src/config/testdata.ts`). `type` is promoted out of
 * `data.role` to a top-level field so entries can be filtered by role
 * without drilling into `data`. Later mutations of the same sandbox
 * account are appended to `updates` rather than creating a second row.
 */
export type RegistrationLogEntry = {
  type: RegistrationData['role'];
  data: RegistrationData;
  otpCode: string;
  progress: RegistrationProgress;
  updates?: AccountUpdate[];
};

export type RegistrationLog = Record<string, RegistrationLogEntry>;

export function createInitialProgress(): RegistrationProgress {
  const now = new Date().toISOString();
  return {
    formSubmitted: false,
    otpVerified: false,
    onboardingCompleted: false,
    accountCreated: false,
    startedAt: now,
    updatedAt: now,
  };
}

export type RegistrationPages = {
  registerPage: RegisterPage;
  otpPage: OtpPage;
  onboardingPage: OnboardingPage;
};

function touch(progress: RegistrationProgress): void {
  progress.updatedAt = new Date().toISOString();
}

// eslint-disable-next-line no-control-regex
const ANSI_PATTERN = /\u001b\[[0-9;]*m/g;

/** Strips ANSI color codes so a saved error reads cleanly from the JSON file. */
function cleanErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  return message.replace(ANSI_PATTERN, '');
}

/**
 * Fills and submits the register form, reacting to whichever outcome
 * `RegisterPage.waitForSubmitOutcome` reports:
 *  - `success` — done.
 *  - `duplicate-phone` / `duplicate-email` — the randomly generated value
 *    collided with an existing sandbox account; regenerate that field only
 *    and resubmit.
 *  - `invalid-phone` — the phone field rejected the generated number's
 *    format; regenerate it and resubmit.
 * Mutates `data.phone`/`data.email` in place (same convention as
 * `progress` below) so a retry is reflected in whatever the caller logs
 * afterward. Reloads the register page between attempts since a stale
 * duplicate-account banner or the previous invalid value can otherwise
 * linger in the DOM. Throws once `MAX_REGISTRATION_ATTEMPTS` is spent, which
 * fails the test case rather than looping forever on real product bugs.
 */
async function submitRegistrationForm(
  registerPage: RegisterPage,
  data: RegistrationData,
): Promise<void> {
  for (let attempt = 1; attempt <= MAX_REGISTRATION_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      await registerPage.open();
    }

    if (data.role === 'brand') {
      await registerPage.registerBrand(data);
    } else {
      await registerPage.registerCreator(data);
    }

    const outcome = await registerPage.waitForSubmitOutcome();
    if (outcome === 'success') {
      return;
    }

    if (attempt === MAX_REGISTRATION_ATTEMPTS) {
      throw new Error(
        `Registration form was still rejected after ${MAX_REGISTRATION_ATTEMPTS} attempts (last reason: ${outcome}).`,
      );
    }

    const regenerated = data.role === 'brand' ? buildBrandRegistrationData() : buildCreatorRegistrationData();
    if (outcome === 'duplicate-phone' || outcome === 'invalid-phone') {
      data.phone = regenerated.phone;
    } else if (outcome === 'duplicate-email') {
      data.email = regenerated.email;
    }
  }
}

async function persistGeneratedAccount(
  data: RegistrationData,
  otpCode: string,
  progress: RegistrationProgress,
): Promise<void> {
  const { key } = await appendGenerated<RegistrationLogEntry>(GENERATED_ACCOUNTS_FILE, {
    type: data.role,
    data,
    otpCode,
    progress,
  });
  progress.logKey = key;
}

/**
 * Patches the same registrations.json row that `registerAndOnboard` wrote.
 * Call this after any later mutation of that sandbox account (profile
 * completion, settings, etc.) so the log stays the source of truth for
 * what was created *and* what was changed. Throws if persist never ran.
 */
export async function recordAccountUpdate(
  progress: RegistrationProgress,
  update: { kind: string; details?: Record<string, unknown> },
): Promise<void> {
  if (!progress.logKey) {
    throw new Error(
      'Cannot record an account update because the registration was not persisted (missing logKey).',
    );
  }
  touch(progress);
  await updateGenerated<RegistrationLogEntry>(GENERATED_ACCOUNTS_FILE, progress.logKey, (entry) => ({
    ...entry,
    progress: { ...progress },
    updates: [
      ...(entry.updates ?? []),
      { at: new Date().toISOString(), kind: update.kind, details: update.details },
    ],
  }));
}

/**
 * Drives a full brand-or-creator registration: fill + submit the form, clear
 * the OTP step, clear the onboarding wizard, then mark the account created.
 * Always appends a row to `testdata/generated/registrations.json` (success
 * or failure) so specs must not also call `appendGenerated('registrations')`
 * — that would double-log. Later mutations of the same account go through
 * `recordAccountUpdate`.
 *
 * Every flag is only set after a hard assertion that the app actually moved
 * forward (a URL change, not merely "the click didn't throw"). This matters
 * because a soft `isVisible()` check has no auto-wait — called an instant
 * too early (e.g. right after a redirect starts), it reads "not rendered
 * yet" as "this step doesn't apply here" and marks it passed, hiding a real
 * failure. That exact race previously produced a false `accountCreated:
 * true` even though the run was stuck on the onboarding screen. Confirmed
 * against sandbox: onboarding always appears for creator registration at
 * `/onboarding/creator` — brand's path is unverified.
 */
export async function registerAndOnboard(
  pages: RegistrationPages,
  data: RegistrationData,
  otpCode: string,
  progress: RegistrationProgress = createInitialProgress(),
): Promise<RegistrationProgress> {
  const { registerPage, otpPage, onboardingPage } = pages;

  try {
    await registerPage.open();
    // Confirmed against sandbox: a successful submit lands on
    // `/email-verification`. Racing that redirect against the duplicate and
    // validation outcomes (rather than trusting that the click didn't
    // throw) is what catches a rejected submission — e.g. the phone-format
    // bug this flow originally missed.
    await submitRegistrationForm(registerPage, data);
    progress.formSubmitted = true;
    touch(progress);

    await otpPage.enterCodeAndSubmit(otpCode);
    await otpPage.expectVerified();
    progress.otpVerified = true;
    touch(progress);

    await onboardingPage.completeOnboarding();
    await onboardingPage.expectOnboardingComplete();
    progress.onboardingCompleted = true;
    progress.accountCreated = true;
    touch(progress);
  } catch (err) {
    progress.error = cleanErrorMessage(err);
    touch(progress);
    throw err;
  } finally {
    await persistGeneratedAccount(data, otpCode, progress);
  }

  return progress;
}
