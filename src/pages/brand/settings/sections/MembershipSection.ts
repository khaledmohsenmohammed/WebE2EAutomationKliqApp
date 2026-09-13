import { type Locator, type Page } from '@playwright/test';

/**
 * Brand settings — Membership section (in-place swap, no new URL).
 */
export class MembershipSection {
  readonly heading: Locator;
  readonly planName: Locator;
  readonly upgradeButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /membership/i });
    // TODO: verify locator
    this.planName = page.getByText(/plan|membership/i).first();
    // TODO: verify locator
    this.upgradeButton = page.getByRole('button', { name: /upgrade|manage/i });
  }

  async upgrade(): Promise<void> {
    await this.upgradeButton.click();
  }
}
