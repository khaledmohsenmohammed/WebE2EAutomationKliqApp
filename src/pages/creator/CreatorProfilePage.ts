import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Creator public profile.
 * Route: `/creator/profile` — TODO: verify path.
 */
export class CreatorProfilePage extends BasePage {
  readonly heading: Locator;
  readonly editButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading').first();
    // TODO: verify locator
    this.editButton = page.getByRole('button', { name: /edit profile|^edit$/i });
  }

  async open(): Promise<void> {
    await this.goto('/creator/profile');
  }

  async startEdit(): Promise<void> {
    await this.editButton.click();
  }
}
