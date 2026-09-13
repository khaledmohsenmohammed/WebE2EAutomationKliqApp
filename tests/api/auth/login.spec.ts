import { type APIResponse } from '@playwright/test';
import { AuthApi } from '../../../src/api/auth.api';
import { requireApiEnv } from '../../../src/config/env';
import { expect, test } from '../../../src/fixtures/test.fixture';

type LoginBody = {
  tokens?: {
    access_token?: string;
    refresh_token?: string;
  };
};

async function loginAsBrand(authApi: AuthApi): Promise<string> {
  const { brandEmail, brandPassword } = requireApiEnv();
  const response = await authApi.login(brandEmail, brandPassword);
  expect(response.ok()).toBeTruthy();

  const body = (await response.json()) as LoginBody;
  const accessToken = body.tokens?.access_token;
  expect(accessToken).toBeTruthy();
  return accessToken as string;
}

async function parseJson(response: APIResponse): Promise<LoginBody> {
  return (await response.json()) as LoginBody;
}

test.describe('Auth API', () => {
  test('returns access and refresh tokens for a valid login', async ({ authApi }) => {
    const { brandEmail, brandPassword } = requireApiEnv();
    const response = await authApi.login(brandEmail, brandPassword);

    expect(response.ok()).toBeTruthy();

    const body = await parseJson(response);
    expect(body.tokens?.access_token).toBeTruthy();
    expect(body.tokens?.refresh_token).toBeTruthy();
  });

  test('rejects login with a wrong password', async ({ authApi }) => {
    const { brandEmail } = requireApiEnv();
    const response = await authApi.login(brandEmail, 'WrongPassword123!');

    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test('returns the authenticated profile with a valid access token', async ({ authApi }) => {
    const accessToken = await loginAsBrand(authApi);
    const response = await authApi.getMyProfile(accessToken);

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toBeTruthy();
  });

  test('logs out with a valid access token', async ({ authApi }) => {
    const accessToken = await loginAsBrand(authApi);
    const response = await authApi.logout(accessToken);

    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);
  });
});
