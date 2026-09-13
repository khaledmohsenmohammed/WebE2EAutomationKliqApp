import { type Page } from '@playwright/test';
import { BasePage } from '../../base/BasePage';
import { ChooseCampaignTypeStep } from './steps/ChooseCampaignTypeStep';
import { InvitationCampaignBriefStep } from './steps/InvitationCampaignBriefStep';
import { PublicCampaignDetailsStep } from './steps/PublicCampaignDetailsStep';

export type CreateCampaignType = 'public' | 'invitation-only';

/**
 * Orchestrates the brand create-campaign wizard.
 * After {@link ChooseCampaignTypeStep}, the flow branches:
 * - Public → {@link PublicCampaignDetailsStep} (single screen, Publish Campaign)
 * - Invitation-Only → {@link InvitationCampaignBriefStep} (STEP 1; steps 2+ not mapped)
 *
 * Route: not confirmed — opened from the campaigns list "Create Campaign" action.
 */
export class CreateCampaignWizard extends BasePage {
  readonly chooseTypeStep: ChooseCampaignTypeStep;
  readonly publicDetailsStep: PublicCampaignDetailsStep;
  readonly invitationBriefStep: InvitationCampaignBriefStep;

  private selectedType: CreateCampaignType | undefined;

  constructor(page: Page) {
    super(page);
    this.chooseTypeStep = new ChooseCampaignTypeStep(page);
    this.publicDetailsStep = new PublicCampaignDetailsStep(page);
    this.invitationBriefStep = new InvitationCampaignBriefStep(page);
  }

  campaignType(): CreateCampaignType | undefined {
    return this.selectedType;
  }

  async startPublicCampaign(): Promise<PublicCampaignDetailsStep> {
    await this.chooseTypeStep.choosePublic();
    await this.chooseTypeStep.getStarted();
    this.selectedType = 'public';
    return this.publicDetailsStep;
  }

  async startInvitationCampaign(): Promise<InvitationCampaignBriefStep> {
    await this.chooseTypeStep.chooseInvitationOnly();
    await this.chooseTypeStep.getStarted();
    this.selectedType = 'invitation-only';
    return this.invitationBriefStep;
  }

  /**
   * Numbered-step navigation applies to invitation-only only.
   * Public is a single unnumbered screen.
   */
  async goToStep(step: number): Promise<void> {
    if (this.selectedType === 'public') {
      return;
    }
    if (step <= 1) {
      return;
    }
    // TODO: invitation-only steps 2+ are not yet mapped — do not invent them.
    throw new Error(
      `Invitation-only wizard step ${step} is not mapped yet. Only STEP 1 (campaign brief) is implemented.`,
    );
  }

  async currentStep(): Promise<number> {
    if (this.selectedType === 'public') {
      return 1;
    }
    const label = await this.page.getByText(/step\s+\d+/i).first().innerText();
    const match = label.match(/\d+/);
    return match ? Number(match[0]) : 1;
  }
}
