import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Post-registration onboarding wizard shown after OTP verification.
 * Route (creator): `/onboarding/creator`.
 *
 * Verified against sandbox — creator: 3 steps ("Let's Get to Know You" —
 * location + category, "Connect your social accounts", "Mawthooq License"),
 * each with a "Skip For Now" button that bypasses its required fields
 * entirely. Skipping all 3 lands on a real dashboard route (`/creator/campaigns`).
 *
 * Verified against sandbox — brand: no wizard at all. OTP verification
 * redirects straight to the dashboard (`/brand/campaigns`-style), with only
 * a dismissible "Profile Incomplete" banner nudging profile completion —
 * `completeOnboarding()` is effectively a no-op for brand, resolved by the
 * URL-change race below rather than ever finding a button to click.
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
   * Each iteration waits for either a wizard control to render or the app to
   * navigate away from `/onboarding` on its own — brand registration has no
   * wizard at all (confirmed live: OTP verification lands straight on the
   * dashboard), so a bare `waitFor` on the buttons would burn its full
   * timeout every time for brand with nothing to find. Racing it against
   * the URL leaving `/onboarding` lets that case resolve almost instantly
   * instead of eating most of the test's time budget. Each waiter is caught
   * on its own *before* the race: `Promise.race` does not cancel the loser,
   * and a `.catch()` only on the race leaves that later timeout as an
   * unhandled rejection (worse across loop iterations). A bare `isVisible()`
   * alone doesn't auto-wait, and calling it an instant too early
   * (mid-redirect from `/onboarding` to `/onboarding/creator`) reads "not
   * rendered yet" as "nothing here" and breaks out immediately — exactly the
   * race that caused a false `onboardingCompleted: true` before this was fixed.
   */
  async completeOnboarding(maxSteps = 5): Promise<void> {
    for (let i = 0; i < maxSteps && this.isOnOnboardingRoute(); i += 1) {
      const controlAppeared = this.dialog()
        .or(this.skipButton)
        .or(this.nextButton)
        .first()
        .waitFor({ state: 'visible', timeout: 8000 })
        .catch(() => {});
      const leftOnboarding = this.page
        .waitForURL((url) => !/\/onboarding/i.test(url.toString()), { timeout: 8000 })
        .catch(() => {});
      await Promise.race([controlAppeared, leftOnboarding]);

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
