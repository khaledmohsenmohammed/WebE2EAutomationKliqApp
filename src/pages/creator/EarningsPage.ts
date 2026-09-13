import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { PaginationComponent } from '../base/components/PaginationComponent';

const STAT_CARDS = [
  'Total Earnings',
  'Ready for Payout',
  'Active Campaigns',
  'Cancelled',
] as const;

/**
 * Creator earnings dashboard.
 * Route: `/creator/earnings`
 */
export class EarningsPage extends BasePage {
  readonly table: Locator;
  readonly pagination: PaginationComponent;

  constructor(page: Page) {
    super(page);
    this.table = page.getByRole('table');
    this.pagination = new PaginationComponent(page);
  }

  async open(): Promise<void> {
    await this.goto('/creator/earnings');
  }

  statCard(name: (typeof STAT_CARDS)[number]): Locator {
    // TODO: verify locator — stat cards may be articles or static regions with a heading
    return this.page.getByRole('article').filter({ hasText: name }).or(
      this.page.getByText(name, { exact: true }),
    );
  }

  rowByCampaign(campaignName: string | RegExp): Locator {
    return this.table.getByRole('row').filter({ hasText: campaignName });
  }
}
