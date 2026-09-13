import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { PaginationComponent } from '../base/components/PaginationComponent';
import { CampaignCardComponent } from '../shared/CampaignCardComponent';
import { CampaignTableComponent } from '../shared/CampaignTableComponent';
import { FilterTabsComponent } from '../shared/FilterTabsComponent';

const STATUS_TABS = [
  'All',
  'Draft',
  'Created',
  'In Progress',
  'Paused',
  'Done',
  'Completed',
] as const;

/**
 * Brand campaigns list (status tabs, type filter, cards + table, pagination).
 * Default landing after brand login.
 * Route: `/brand/dashboard` (login page prefetches this path; confirm if campaigns also live at `/brand/campaigns`).
 */
export class BrandCampaignsListPage extends BasePage {
  readonly statusTabs: FilterTabsComponent;
  readonly campaignTable: CampaignTableComponent;
  readonly pagination: PaginationComponent;
  readonly campaignTypeFilter: Locator;
  readonly searchInput: Locator;
  readonly createCampaignButton: Locator;

  constructor(page: Page) {
    super(page);
    this.statusTabs = new FilterTabsComponent(page);
    this.campaignTable = new CampaignTableComponent(page);
    this.pagination = new PaginationComponent(page);
    // TODO: verify locator — Campaign Type may be a combobox, select, or filter button
    this.campaignTypeFilter = page.getByRole('combobox', { name: /campaign type/i }).or(
      page.getByRole('button', { name: /campaign type/i }),
    );
    this.searchInput = page.getByPlaceholder(/search/i).or(page.getByLabel(/search/i));
    this.createCampaignButton = page.getByRole('button', { name: /create campaign|new campaign/i });
  }

  async open(): Promise<void> {
    await this.goto('/brand/dashboard');
  }

  async selectStatus(status: (typeof STATUS_TABS)[number]): Promise<void> {
    await this.statusTabs.select(status);
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async filterByCampaignType(type: string): Promise<void> {
    await this.campaignTypeFilter.click();
    await this.page.getByRole('option', { name: type }).click();
  }

  cardByName(name: string | RegExp): CampaignCardComponent {
    // TODO: verify locator — card root may be an article, listitem, or generic region
    return new CampaignCardComponent(
      this.page.getByRole('article').filter({ hasText: name }).or(
        this.page.getByRole('listitem').filter({ hasText: name }),
      ),
    );
  }

  async viewDetails(name: string | RegExp): Promise<void> {
    await this.campaignTable.viewDetails(name);
  }

  async startCreateCampaign(): Promise<void> {
    await this.createCampaignButton.click();
  }
}
