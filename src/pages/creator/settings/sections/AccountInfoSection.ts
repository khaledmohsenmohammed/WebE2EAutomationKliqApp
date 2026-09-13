import { type Locator, type Page } from '@playwright/test';
import { RateCardComponent } from './RateCardComponent';
import { SocialMediaAccountsComponent } from './SocialMediaAccountsComponent';

/**
 * Creator settings — Account Info section (in-place swap, no new URL).
 * Composes Social Media Accounts and Rate Card nested blocks.
 */
export class AccountInfoSection {
  readonly fullName: Locator;
  readonly email: Locator;
  readonly phoneNumber: Locator;
  readonly editButton: Locator;
  readonly socialMediaAccounts: SocialMediaAccountsComponent;
  readonly rateCard: RateCardComponent;

  constructor(private readonly page: Page) {
    this.fullName = page.getByLabel(/full name/i);
    this.email = page.getByLabel(/^email$/i);
    this.phoneNumber = page.getByLabel(/phone number/i);
    this.editButton = page.getByRole('button', { name: /^edit$/i });
    this.socialMediaAccounts = new SocialMediaAccountsComponent(page);
    this.rateCard = new RateCardComponent(page);
  }

  async startEdit(): Promise<void> {
    await this.editButton.click();
  }
}
