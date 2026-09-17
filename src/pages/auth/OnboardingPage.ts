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
 *
 * Step 1 fields, verified live on sandbox: the avatar picker button has no
 * accessible name or backing `<input type="file">` — clicking it opens a
 * native OS file-chooser dialog instead (caught via Playwright's
 * `filechooser` event). Location/category are autocomplete inputs whose
 * suggestion rows are plain elements (no `option`/`listitem` role) — matched
 * by exact visible text instead.
 */
export class OnboardingPage extends BasePage {
  readonly skipButton: Locator;
  readonly nextButton: Locator;
  /**
   * Avatar picker. No accessible name and no `<input type="file">` in the
   * DOM — clicking it triggers a native file-chooser event directly.
   * `:has(svg.lucide-user)` is a CSS fallback (no ARIA-role alternative
   * exists), the same tolerated exception as `input[type="file"]` in
   * `PublicCampaignDetailsStep.uploadFiles()`.
   */
  readonly avatarButton: Locator;
  /** Placeholder confirmed live: "Enter your country and city". */
  readonly locationInput: Locator;
  /** Placeholder confirmed live: "Start typing to search...". */
  readonly categoryInput: Locator;

  constructor(page: Page) {
    super(page);
    this.skipButton = page.getByRole('button', { name: /skip for now/i });
    this.nextButton = page.getByRole('button', { name: /^next$/i });
    this.avatarButton = page.locator('button:has(svg.lucide-user)');
    this.locationInput = page.getByLabel(/^location$/i).or(page.getByPlaceholder(/enter your country and city/i));
    this.categoryInput = page.getByLabel(/select your category/i).or(page.getByPlaceholder(/start typing to search/i));
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
   * unhandled rejection (worse across loop iterations).
   *
   * The notifications dialog is allowed to win that first race, but that
   * must not be treated as "the wizard is ready" or as "there is nothing to
   * skip". OTP lands on `/onboarding` and then redirects to
   * `/onboarding/creator`; dismissing the dialog an instant too early used
   * to hit `else { break }` because Skip/Next had not rendered yet, after
   * which `expectOnboardingComplete()` failed while the wizard finished
   * loading (URL still `/onboarding/creator`, Step 1 still on screen).
   * After dismissing, wait for Skip/Next for real; if they are still not
   * there, `continue` and retry instead of bailing out. After a click, wait
   * for the URL to leave onboarding or the action to go hidden (next step)
   * rather than a fixed sleep.
   */
  async completeOnboarding(maxSteps = 5): Promise<void> {
    const wizardAction = this.skipButton.or(this.nextButton).first();

    for (let i = 0; i < maxSteps && this.isOnOnboardingRoute(); i += 1) {
      const controlAppeared = this.dialog()
        .or(wizardAction)
        .first()
        .waitFor({ state: 'visible', timeout: 8000 })
        .catch(() => {});
      const leftOnboarding = this.page
        .waitForURL((url) => !/\/onboarding/i.test(url.toString()), { timeout: 8000 })
        .catch(() => {});
      await Promise.race([controlAppeared, leftOnboarding]);

      if (!this.isOnOnboardingRoute()) {
        return;
      }

      await this.dismissBlockingDialogIfPresent();

      try {
        await wizardAction.waitFor({ state: 'visible', timeout: 8000 });
      } catch {
        continue;
      }

      const stepHeading = this.page
        .getByRole('heading', {
          level: 1,
          name: /let's get to know you|connect your social|mawthooq/i,
        })
        .first();
      const headingBefore = (await stepHeading.textContent().catch(() => '')) ?? '';

      if (await this.skipButton.isVisible()) {
        await this.clickDespiteBlockingDialog(this.skipButton);
      } else {
        await this.clickDespiteBlockingDialog(this.nextButton);
      }

      // Skip stays visible on every step, so waiting for it to hide would
      // always burn the timeout. The step's level-1 heading changing — or
      // the URL leaving /onboarding on the last skip — is the real signal.
      await Promise.race([
        this.page
          .waitForURL((url) => !/\/onboarding/i.test(url.toString()), { timeout: 5000 })
          .catch(() => {}),
        headingBefore
          ? expect(stepHeading)
              .not.toHaveText(headingBefore, { timeout: 5000 })
              .catch(() => {})
          : Promise.resolve(),
      ]);
    }
  }

  async expectOnboardingComplete(): Promise<void> {
    await expect(this.page).not.toHaveURL(/\/onboarding/i, { timeout: 15_000 });
  }

  async uploadProfileImage(filePath: string): Promise<void> {
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.avatarButton.click(),
    ]);
    await fileChooser.setFiles(filePath);
  }

  /**
   * Fills the location field and, if the typed value renders an exact-text
   * suggestion, clicks it. Suggestion rows are plain elements (no
   * `option`/`listitem` role) and can include unrelated rows that merely
   * *contain* the query as a substring (e.g. typing "Egypt" also surfaces
   * "Egyptian Bazaar, ... Türkiye") — exact-text matching avoids picking one
   * of those by accident. Falls through silently if no exact match renders,
   * leaving the typed free text as-is.
   */
  async fillLocation(location: string): Promise<void> {
    await this.locationInput.click();
    await this.locationInput.fill(location);
    const suggestion = this.page.getByText(location, { exact: true }).first();
    if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
      await suggestion.click();
    }
  }

  /**
   * Types the category and clicks its exact-text suggestion (same plain-row,
   * no-ARIA-role shape as `fillLocation`). Selecting a niche leaves its
   * suggestions dropdown open — ready to pick more, up to 3 — and it can
   * overlay/intercept the Next button, so this closes it afterward by
   * moving focus to the step heading.
   */
  async selectCategory(name: string): Promise<void> {
    await this.categoryInput.click();
    await this.categoryInput.fill(name);
    await this.page.getByText(name, { exact: true }).first().click();
    await this.page.getByRole('heading', { name: /let's get to know you/i }).first().click();
  }

  /**
   * Fills Step 1 ("Let's Get to Know You") for real — profile image,
   * location, category — then advances via Next. Reuses
   * `clickDespiteBlockingDialog()` for the Next click since the same
   * "Notifications Blocked" dialog documented on this class can intercept here too.
   */
  async completeProfileStepOne(input: {
    imagePath: string;
    location: string;
    category: string;
  }): Promise<void> {
    await this.dismissBlockingDialogIfPresent();
    await this.uploadProfileImage(input.imagePath);
    await this.fillLocation(input.location);
    await this.selectCategory(input.category);
    await this.clickDespiteBlockingDialog(this.nextButton);
  }

  /** Confirms Step 1 was accepted and the wizard advanced to Step 2 ("Connect Your Social Accounts"). */
  async expectStepTwoVisible(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: /connect your social accounts/i }),
    ).toBeVisible();
  }
}
