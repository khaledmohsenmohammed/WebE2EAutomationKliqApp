import path from 'path';
import { requireTestOtpCode } from '../../../src/config/env';
import {
  createInitialProgress,
  recordAccountUpdate,
  registerAndOnboard,
} from '../../../src/flows/registration.flow';
import { test } from '../../../src/fixtures/test.fixture';
import { buildCreatorRegistrationData } from '../../../src/utils/registrationData.factory';

const PROFILE_IMAGE_PATH = path.resolve(
  process.cwd(),
  'testdata/fixtures/profile-image.png',
);

test.describe('Creator profile completion', () => {
  test('completes Step 1, closes at Step 2, and clears Location/Niches from the profile-completion banner', async ({
    registerPage,
    otpPage,
    onboardingPage,
    creatorMyCampaignsPage,
  }) => {
    // Registration+OTP+onboarding-skip alone is tuned for the 60s project
    // default (per playwright.config.ts). This test also opens the
    // profile-completion wizard, waits out a real image upload plus the
    // location/category autosave settle, and re-verifies the dashboard
    // banner on top of that — routinely over budget on the default.
    test.slow();

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
      await creatorMyCampaignsPage.expectProfileCompletionItemVisible(
        'Location',
      );
      await creatorMyCampaignsPage.expectProfileCompletionItemVisible('Niches');
      await creatorMyCampaignsPage.openCompleteProfile();
      await onboardingPage.waitForUrl(/\/onboarding\/creator/i);

      await onboardingPage.completeProfileStepOne({
        imagePath: PROFILE_IMAGE_PATH,
        location: profileStepOne.location,
        category: profileStepOne.category,
      });

      await onboardingPage.expectStepTwoVisible();

      // Skip the social-accounts step by closing the wizard outright (the
      // top-right "X"), rather than filling it or using "Skip For Now".
      await onboardingPage.closeOnboarding();
      await creatorMyCampaignsPage.waitForUrl(/\/creator\/campaigns/i);

      // Confirms Step 1 actually persisted server-side: the banner should
      // now list only the fields still pending, not what the UI merely
      // navigated past.
      await creatorMyCampaignsPage.expectProfileCompletionBannerVisible();
      await creatorMyCampaignsPage.expectProfileCompletionItemHidden(
        'Location',
      );
      await creatorMyCampaignsPage.expectProfileCompletionItemHidden('Niches');
      await creatorMyCampaignsPage.expectProfileCompletionItemVisible(
        'Mawthooq License',
      );
      await creatorMyCampaignsPage.expectProfileCompletionItemVisible(
        'Social Account Connection',
      );

      await recordAccountUpdate(progress, {
        kind: 'profile-step-1',
        details: { ...profileStepOne, exitedAt: 'step-2-via-close' },
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
