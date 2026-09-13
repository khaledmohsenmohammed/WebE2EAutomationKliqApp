import { test as base } from '@playwright/test';
import { AuthApi } from '../api/auth.api';
import { requireApiEnv } from '../config/env';
import { LoginPage } from '../pages/login.page';

type Fixtures = {
  loginPage: LoginPage;
  authApi: AuthApi;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  authApi: async ({ request }, use) => {
    const { apiBaseUrl } = requireApiEnv();
    await use(new AuthApi(request, apiBaseUrl));
  },
});

export { expect } from '@playwright/test';
