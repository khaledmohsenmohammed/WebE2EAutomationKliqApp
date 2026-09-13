import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly identifierInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.identifierInput = page.getByLabel(/email|identifier|username/i).or(
      page.getByPlaceholder(/email|phone|username/i),
    );
    this.passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i));
    this.submitButton = page.getByRole('button', { name: /log in|sign in|login/i });
    this.errorMessage = page.getByRole('alert').or(page.getByText(/invalid|incorrect|wrong/i));
  }

  async open(): Promise<void> {
    await this.goto('/login');
  }

  async login(identifier: string, password: string): Promise<void> {
    await this.identifierInput.fill(identifier);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
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
