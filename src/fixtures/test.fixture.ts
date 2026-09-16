import { test as base } from '@playwright/test';
import { AuthApi } from '../api/auth.api';
import { requireApiEnv } from '../config/env';
import { CreatorMyCampaignsPage } from '../pages/creator/CreatorMyCampaignsPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { OnboardingPage } from '../pages/auth/OnboardingPage';
import { OtpPage } from '../pages/auth/OtpPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  otpPage: OtpPage;
  onboardingPage: OnboardingPage;
  creatorMyCampaignsPage: CreatorMyCampaignsPage;
  authApi: AuthApi;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  otpPage: async ({ page }, use) => {
    await use(new OtpPage(page));
  },
  onboardingPage: async ({ page }, use) => {
    await use(new OnboardingPage(page));
  },
  creatorMyCampaignsPage: async ({ page }, use) => {
    await use(new CreatorMyCampaignsPage(page));
  },
  authApi: async ({ request }, use) => {
    const { apiBaseUrl } = requireApiEnv();
    await use(new AuthApi(request, apiBaseUrl));
  },
});

export { expect } from '@playwright/test';
