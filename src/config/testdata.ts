import fs from 'fs';
import path from 'path';

const root = process.cwd();

export type AppEnvName = 'sandbox' | 'dev' | 'production';

export type EnvironmentConfig = {
  webBaseUrl: string;
  apiBaseUrl: string;
};

export type UserConfig = {
  role: 'brand' | 'creator' | string;
  email: string;
  passwordEnv: string;
  notes?: string;
};

type EnvironmentsFile = {
  default: AppEnvName;
  environments: Record<string, EnvironmentConfig>;
};

type UsersFile = {
  activeUser: string;
  users: Record<string, UserConfig>;
};

function readJson<T>(relativePath: string): T {
  const filePath = path.resolve(root, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing test data file: ${relativePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

export function loadEnvironmentsFile(): EnvironmentsFile {
  return readJson<EnvironmentsFile>('testdata/environments.json');
}

export function loadUsersFile(): UsersFile {
  return readJson<UsersFile>('testdata/users.json');
}

export function resolveEnvironment(
  envName: string,
  environmentsFile: EnvironmentsFile = loadEnvironmentsFile(),
): EnvironmentConfig {
  const key = envName || environmentsFile.default || 'sandbox';
  const config = environmentsFile.environments[key];
  if (!config) {
    const known = Object.keys(environmentsFile.environments).join(', ');
    throw new Error(`Unknown ENV "${key}". Known environments: ${known}`);
  }
  return config;
}

export function resolveUser(
  userKey?: string,
  usersFile: UsersFile = loadUsersFile(),
): { key: string; user: UserConfig } {
  const key = userKey || usersFile.activeUser;
  const user = usersFile.users[key];
  if (!user) {
    const known = Object.keys(usersFile.users).join(', ');
    throw new Error(`Unknown user "${key}". Known users: ${known}. Set ACTIVE_USER or users.json activeUser.`);
  }
  return { key, user };
}

/** Persist data created at runtime (campaign ids, etc.) under testdata/generated/. */
export function saveGenerated(name: string, data: unknown): string {
  const dir = path.resolve(root, 'testdata/generated');
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.resolve(dir, name.endsWith('.json') ? name : `${name}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return filePath;
}

export function loadGenerated<T>(name: string): T | null {
  const filePath = path.resolve(root, 'testdata/generated', name.endsWith('.json') ? name : `${name}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}
