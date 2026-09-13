import { type Locator, type Page } from '@playwright/test';

/**
 * Nested "Rate Card" block inside creator Account Info (price per content type).
 */
export class RateCardComponent {
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /rate card/i }).or(page.getByText(/rate card/i));
  }

  rateFor(contentType: string | RegExp): Locator {
    // TODO: verify locator
    return this.page.getByRole('row').filter({ hasText: contentType }).or(
      this.page.getByLabel(contentType),
    );
  }

  async setRate(contentType: string | RegExp, amount: string): Promise<void> {
    // TODO: verify locator
    const field = this.rateFor(contentType).getByRole('textbox').or(
      this.page.getByLabel(contentType),
    );
    await field.fill(amount);
  }
}
