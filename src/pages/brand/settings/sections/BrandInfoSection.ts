import { type Locator, type Page } from '@playwright/test';

/**
 * Brand settings — Brand Info section (in-place swap, no new URL).
 */
export class BrandInfoSection {
  readonly heading: Locator;
  readonly editButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /brand info/i });
    // TODO: verify locator
    this.editButton = page.getByRole('button', { name: /^edit$/i });
  }

  async startEdit(): Promise<void> {
    await this.editButton.click();
  }
}
