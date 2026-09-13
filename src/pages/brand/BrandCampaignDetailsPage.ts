import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Brand campaign details, opened via "View Details" on a campaign card or table row.
 * Route: `/brand/campaigns/:id` — TODO: verify path.
 */
export class BrandCampaignDetailsPage extends BasePage {
  readonly heading: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading').first();
    this.backButton = page.getByRole('button', { name: /back/i }).or(
      page.getByRole('link', { name: /back/i }),
    );
  }

  async open(campaignId: string): Promise<void> {
    await this.goto(`/brand/campaigns/${campaignId}`);
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
  }
}
