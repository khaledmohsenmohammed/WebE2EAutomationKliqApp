import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Forgot / reset password screen.
 * Route: `/forgot-password`
 */
export class ForgotPasswordPage extends BasePage {
  readonly heading: Locator;
  readonly returnToLoginButton: Locator;
  readonly usePhoneNumberButton: Locator;
  readonly useEmailAddressButton: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly sendCodeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /reset your password/i });
    this.returnToLoginButton = page.getByRole('button', { name: /return to login/i });
    this.usePhoneNumberButton = page.getByRole('button', { name: /use phone number/i });
    this.useEmailAddressButton = page.getByRole('button', { name: /use email address/i });
    this.emailInput = page.getByPlaceholder(/enter your email/i);
    // TODO: verify locator — phone field after toggling "Use Phone Number"
    this.phoneInput = page.getByPlaceholder('+966 342 423 42');
    this.sendCodeButton = page.getByRole('button', { name: /send verification code/i });
  }

  async open(): Promise<void> {
    await this.goto('/forgot-password');
  }

  async sendCodeToEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.sendCodeButton.click();
  }

  async usePhoneNumber(): Promise<void> {
    await this.usePhoneNumberButton.click();
  }

  async returnToLogin(): Promise<void> {
    await this.returnToLoginButton.click();
  }
}
