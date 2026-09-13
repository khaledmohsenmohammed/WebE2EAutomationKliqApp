import { faker } from '@faker-js/faker';

/**
 * Random registration inputs for the brand/creator sign-up forms
 * (`src/pages/auth/RegisterPage.ts`). Generated fresh per call so specs never
 * collide on email/handle uniqueness across runs. `password` is the one
 * fixed field — every generated account shares `DEFAULT_PASSWORD` below.
 */

export type BrandRegistrationData = {
  role: 'brand';
  brandName: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export type CreatorRegistrationData = {
  role: 'creator';
  fullName: string;
  socialHandle: string;
  email: string;
  phone: string;
  password: string;
};

export type RegistrationData = BrandRegistrationData | CreatorRegistrationData;

/**
 * Digits only — `RegisterPage.phoneInput` sits next to a fixed 🇸🇦 country-code
 * button, and the app validates a 9-digit Saudi mobile number starting with 5.
 */
function randomPhone(): string {
  return `5${faker.string.numeric(8)}`;
}

/** Fixed password for every generated account — keeps generated credentials predictable across runs. */
const DEFAULT_PASSWORD = 'P@ssw0rd123';

/** Unique-enough email: real-looking name plus a short random suffix. */
function randomEmail(firstName: string, lastName: string): string {
  const suffix = faker.string.alphanumeric(5).toLowerCase();
  return faker.internet
    .email({ firstName, lastName, provider: 'example.com' })
    .replace('@', `+${suffix}@`)
    .toLowerCase();
}

export function buildBrandRegistrationData(overrides?: Partial<BrandRegistrationData>): BrandRegistrationData {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    role: 'brand',
    brandName: faker.company.name(),
    fullName: `${firstName} ${lastName}`,
    email: randomEmail(firstName, lastName),
    phone: randomPhone(),
    password: DEFAULT_PASSWORD,
    ...overrides,
  };
}

export function buildCreatorRegistrationData(overrides?: Partial<CreatorRegistrationData>): CreatorRegistrationData {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    role: 'creator',
    fullName: `${firstName} ${lastName}`,
    socialHandle: `@${faker.internet.username({ firstName, lastName }).toLowerCase()}`,
    email: randomEmail(firstName, lastName),
    phone: randomPhone(),
    password: DEFAULT_PASSWORD,
    ...overrides,
  };
}
