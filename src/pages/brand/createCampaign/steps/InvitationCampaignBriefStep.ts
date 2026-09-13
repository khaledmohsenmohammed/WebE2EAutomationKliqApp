import { type Locator, type Page } from '@playwright/test';

/**
 * Invitation-only campaign — STEP 1 (campaign brief).
 *
 * TODO: a step indicator confirms more steps follow. Steps 2+ are not mapped yet —
 * do not invent them. Add classes under this folder when those screens are provided.
 */
export class InvitationCampaignBriefStep {
  readonly titleInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly charCounter: Locator;
  readonly campaignLaunchDateInput: Locator;
  readonly budgetInput: Locator;
  readonly audienceAgeDropdown: Locator;
  readonly audienceGenderDropdown: Locator;
  readonly locationSearchInput: Locator;
  readonly interestsMultiSelect: Locator;
  readonly saveAsDraftButton: Locator;
  readonly nextButton: Locator;

  constructor(private readonly page: Page) {
    this.titleInput = page.getByLabel(/^title$/i).or(page.getByPlaceholder(/^title$/i));
    this.descriptionTextarea = page.getByLabel(/description/i).or(
      page.getByPlaceholder(/description/i),
    );
    this.charCounter = page.getByText(/\d+\s*\/\s*2000/);
    this.campaignLaunchDateInput = page.getByLabel(/campaign launch date|launch date/i).or(
      page.getByPlaceholder(/launch date|select date|dd\/mm/i),
    );
    this.budgetInput = page.getByLabel(/^budget$/i).or(page.getByPlaceholder(/budget/i));
    this.audienceAgeDropdown = page.getByLabel(/audience age|age/i).or(
      page.getByRole('combobox', { name: /age/i }),
    );
    this.audienceGenderDropdown = page.getByLabel(/audience gender|gender/i).or(
      page.getByRole('combobox', { name: /gender/i }),
    );
    this.locationSearchInput = page.getByPlaceholder(/search for cities or countries/i);
    this.interestsMultiSelect = page.getByLabel(/interests/i).or(
      page.getByRole('combobox', { name: /interests/i }),
    );
    this.saveAsDraftButton = page.getByRole('button', { name: /save as draft/i });
    this.nextButton = page.getByRole('button', { name: /^next$/i });
  }

  /**
   * Description requires min 300 characters and shows a `current/2000` counter.
   */
  async getCharCount(): Promise<{ current: number; max: number }> {
    const text = (await this.charCounter.innerText()).trim();
    const match = text.match(/(\d+)\s*\/\s*(\d+)/);
    return {
      current: match ? Number(match[1]) : 0,
      max: match ? Number(match[2]) : 2000,
    };
  }

  async fillTitle(title: string): Promise<void> {
    await this.titleInput.fill(title);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionTextarea.fill(description);
  }

  async fillLaunchDate(value: string): Promise<void> {
    await this.campaignLaunchDateInput.fill(value);
  }

  async fillBudget(amount: string): Promise<void> {
    await this.budgetInput.fill(amount);
  }

  async selectAudienceAge(age: string): Promise<void> {
    await this.audienceAgeDropdown.click();
    await this.page.getByRole('option', { name: age }).click();
  }

  async selectAudienceGender(gender: string): Promise<void> {
    await this.audienceGenderDropdown.click();
    await this.page.getByRole('option', { name: gender }).click();
  }

  async searchAndSelectLocation(query: string): Promise<void> {
    await this.locationSearchInput.fill(query);
    await this.page.getByRole('option', { name: query }).click();
  }

  async selectInterests(interests: string[]): Promise<void> {
    for (const interest of interests.slice(0, 3)) {
      await this.interestsMultiSelect.click();
      await this.page.getByRole('option', { name: interest }).click();
    }
  }

  async saveAsDraft(): Promise<void> {
    await this.saveAsDraftButton.click();
  }

  async next(): Promise<void> {
    await this.nextButton.click();
  }
}
