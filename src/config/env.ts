import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const root = process.cwd();

dotenv.config({ path: path.resolve(root, '.env') });

function optional(name: string): string {
  return process.env[name]?.trim() ?? '';
}

function required(name: string): string {
  const value = optional(name);
  if (!value) {
    throw new Error(
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
  return value || 'sandbox';
}

const appEnv = resolveAppEnv();
const envFile = path.resolve(root, `.env.${appEnv}`);
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile, override: true });
}

export const env = {
  name: appEnv,
  webBaseUrl: optional('WEB_BASE_URL'),
  apiBaseUrl: optional('API_BASE_URL'),
  brandEmail: optional('BRAND_EMAIL'),
  brandPassword: optional('BRAND_PASSWORD'),
  creatorEmail: optional('CREATOR_EMAIL'),
  creatorPassword: optional('CREATOR_PASSWORD'),
};

export function requireWebEnv() {
  return {
    webBaseUrl: required('WEB_BASE_URL'),
    brandEmail: required('BRAND_EMAIL'),
    brandPassword: required('BRAND_PASSWORD'),
  };
}

export function requireApiEnv() {
  return {
    apiBaseUrl: required('API_BASE_URL'),
    brandEmail: required('BRAND_EMAIL'),
    brandPassword: required('BRAND_PASSWORD'),
  };
}
