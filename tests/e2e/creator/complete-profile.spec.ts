import path from 'path';
import { requireTestOtpCode } from '../../../src/config/env';
import {
  createInitialProgress,
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

    // Registers + skips onboarding (existing flow), which is exactly what
    // leaves the profile incomplete for this test to then complete for real.
    await registerAndOnboard(
      { registerPage, otpPage, onboardingPage },
      data,
      otpCode,
      createInitialProgress(),
    );

    await creatorMyCampaignsPage.open();
    await creatorMyCampaignsPage.expectProfileCompletionBannerVisible();
    await creatorMyCampaignsPage.openCompleteProfile();
    await onboardingPage.waitForUrl(/\/onboarding\/creator/i);

    await onboardingPage.completeProfileStepOne({
      imagePath: PROFILE_IMAGE_PATH,
      location: 'Egypt',
      category: 'Technology',
    });

    await onboardingPage.expectStepTwoVisible();
  });
});
