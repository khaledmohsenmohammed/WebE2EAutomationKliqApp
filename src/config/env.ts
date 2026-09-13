import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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

export const env = {
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
