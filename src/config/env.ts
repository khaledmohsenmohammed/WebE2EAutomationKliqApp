import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import {
  loadEnvironmentsFile,
  resolveEnvironment,
  resolveUser,
} from './testdata';

const root = process.cwd();

dotenv.config({ path: path.resolve(root, '.env') });

function optional(name: string): string {
  return process.env[name]?.trim() ?? '';
}

function required(name: string, hint?: string): string {
  const value = optional(name);
  if (!value) {
    throw new Error(
      hint ??
        `Missing required environment variable: ${name}. Copy .env.example to .env and fill in the values.`,
    );
  }
  return value;
}

function resolveAppEnv(): string {
  const value = optional('ENV').toLowerCase();
  if (value === 'prod') {
    return 'production';
  }
  if (value) {
    return value;
  }
  return loadEnvironmentsFile().default || 'sandbox';
}

const appEnv = resolveAppEnv();

const envOverlay = path.resolve(root, `.env.${appEnv}`);
if (fs.existsSync(envOverlay)) {
  dotenv.config({ path: envOverlay, override: true });
}

const environment = resolveEnvironment(appEnv);

/** Optional .env overrides win over testdata/environments.json */
const webBaseUrl = optional('WEB_BASE_URL') || environment.webBaseUrl;
const apiBaseUrl = optional('API_BASE_URL') || environment.apiBaseUrl;

const activeUserKey = optional('ACTIVE_USER');
const { key: resolvedUserKey, user: activeUser } = resolveUser(activeUserKey || undefined);

function passwordFor(user = activeUser): string {
  return optional(user.passwordEnv);
}

export const env = {
  name: appEnv,
  webBaseUrl,
  apiBaseUrl,
  activeUserKey: resolvedUserKey,
  brandEmail: activeUser.role === 'brand' ? activeUser.email : optional('BRAND_EMAIL'),
  brandPassword: optional('BRAND_PASSWORD'),
  creatorEmail: activeUser.role === 'creator' ? activeUser.email : optional('CREATOR_EMAIL'),
  creatorPassword: optional('CREATOR_PASSWORD'),
};

export function requireWebEnv() {
  const email = activeUser.email || optional('BRAND_EMAIL');
  const password = passwordFor();
  if (!webBaseUrl) {
    throw new Error(
      'Missing webBaseUrl. Set it in testdata/environments.json or WEB_BASE_URL in .env.',
    );
  }
  if (!email) {
    throw new Error(
      `Missing email for user "${resolvedUserKey}". Set email in testdata/users.json.`,
    );
  }
  if (!password) {
    throw new Error(
      `Missing password. Set ${activeUser.passwordEnv} in .env (never commit passwords).`,
    );
  }
  return {
    webBaseUrl,
    brandEmail: email,
    brandPassword: password,
    userKey: resolvedUserKey,
  };
}

export function requireApiEnv() {
  const email = activeUser.email || optional('BRAND_EMAIL');
  const password = passwordFor();
  if (!apiBaseUrl) {
    throw new Error(
      'Missing apiBaseUrl. Set it in testdata/environments.json or API_BASE_URL in .env.',
    );
  }
  if (!email) {
    throw new Error(
      `Missing email for user "${resolvedUserKey}". Set email in testdata/users.json.`,
    );
  }
  if (!password) {
    throw new Error(
      `Missing password. Set ${activeUser.passwordEnv} in .env (never commit passwords).`,
    );
  }
  return {
    apiBaseUrl,
    brandEmail: email,
    brandPassword: password,
    userKey: resolvedUserKey,
  };
}

export function requireUser(userKey?: string) {
  const { key, user } = resolveUser(userKey);
  const password = optional(user.passwordEnv);
  if (!user.email) {
    throw new Error(`Missing email for user "${key}" in testdata/users.json.`);
  }
  if (!password) {
    throw new Error(`Missing ${user.passwordEnv} in .env for user "${key}".`);
  }
  return {
    key,
    role: user.role,
    email: user.email,
    password,
  };
}

/** Kept for clear errors when a raw secret name is required. */
export function requireSecret(name: string): string {
  return required(name);
}

/**
 * Static OTP accepted by non-production environments. Set per-environment
 * via `testdata/environments.json` (`testOtpCode`), overridable with
 * `TEST_OTP_CODE` in `.env`. Never set for production — a missing value
 * throws rather than letting a real OTP flow be skipped silently.
 */
export function requireTestOtpCode(): string {
  const code = optional('TEST_OTP_CODE') || environment.testOtpCode || '';
  if (!code) {
    throw new Error(
      `Missing test OTP code for env "${appEnv}". Set testOtpCode in testdata/environments.json or TEST_OTP_CODE in .env (sandbox/dev only).`,
    );
  }
  return code;
}

/**
 * Password used for every account `registrationData.factory.ts` generates.
 * Lives only in `.env` (never in source/JSON) via `GENERATED_ACCOUNT_PASSWORD`.
 */
export function requireGeneratedAccountPassword(): string {
  return required(
    'GENERATED_ACCOUNT_PASSWORD',
    'Missing GENERATED_ACCOUNT_PASSWORD. Copy .env.example to .env and set it (never commit it or hardcode it in source).',
  );
}
