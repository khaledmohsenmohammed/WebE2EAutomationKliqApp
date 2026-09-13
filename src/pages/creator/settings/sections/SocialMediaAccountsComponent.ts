import { type Locator, type Page } from '@playwright/test';

const PLATFORMS = [
  'Tiktok',
  'Snapchat',
  'Instagram',
  'X',
  'Facebook',
  'Youtube',
] as const;

/**
 * Nested "Social Media Accounts" block inside creator Account Info.
 */
export class SocialMediaAccountsComponent {
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /social media accounts/i }).or(
      page.getByText(/social media accounts/i),
    );
  }

  platformRow(platform: (typeof PLATFORMS)[number]): Locator {
    // TODO: verify locator
    return this.page.getByRole('listitem').filter({ hasText: platform }).or(
      this.page.getByText(platform, { exact: true }),
    );
  }

  async connect(platform: (typeof PLATFORMS)[number]): Promise<void> {
    // TODO: verify locator
    await this.platformRow(platform).getByRole('button', { name: /connect|link|add/i }).click();
  }
}
