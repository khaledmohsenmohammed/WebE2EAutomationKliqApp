import { type Locator, type Page } from '@playwright/test';

/**
 * Brand settings — Payment Methods section (in-place swap, no new URL).
 */
export class PaymentMethodsSection {
  readonly heading: Locator;
  readonly addPaymentMethodButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /payment methods/i });
    // TODO: verify locator
    this.addPaymentMethodButton = page.getByRole('button', {
      name: /add (payment )?method|add card/i,
    });
  }

  async addPaymentMethod(): Promise<void> {
    await this.addPaymentMethodButton.click();
  }
}
