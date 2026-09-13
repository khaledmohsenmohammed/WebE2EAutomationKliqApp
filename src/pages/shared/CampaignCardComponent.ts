import { type Locator } from '@playwright/test';

/**
 * Repeated campaign card UI used by brand campaigns, creator my-campaigns, and public campaigns.
 */
export class CampaignCardComponent {
  readonly viewDetailsButton: Locator;

  constructor(readonly root: Locator) {
    this.viewDetailsButton = root.getByRole('button', { name: /view details/i }).or(
      root.getByRole('link', { name: /view details/i }),
    );
  }

  title(text: string | RegExp): Locator {
    return this.root.getByText(text);
  }

  async viewDetails(): Promise<void> {
    await this.viewDetailsButton.click();
  }
}
