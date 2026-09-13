import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { PaginationComponent } from '../base/components/PaginationComponent';
import { CampaignCardComponent } from '../shared/CampaignCardComponent';
import { CampaignTableComponent } from '../shared/CampaignTableComponent';
import { FilterTabsComponent } from '../shared/FilterTabsComponent';

/**
 * Public campaigns marketplace for creators.
 * Route: `/creator/public-campaigns`
 */
export class PublicCampaignsPage extends BasePage {
  readonly contentTypeTabs: FilterTabsComponent;
  readonly campaignTable: CampaignTableComponent;
  readonly pagination: PaginationComponent;
  readonly filterButton: Locator;
  readonly platformFilter: Locator;
  readonly audienceGenderFilter: Locator;
  readonly faceShownFilter: Locator;
  readonly budgetFilter: Locator;

  constructor(page: Page) {
    super(page);
    this.contentTypeTabs = new FilterTabsComponent(page);
    this.campaignTable = new CampaignTableComponent(page);
    this.pagination = new PaginationComponent(page);
    this.filterButton = page.getByRole('button', { name: /^filter$/i });
    // TODO: verify locator — filter panel fields not confirmed
    this.platformFilter = page.getByLabel(/platform/i).or(
      page.getByRole('combobox', { name: /platform/i }),
    );
    // TODO: verify locator
    this.audienceGenderFilter = page.getByLabel(/audience gender|gender/i).or(
      page.getByRole('combobox', { name: /gender/i }),
    );
    // TODO: verify locator
    this.faceShownFilter = page.getByLabel(/face shown/i).or(
      page.getByRole('combobox', { name: /face shown/i }),
    );
    // TODO: verify locator
    this.budgetFilter = page.getByLabel(/budget/i).or(page.getByRole('combobox', { name: /budget/i }));
  }

  async open(): Promise<void> {
    await this.goto('/creator/public-campaigns');
  }

  async selectContentOnly(): Promise<void> {
    await this.contentTypeTabs.select(/content only/i);
  }

  async selectCreatorFeedPost(): Promise<void> {
    await this.contentTypeTabs.select(/creator feed post/i);
  }

  async openFilters(): Promise<void> {
    await this.filterButton.click();
  }

  cardByName(name: string | RegExp): CampaignCardComponent {
    // TODO: verify locator
    return new CampaignCardComponent(
      this.page.getByRole('article').filter({ hasText: name }).or(
        this.page.getByRole('listitem').filter({ hasText: name }),
      ),
    );
  }
}
