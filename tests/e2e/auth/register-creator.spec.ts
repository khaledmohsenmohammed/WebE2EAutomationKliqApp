import { requireTestOtpCode } from '../../../src/config/env';
import { saveGenerated } from '../../../src/config/testdata';
import {
  createInitialProgress,
  registerAndOnboard,
} from '../../../src/flows/registration.flow';
import { expect, test } from '../../../src/fixtures/test.fixture';
import { buildCreatorRegistrationData } from '../../../src/utils/registrationData.factory';

test.describe('Creator registration', () => {
  test('registers a new creator through OTP and onboarding', async ({
    registerPage,
    otpPage,
    onboardingPage,
    page,
  }) => {
    const data = buildCreatorRegistrationData();
    const progress = createInitialProgress();
    // Static OTP accepted by sandbox/dev (testdata/environments.json →
    // testOtpCode). Never set for production, so this throws rather than
    // silently skipping real verification there.
    const otpCode = requireTestOtpCode();

    try {
      await registerAndOnboard(
        { registerPage, otpPage, onboardingPage },
        data,
        otpCode,
        progress,
      );
    } finally {
      // Persist what was generated and how far the run got, so a failed run
      // still shows exactly which step (form/OTP/onboarding) broke.
      saveGenerated(`registration-creator-${Date.now()}`, {
        data,
        otpCode,
        progress,
      });
    }

    expect(
      progress.formSubmitted,
      'registration form should have been submitted',
    ).toBe(true);
    expect(progress.otpVerified, 'OTP step should have been verified').toBe(
      true,
    );
    expect(
      progress.onboardingCompleted,
      'onboarding step should have been completed',
    ).toBe(true);
    expect(
      progress.accountCreated,
      'account should have been fully created',
    ).toBe(true);
    await page.pause();
  });
});
