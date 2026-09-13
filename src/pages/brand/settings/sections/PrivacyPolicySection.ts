import { type Locator, type Page } from '@playwright/test';

/**
 * Brand settings — Privacy Policy section (in-place swap, no new URL).
 * Left sub-nav tab label: "Privacy Policy".
 */
export class PrivacyPolicySection {
  readonly heading: Locator;
  readonly content: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /privacy policy/i });
    // TODO: verify locator
    this.content = page.getByRole('article').or(page.getByRole('region', { name: /privacy policy/i }));
  }
}
