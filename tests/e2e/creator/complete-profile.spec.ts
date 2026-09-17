import path from 'path';
import { requireTestOtpCode } from '../../../src/config/env';
import {
  createInitialProgress,
  recordAccountUpdate,
  registerAndOnboard,
} from '../../../src/flows/registration.flow';
import { expect, test } from '../../../src/fixtures/test.fixture';
import { buildCreatorRegistrationData } from '../../../src/utils/registrationData.factory';

const PROFILE_IMAGE_PATH = path.resolve(process.cwd(), 'testdata/fixtures/profile-image.png');

test.describe('Creator profile completion', () => {
  test('fills Step 1 of the profile-completion wizard and advances', async ({
    registerPage,
    otpPage,
    onboardingPage,
    creatorMyCampaignsPage,
  }) => {
    const data = buildCreatorRegistrationData();
    const otpCode = requireTestOtpCode();
    const progress = createInitialProgress();
    const profileStepOne = {
      location: 'Egypt',
      category: 'Technology',
      image: 'profile-image.png',
    };

    // Registers + skips onboarding (existing flow), which is exactly what
    // leaves the profile incomplete for this test to then complete for real.
    // The generated account is persisted inside registerAndOnboard.
    await registerAndOnboard(
      { registerPage, otpPage, onboardingPage },
      data,
      otpCode,
      progress,
    );

    try {
      await creatorMyCampaignsPage.open();
      await creatorMyCampaignsPage.expectProfileCompletionBannerVisible();
      await creatorMyCampaignsPage.openCompleteProfile();
      await onboardingPage.waitForUrl(/\/onboarding\/creator/i);

      await onboardingPage.completeProfileStepOne({
        imagePath: PROFILE_IMAGE_PATH,
        location: profileStepOne.location,
        category: profileStepOne.category,
      });

      await onboardingPage.expectStepTwoVisible();
      await recordAccountUpdate(progress, {
        kind: 'profile-step-1',
        details: profileStepOne,
      });
    } catch (err) {
      progress.error = err instanceof Error ? err.message : String(err);
      await recordAccountUpdate(progress, {
        kind: 'profile-step-1-failed',
        details: { message: progress.error },
      });
      throw err;
    }
  });
});
