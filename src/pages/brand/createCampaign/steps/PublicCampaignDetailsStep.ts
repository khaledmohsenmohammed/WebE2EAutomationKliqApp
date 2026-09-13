import { type Locator, type Page } from '@playwright/test';

export type PublicContentType = 'ContentOnly' | 'CreatorFeedPost';
export type PublicGenderOption = 'Both' | 'Male' | 'Female';
export type PublicFaceShownOption = 'All' | 'Face Required' | 'Voiceover';
export type PublicFollowersRange =
  | '1K - 10K'
  | '10K - 100K'
  | '100K - 500K'
  | '500K - 1M'
  | '+1M';

const CONTENT_TYPE_LABEL: Record<PublicContentType, RegExp> = {
  ContentOnly: /content only/i,
  CreatorFeedPost: /creator feed post/i,
};

/**
 * Public campaign form. Single screen after choosing "Public Campaign" — no numbered steps.
 * Ends with "Publish Campaign".
 */
export class PublicCampaignDetailsStep {
  readonly campaignTitleInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly browseFilesButton: Locator;
  readonly channelDropdown: Locator;
  readonly deliverableTypeDropdown: Locator;
  readonly requiredCreatorsInput: Locator;
  readonly payoutPerCreatorInput: Locator;
  readonly locationInput: Locator;
  readonly nicheMultiSelect: Locator;
  readonly saveAsDraftButton: Locator;
  readonly backButton: Locator;
  readonly publishCampaignButton: Locator;

  constructor(private readonly page: Page) {
    this.campaignTitleInput = page.getByLabel(/campaign title|title/i).or(
      page.getByPlaceholder(/campaign title|title/i),
    );
    this.descriptionTextarea = page.getByLabel(/description/i).or(
      page.getByPlaceholder(/description/i),
    );
    this.browseFilesButton = page.getByRole('button', { name: /browse files|browse/i });
    // TODO: verify locator — both dropdowns use a "Choose" placeholder
    this.channelDropdown = page.getByLabel(/^channel$/i).or(
      page.getByRole('combobox', { name: /channel/i }),
    );
    // TODO: verify locator
    this.deliverableTypeDropdown = page.getByLabel(/deliverable type/i).or(
      page.getByRole('combobox', { name: /deliverable type/i }),
    );
    this.requiredCreatorsInput = page.getByLabel(/required creators/i).or(
      page.getByPlaceholder(/required creators/i),
    );
    this.payoutPerCreatorInput = page.getByLabel(/payout per creator/i).or(
      page.getByPlaceholder(/payout per creator/i),
    );
    this.locationInput = page.getByLabel(/^location$/i).or(page.getByPlaceholder(/location/i));
    this.nicheMultiSelect = page.getByLabel(/niche/i).or(page.getByRole('combobox', { name: /niche/i }));
    this.saveAsDraftButton = page.getByRole('button', { name: /save as draft/i });
    this.backButton = page.getByRole('button', { name: /^back$/i });
    this.publishCampaignButton = page.getByRole('button', { name: /publish campaign/i });
  }

  contentTypeOption(type: PublicContentType): Locator {
    const name = CONTENT_TYPE_LABEL[type];
    return this.page.getByRole('button', { name }).or(this.page.getByText(name));
  }

  genderOption(option: PublicGenderOption): Locator {
    return this.page.getByRole('group', { name: /gender/i }).getByRole('button', { name: option, exact: true }).or(
      this.page.getByRole('radio', { name: option, exact: true }),
    );
  }

  faceShownOption(option: PublicFaceShownOption): Locator {
    return this.page
      .getByRole('group', { name: /face shown/i })
      .getByRole('button', { name: option, exact: true })
      .or(this.page.getByRole('radio', { name: option, exact: true }));
  }

  followersRangeOption(range: PublicFollowersRange): Locator {
    return this.page.getByRole('button', { name: range, exact: true }).or(
      this.page.getByRole('radio', { name: range, exact: true }),
    );
  }

  async selectContentType(type: PublicContentType): Promise<void> {
    await this.contentTypeOption(type).click();
  }

  async fillTitle(title: string): Promise<void> {
    await this.campaignTitleInput.fill(title);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionTextarea.fill(description);
  }

  async uploadFiles(filePaths: string[]): Promise<void> {
    // TODO: verify locator — dropzone may use a hidden file input
    const fileInput = this.page.getByLabel(/upload|attach|files/i).or(
      this.page.locator('input[type="file"]'),
    );
    await fileInput.setInputFiles(filePaths);
  }

  async selectChannel(channel: string): Promise<void> {
    await this.channelDropdown.click();
    await this.page.getByRole('option', { name: channel }).click();
  }

  async selectDeliverableType(type: string): Promise<void> {
    await this.deliverableTypeDropdown.click();
    await this.page.getByRole('option', { name: type }).click();
  }

  async fillRequiredCreators(count: string): Promise<void> {
    await this.requiredCreatorsInput.fill(count);
  }

  async fillPayoutPerCreator(amount: string): Promise<void> {
    await this.payoutPerCreatorInput.fill(amount);
  }

  async selectGender(option: PublicGenderOption): Promise<void> {
    await this.genderOption(option).click();
  }

  async selectFaceShown(option: PublicFaceShownOption): Promise<void> {
    await this.faceShownOption(option).click();
  }

  async fillLocation(location: string): Promise<void> {
    await this.locationInput.fill(location);
  }

  async selectNiches(niches: string[]): Promise<void> {
    for (const niche of niches.slice(0, 3)) {
      await this.nicheMultiSelect.click();
      await this.page.getByRole('option', { name: niche }).click();
    }
  }

  async selectFollowersRange(range: PublicFollowersRange): Promise<void> {
    await this.followersRangeOption(range).click();
  }

  async saveAsDraft(): Promise<void> {
    await this.saveAsDraftButton.click();
  }

  async back(): Promise<void> {
    await this.backButton.click();
  }

  async publishCampaign(): Promise<void> {
    await this.publishCampaignButton.click();
  }
}
