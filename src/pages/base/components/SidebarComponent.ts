import { type Locator, type Page } from '@playwright/test';

/**
 * Shared app sidebar. Brand and creator portals reuse the same shell with different nav links.
 */
export class SidebarComponent {
  readonly brand: {
    campaignsLink: Locator;
    findCreatorsLink: Locator;
    savedListsLink: Locator;
    teamLink: Locator;
    transactionsLink: Locator;
    settingsLink: Locator;
  };

  readonly creator: {
    myCampaignsLink: Locator;
    publicCampaignsLink: Locator;
    profileLink: Locator;
    earningsLink: Locator;
    settingsLink: Locator;
  };

  constructor(private readonly page: Page) {
    this.brand = {
      // Login page prefetches `/brand/dashboard` as the brand landing route.
      campaignsLink: page.getByRole('link', { name: /campaigns|dashboard/i }),
      findCreatorsLink: page.getByRole('link', { name: /find creators/i }),
      savedListsLink: page.getByRole('link', { name: /saved lists/i }),
      teamLink: page.getByRole('link', { name: /^team$/i }),
      transactionsLink: page.getByRole('link', { name: /transactions/i }),
      settingsLink: page.getByRole('link', { name: /settings/i }),
    };

    this.creator = {
      myCampaignsLink: page.getByRole('link', { name: /my campaigns|^campaigns$/i }),
      publicCampaignsLink: page.getByRole('link', { name: /public campaigns/i }),
      // TODO: verify locator — creator profile nav label not confirmed
      profileLink: page.getByRole('link', { name: /profile/i }),
      earningsLink: page.getByRole('link', { name: /earnings/i }),
      settingsLink: page.getByRole('link', { name: /settings/i }),
    };
  }

  async openBrandCampaigns(): Promise<void> {
    await this.brand.campaignsLink.click();
  }

  async openFindCreators(): Promise<void> {
    await this.brand.findCreatorsLink.click();
  }

  async openSavedLists(): Promise<void> {
    await this.brand.savedListsLink.click();
  }

  async openTeam(): Promise<void> {
    await this.brand.teamLink.click();
  }

  async openBrandTransactions(): Promise<void> {
    await this.brand.transactionsLink.click();
  }

  async openBrandSettings(): Promise<void> {
    await this.brand.settingsLink.click();
  }

  async openMyCampaigns(): Promise<void> {
    await this.creator.myCampaignsLink.click();
  }

  async openPublicCampaigns(): Promise<void> {
    await this.creator.publicCampaignsLink.click();
  }

  async openCreatorProfile(): Promise<void> {
    await this.creator.profileLink.click();
  }

  async openEarnings(): Promise<void> {
    await this.creator.earningsLink.click();
  }

  async openCreatorSettings(): Promise<void> {
    await this.creator.settingsLink.click();
  }
}
