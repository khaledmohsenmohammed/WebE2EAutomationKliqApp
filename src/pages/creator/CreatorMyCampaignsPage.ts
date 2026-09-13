import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { PaginationComponent } from '../base/components/PaginationComponent';
import { CampaignCardComponent } from '../shared/CampaignCardComponent';
import { CampaignTableComponent } from '../shared/CampaignTableComponent';
import { FilterTabsComponent } from '../shared/FilterTabsComponent';

const STATUS_TABS = [
  'All',
  'Applied',
  'Invited',
  'Negotiations',
  'Signed',
  'Paused',
  'Delivered',
  'Closed',
] as const;

/**
 * Creator "My Campaigns" list. Default landing after creator login.
 * Route: `/creator/campaigns`
 */
export class CreatorMyCampaignsPage extends BasePage {
  readonly statusTabs: FilterTabsComponent;
  readonly campaignTable: CampaignTableComponent;
  readonly pagination: PaginationComponent;
  readonly campaignTypeFilter: Locator;

  constructor(page: Page) {
    super(page);
    this.statusTabs = new FilterTabsComponent(page);
    this.campaignTable = new CampaignTableComponent(page);
    this.pagination = new PaginationComponent(page);
    // TODO: verify locator
    this.campaignTypeFilter = page.getByRole('combobox', { name: /campaign type/i }).or(
      page.getByRole('button', { name: /campaign type/i }),
    );
  }

  async open(): Promise<void> {
    await this.goto('/creator/campaigns');
  }

  async selectStatus(status: (typeof STATUS_TABS)[number]): Promise<void> {
    await this.statusTabs.select(status);
  }

  async filterByCampaignType(type: string): Promise<void> {
    await this.campaignTypeFilter.click();
    await this.page.getByRole('option', { name: type }).click();
  }

  cardByName(name: string | RegExp): CampaignCardComponent {
    // TODO: verify locator
    return new CampaignCardComponent(
      this.page.getByRole('article').filter({ hasText: name }).or(
        this.page.getByRole('listitem').filter({ hasText: name }),
      ),
    );
  }

  async openRowAction(campaignName: string | RegExp, action: string | RegExp): Promise<void> {
    await this.campaignTable.openRowAction(campaignName, action);
  }
}
