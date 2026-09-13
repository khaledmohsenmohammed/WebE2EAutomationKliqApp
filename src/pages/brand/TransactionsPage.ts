import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { PaginationComponent } from '../base/components/PaginationComponent';
import { FilterTabsComponent } from '../shared/FilterTabsComponent';

const SUMMARY_CARDS = ['All', 'Open', 'Closed'] as const;
const STATUS_TABS = [
  'All',
  'Pending',
  'Pending Approval',
  'Completed',
  'Failed',
] as const;

/**
 * Brand transactions.
 * Route: `/brand/transactions`
 */
export class TransactionsPage extends BasePage {
  readonly statusTabs: FilterTabsComponent;
  readonly table: Locator;
  readonly pagination: PaginationComponent;

  constructor(page: Page) {
    super(page);
    this.statusTabs = new FilterTabsComponent(page);
    this.table = page.getByRole('table');
    this.pagination = new PaginationComponent(page);
  }

  async open(): Promise<void> {
    await this.goto('/brand/transactions');
  }

  summaryCard(name: (typeof SUMMARY_CARDS)[number]): Locator {
    // TODO: verify locator — summary cards may be buttons, articles, or static regions
    return this.page.getByRole('button', { name: new RegExp(`^${name}`, 'i') }).or(
      this.page.getByText(new RegExp(`^${name}$`, 'i')),
    );
  }

  async selectSummary(name: (typeof SUMMARY_CARDS)[number]): Promise<void> {
    await this.summaryCard(name).click();
  }

  async selectStatus(status: (typeof STATUS_TABS)[number]): Promise<void> {
    await this.statusTabs.select(status);
  }

  rowByCampaign(campaignName: string | RegExp): Locator {
    return this.table.getByRole('row').filter({ hasText: campaignName });
  }
}
