import { type Locator, type Page } from '@playwright/test';

/**
 * Creator settings — Terms and Conditions section (in-place swap, no new URL).
 * Left sub-nav tab label: "Terms and Conditions".
 */
export class TermsAndConditionsSection {
  readonly heading: Locator;
  readonly content: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /terms and conditions/i });
    // TODO: verify locator
    this.content = page.getByRole('article').or(
      page.getByRole('region', { name: /terms and conditions/i }),
    );
  }
}
