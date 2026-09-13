import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Post-registration onboarding wizard shown after OTP verification.
 * Route (creator): `/onboarding/creator`. Brand's equivalent route/behavior
 * is unverified — this page object and `completeOnboarding()` have only
 * been confirmed against the creator flow.
 *
 * Verified against sandbox: 3 steps ("Let's Get to Know You" — location +
 * category, "Connect your social accounts", "Mawthooq License"), each with
 * a "Skip For Now" button that bypasses its required fields entirely.
 * Skipping all 3 lands on a real dashboard route (`/creator/campaigns`).
 *
 * Gotcha: a "Notifications Blocked" `role="dialog"` modal (unrelated to
 * onboarding — the browser's notification permission) can cover the wizard
 * and intercepts clicks. It can also *reappear* mid-interaction — dismissing
 * it once up front isn't enough, so `completeOnboarding()` re-dismisses and
 * retries around every click rather than trusting a single dismissal to hold.
 * The dialog has two "Close"-named controls (an icon button and a full-width
 * CTA button, both with the same accessible name "Close"); `.last()` in DOM
 * order reliably picks the CTA over the icon.
 */
export class OnboardingPage extends BasePage {
  readonly skipButton: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    super(page);
    this.skipButton = page.getByRole('button', { name: /skip for now/i });
    this.nextButton = page.getByRole('button', { name: /^next$/i });
  }

  private isOnOnboardingRoute(): boolean {
    return /\/onboarding/i.test(this.page.url());
  }

  /** Dismisses the notification-permission dialog if currently visible (does not wait for it to appear). */
  private async dismissBlockingDialogIfPresent(): Promise<void> {
    if (await this.dialog().isVisible().catch(() => false)) {
      await this.dialog().getByRole('button').last().click({ timeout: 3000 }).catch(() => {});
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * Clicks `locator`, re-dismissing the notification dialog and retrying if
   * it reappears and intercepts the click, instead of trusting one upfront
   * dismissal to hold for the whole interaction.
   */
  private async clickDespiteBlockingDialog(locator: Locator, attempts = 5): Promise<void> {
    for (let i = 0; i < attempts - 1; i += 1) {
      await this.dismissBlockingDialogIfPresent();
      try {
        await locator.click({ timeout: 5000 });
        return;
      } catch {
        // Likely intercepted by a re-appearing dialog — loop and retry.
      }
    }
    // Final attempt: let a genuine failure (not the dialog) surface normally.
    await this.dismissBlockingDialogIfPresent();
    await locator.click();
  }

  /**
   * Clicks through the wizard preferring "Skip For Now" (bypasses required
   * fields we don't know how to fill) over "Next". Bounded by `maxSteps` so
   * an unexpected screen can't hang the test.
   *
   * Each iteration waits for the dialog or a wizard button to actually
   * render before checking for it — a bare `isVisible()` doesn't auto-wait,
   * and calling it an instant too early (mid-redirect from `/onboarding` to
   * `/onboarding/creator`) reads "not rendered yet" as "nothing here" and
   * breaks out immediately, exactly the race that caused a false
   * `onboardingCompleted: true` before this was fixed.
   */
  async completeOnboarding(maxSteps = 5): Promise<void> {
    for (let i = 0; i < maxSteps && this.isOnOnboardingRoute(); i += 1) {
      await this.dialog()
        .or(this.skipButton)
        .or(this.nextButton)
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
        .catch(() => {});

      await this.dismissBlockingDialogIfPresent();

      if (await this.skipButton.isVisible().catch(() => false)) {
        await this.clickDespiteBlockingDialog(this.skipButton);
      } else if (await this.nextButton.isVisible().catch(() => false)) {
        await this.clickDespiteBlockingDialog(this.nextButton);
      } else {
        break;
      }
      await this.page.waitForTimeout(300);
    }
  }

  async expectOnboardingComplete(): Promise<void> {
    await expect(this.page).not.toHaveURL(/\/onboarding/i);
  }
}
