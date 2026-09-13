import { requireWebEnv } from '../../../src/config/env';
import { test } from '../../../src/fixtures/test.fixture';

test.describe('Login', () => {
  test('logs in a brand user with valid credentials', async ({ loginPage }) => {
    const { brandEmail, brandPassword } = requireWebEnv();

    await loginPage.open();
    await loginPage.login(brandEmail, brandPassword);
    await loginPage.expectLoggedIn();
  });

  test('shows an error for an invalid password', async ({ loginPage }) => {
    const { brandEmail } = requireWebEnv();

    await loginPage.open();
    await loginPage.login(brandEmail, 'WrongPassword123!');
    await loginPage.expectErrorVisible();
    await loginPage.expectStillOnLogin();
  });
});
