import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Login screen.
 * Route: `/login`
 */
export class LoginPage extends BasePage {
  readonly identifierInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly usePhoneNumberButton: Locator;
  readonly useEmailAddressButton: Locator;
  readonly phoneInput: Locator;
  readonly countryCodeButton: Locator;
  readonly showPasswordButton: Locator;
  readonly googleButton: Locator;
  readonly facebookButton: Locator;
  readonly forgotPasswordButton: Locator;
  readonly registerNowButton: Locator;

  constructor(page: Page) {
    super(page);
    this.identifierInput = page.getByLabel(/email|identifier|username/i).or(
      page.getByPlaceholder(/email|phone|username/i),
    );
    this.passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i));
    this.submitButton = page.getByRole('button', { name: /log in|sign in|login/i });
    this.errorMessage = page.getByRole('alert').or(page.getByText(/invalid|incorrect|wrong/i));
    this.usePhoneNumberButton = page.getByRole('button', { name: /use phone number/i });
    this.useEmailAddressButton = page.getByRole('button', { name: /use email address/i });
    this.phoneInput = page.getByPlaceholder('+966 342 423 42');
    this.countryCodeButton = page.getByRole('button', { name: '🇸🇦' });
    this.showPasswordButton = page.getByRole('button', { name: /show password|hide password/i });
    this.googleButton = page.getByRole('button', { name: /sign in with google/i });
    this.facebookButton = page.getByRole('button', { name: /sign in with facebook/i });
    this.forgotPasswordButton = page.getByRole('button', { name: /forgot password/i });
    this.registerNowButton = page.getByRole('button', { name: /register now/i });
  }

  async open(): Promise<void> {
    await this.goto('/login');
  }

  async login(identifier: string, password: string): Promise<void> {
    await this.identifierInput.fill(identifier);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async usePhoneNumber(): Promise<void> {
    await this.usePhoneNumberButton.click();
  }

  async useEmailAddress(): Promise<void> {
    await this.useEmailAddressButton.click();
  }

  async loginWithPhone(phone: string, password: string): Promise<void> {
    await this.usePhoneNumber();
    await this.phoneInput.fill(phone);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async signInWithGoogle(): Promise<void> {
    await this.googleButton.click();
  }

  async signInWithFacebook(): Promise<void> {
    await this.facebookButton.click();
  }

  async openForgotPassword(): Promise<void> {
    await this.forgotPasswordButton.click();
  }

  async openRegister(): Promise<void> {
    await this.registerNowButton.click();
  }

  async expectErrorVisible(): Promise<void> {
    await expect(this.errorMessage.first()).toBeVisible();
  }

  async expectLoggedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL(/login/i);
  }

  async expectStillOnLogin(): Promise<void> {
    await expect(this.page).toHaveURL(/login/i);
  }
}
