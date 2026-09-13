import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Email verification (OTP) screen shown after submitting the registration
 * form. Route: `/email-verification?email=...&user_id=...`.
 *
 * Verified against sandbox: renders 6 unlabeled single-digit textboxes (no
 * accessible name — selected by index), a "Verify" button that's disabled
 * until all 6 are filled, and a "Resend" button. Non-production environments
 * accept a static code (`src/config/env.ts` → `requireTestOtpCode()`) rather
 * than a real one, which is what specs should pass to `enterCodeAndSubmit`.
 */
export class OtpPage extends BasePage {
  readonly codeInputs: Locator;
  readonly resendCodeButton: Locator;
  readonly verifyButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.codeInputs = page.getByRole('textbox');
    this.resendCodeButton = page.getByRole('button', { name: /resend/i });
    this.verifyButton = page.getByRole('button', { name: /verify|confirm/i });
    this.errorMessage = page.getByRole('alert');
  }

  /**
   * True while the 6-box code entry is visible. Not used to gate
   * `registerAndOnboard` (OTP is mandatory there — see `waitForUrl` in
   * `registration.flow.ts`); kept as a utility for specs that need it directly.
   */
  async isVisible(): Promise<boolean> {
    return this.codeInputs.first().isVisible().catch(() => false);
  }

  async enterCode(code: string): Promise<void> {
    const count = await this.codeInputs.count();
    for (let i = 0; i < count && i < code.length; i += 1) {
      await this.codeInputs.nth(i).fill(code[i]);
    }
  }

  async submit(): Promise<void> {
    await this.verifyButton.click();
  }

  async enterCodeAndSubmit(code: string): Promise<void> {
    await this.enterCode(code);
    await this.submit();
  }

  async resendCode(): Promise<void> {
    await this.resendCodeButton.click();
  }

  async expectVerified(): Promise<void> {
    await expect(this.page).not.toHaveURL(/email-verification/i);
  }

  async expectErrorVisible(): Promise<void> {
    await expect(this.errorMessage.first()).toBeVisible();
  }
}
