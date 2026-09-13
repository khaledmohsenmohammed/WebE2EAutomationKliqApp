import type { OnboardingPage } from '../pages/auth/OnboardingPage';
import type { OtpPage } from '../pages/auth/OtpPage';
import type { RegisterPage } from '../pages/auth/RegisterPage';
import type { RegistrationData } from '../utils/registrationData.factory';

/**
 * Step flags for a brand/creator registration run. Updated in place as
 * `registerAndOnboard` progresses, so a failed run still tells you exactly
 * which step it reached — persist it (e.g. via `appendGenerated`) even when
 * the flow throws.
 */
export type RegistrationProgress = {
  formSubmitted: boolean;
  otpVerified: boolean;
  onboardingCompleted: boolean;
  accountCreated: boolean;
  startedAt: string;
  updatedAt: string;
  error?: string;
};

/**
 * One row of the shared `testdata/generated/registrations.json` log (see
 * `appendGenerated` in `src/config/testdata.ts`). `type` is promoted out of
 * `data.role` to a top-level field so entries can be filtered by role
 * without drilling into `data`.
 */
export type RegistrationLogEntry = {
  type: RegistrationData['role'];
  data: RegistrationData;
  otpCode: string;
  progress: RegistrationProgress;
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
 * Drives a full brand-or-creator registration: fill + submit the form, clear
 * the OTP step, clear the onboarding wizard, then mark the account created.
 * Mutates and returns `progress` at every stage so the caller can persist it
 * in a `finally` block regardless of outcome.
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
    if (data.role === 'brand') {
      await registerPage.registerBrand(data);
    } else {
      await registerPage.registerCreator(data);
    }
    // Confirmed against sandbox: a successful submit lands on
    // `/email-verification`. Waiting for it (rather than trusting that the
    // click didn't throw) is what catches a rejected submission — e.g. the
    // phone-format bug this flow originally missed.
    await registerPage.waitForUrl(/email-verification/i);
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
  }

  return progress;
}
