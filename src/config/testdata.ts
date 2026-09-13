import fs from 'fs';
import path from 'path';

const root = process.cwd();

export type AppEnvName = 'sandbox' | 'dev' | 'production';

export type EnvironmentConfig = {
  webBaseUrl: string;
  apiBaseUrl: string;
  /** Static OTP accepted by non-production environments (sandbox/dev only — never set for production). */
  testOtpCode?: string;
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

async function acquireLock(lockPath: string, retries = 50, delayMs = 100): Promise<void> {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      await fs.promises.writeFile(lockPath, String(process.pid), { flag: 'wx' });
      return;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error(`Timed out waiting for lock: ${lockPath}`);
}

/**
 * Append one entry to a shared, dated JSON log under testdata/generated/
 * (e.g. registrations.json), keyed by ISO creation timestamp. Unlike
 * saveGenerated() (one file per call, full overwrite), this merges into a
 * single growing file — use it for an ongoing typed record (e.g. brand/
 * creator registrations) rather than a one-off artifact.
 *
 * Guards the read-modify-write with a simple exclusive-create lock file
 * (`<file>.lock` via `{ flag: 'wx' }`) + retry/backoff, since Playwright
 * runs fullyParallel locally (unpinned workers) and there's no file-locking
 * dependency in the tree — without it, concurrent workers could race and
 * silently drop each other's entries.
 */
export async function appendGenerated<T>(fileName: string, entry: T): Promise<string> {
  const dir = path.resolve(root, 'testdata/generated');
  await fs.promises.mkdir(dir, { recursive: true });
  const filePath = path.resolve(dir, fileName.endsWith('.json') ? fileName : `${fileName}.json`);
  const lockPath = `${filePath}.lock`;

  await acquireLock(lockPath);
  try {
    let current: Record<string, T> = {};
    try {
      current = JSON.parse(await fs.promises.readFile(filePath, 'utf8')) as Record<string, T>;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }
    }
    current[new Date().toISOString()] = entry;
    await fs.promises.writeFile(filePath, `${JSON.stringify(current, null, 2)}\n`, 'utf8');
  } finally {
    await fs.promises.rm(lockPath, { force: true });
  }
  return filePath;
}
