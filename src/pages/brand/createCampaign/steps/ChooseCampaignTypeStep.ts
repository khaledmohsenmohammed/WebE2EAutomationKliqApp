import { type Locator, type Page } from '@playwright/test';

/**
 * Create-campaign wizard — Step 1: choose Invitation-Only vs Public.
 */
export class ChooseCampaignTypeStep {
  readonly invitationOnlyOption: Locator;
  readonly publicOption: Locator;
  readonly saveAsDraftButton: Locator;
  readonly getStartedButton: Locator;

  constructor(private readonly page: Page) {
    this.invitationOnlyOption = page.getByRole('button', { name: /invitation-only campaign/i }).or(
      page.getByText(/invitation-only campaign/i),
    );
    this.publicOption = page.getByRole('button', { name: /public campaign/i }).or(
      page.getByText(/public campaign/i),
    );
    this.saveAsDraftButton = page.getByRole('button', { name: /save as draft/i });
    this.getStartedButton = page.getByRole('button', { name: /get started/i });
  }

  async chooseInvitationOnly(): Promise<void> {
    await this.invitationOnlyOption.click();
  }

  async choosePublic(): Promise<void> {
    await this.publicOption.click();
  }

  async saveAsDraft(): Promise<void> {
    await this.saveAsDraftButton.click();
  }

  async getStarted(): Promise<void> {
    await this.getStartedButton.click();
  }
}
