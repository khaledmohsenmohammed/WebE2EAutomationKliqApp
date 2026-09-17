import { requireTestOtpCode } from '../../../src/config/env';
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
  }) => {
    const data = buildCreatorRegistrationData();
    const progress = createInitialProgress();
    // Static OTP accepted by sandbox/dev (testdata/environments.json →
    // testOtpCode). Never set for production, so this throws rather than
    // silently skipping real verification there.
    const otpCode = requireTestOtpCode();

    // registerAndOnboard persists the generated account into
    // testdata/generated/registrations.json itself (including on failure).
    await registerAndOnboard(
      { registerPage, otpPage, onboardingPage },
      data,
      otpCode,
      progress,
    );

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
  });
});
