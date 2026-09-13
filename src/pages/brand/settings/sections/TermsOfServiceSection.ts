import { type Locator, type Page } from '@playwright/test';

/**
 * Brand settings — Terms of Service section (in-place swap, no new URL).
 * Left sub-nav tab label: "Terms of Service".
 */
export class TermsOfServiceSection {
  readonly heading: Locator;
  readonly content: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /terms of service/i });
    // TODO: verify locator
    this.content = page.getByRole('article').or(
      page.getByRole('region', { name: /terms of service/i }),
    );
  }
}
