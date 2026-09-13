import { type APIRequestContext, type APIResponse } from '@playwright/test';

export class AuthApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly apiBaseUrl: string,
  ) {}

  async login(identifier: string, password: string): Promise<APIResponse> {
    return this.request.post(`${this.apiBaseUrl}/api/v1/auth/login/`, {
      data: { identifier, password },
    });
  }

  async logout(accessToken: string): Promise<APIResponse> {
    return this.request.post(`${this.apiBaseUrl}/api/v1/auth/login/logout/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  async refreshToken(refreshToken: string): Promise<APIResponse> {
    return this.request.post(`${this.apiBaseUrl}/api/v1/auth/login/refresh-token/`, {
      data: { refresh_token: refreshToken },
    });
  }

  async getMyProfile(accessToken: string): Promise<APIResponse> {
    return this.request.get(`${this.apiBaseUrl}/api/v1/auth/login/my-profile/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
