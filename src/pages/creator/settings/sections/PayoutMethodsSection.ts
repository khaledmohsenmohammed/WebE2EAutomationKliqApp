import { type Locator, type Page } from '@playwright/test';

/**
 * Creator settings — Payout Methods section (in-place swap, no new URL).
 */
export class PayoutMethodsSection {
  readonly heading: Locator;
  readonly addPayoutMethodButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /payout methods/i });
    // TODO: verify locator
    this.addPayoutMethodButton = page.getByRole('button', {
      name: /add (payout )?method|add bank/i,
    });
  }

  async addPayoutMethod(): Promise<void> {
    await this.addPayoutMethodButton.click();
  }
}
