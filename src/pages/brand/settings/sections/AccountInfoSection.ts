import { type Locator, type Page } from '@playwright/test';

/**
 * Brand settings — Account Info section (in-place swap, no new URL).
 */
export class AccountInfoSection {
  readonly fullName: Locator;
  readonly email: Locator;
  readonly phoneNumber: Locator;
  readonly editButton: Locator;

  constructor(private readonly page: Page) {
    this.fullName = page.getByLabel(/full name/i);
    this.email = page.getByLabel(/^email$/i);
    this.phoneNumber = page.getByLabel(/phone number/i);
    this.editButton = page.getByRole('button', { name: /^edit$/i });
  }

  async startEdit(): Promise<void> {
    await this.editButton.click();
  }
}
