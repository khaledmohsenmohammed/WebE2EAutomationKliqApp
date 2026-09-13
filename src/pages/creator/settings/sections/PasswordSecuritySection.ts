import { type Locator, type Page } from '@playwright/test';

/**
 * Creator settings — Password & Security section (in-place swap, no new URL).
 */
export class PasswordSecuritySection {
  readonly heading: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /password/i });
    // TODO: verify locator
    this.currentPasswordInput = page.getByLabel(/current password/i);
    // TODO: verify locator
    this.newPasswordInput = page.getByLabel(/new password/i);
    // TODO: verify locator
    this.confirmPasswordInput = page.getByLabel(/confirm (new )?password/i);
    // TODO: verify locator
    this.saveButton = page.getByRole('button', { name: /save|update password/i });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.currentPasswordInput.fill(currentPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(newPassword);
    await this.saveButton.click();
  }
}
