import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Registration screen (brand vs creator role selection, then the matching form).
 * Route: `/register`
 */
export class RegisterPage extends BasePage {
  readonly loginLink: Locator;
  readonly brandRoleButton: Locator;
  readonly creatorsRoleButton: Locator;
  readonly googleButton: Locator;
  readonly facebookButton: Locator;
  readonly brandNameInput: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly countryCodeButton: Locator;
  readonly passwordInput: Locator;
  readonly showPasswordButton: Locator;
  readonly addProfileButton: Locator;
  readonly tiktokButton: Locator;
  readonly socialHandleInput: Locator;
  readonly termsLink: Locator;
  readonly privacyPolicyLink: Locator;
  readonly joinNowButton: Locator;

  constructor(page: Page) {
    super(page);
    this.loginLink = page.getByRole('link', { name: /login/i });
    this.brandRoleButton = page.getByRole('button', { name: /^brand$/i });
    this.creatorsRoleButton = page.getByRole('button', { name: /^creators$/i });
    this.googleButton = page.getByRole('button', { name: /sign in with google/i });
    this.facebookButton = page.getByRole('button', { name: /sign in with facebook/i });
    this.brandNameInput = page.getByPlaceholder(/enter your brand name/i);
    this.fullNameInput = page.getByPlaceholder(/enter you full name|enter your full name/i);
    this.emailInput = page.getByPlaceholder(/enter your email/i);
    this.phoneInput = page.getByPlaceholder('+966 342 423 42');
    this.countryCodeButton = page.getByRole('button', { name: '🇸🇦' });
    this.passwordInput = page.getByPlaceholder(/create a secure password/i);
    this.showPasswordButton = page.getByRole('button', { name: /show password|hide password/i });
    this.addProfileButton = page.getByRole('button', { name: /add profile/i });
    this.tiktokButton = page.getByRole('button', { name: /^tiktok$/i });
    this.socialHandleInput = page.getByPlaceholder(/@yourname or tiktok\.com\/@yourname/i);
    this.termsLink = page.getByRole('link', { name: /terms and condition of service/i });
    this.privacyPolicyLink = page.getByRole('link', { name: /privacy policy/i }).first();
    this.joinNowButton = page.getByRole('button', { name: /join now/i });
  }

  async open(): Promise<void> {
    await this.goto('/register');
  }

  async selectBrandRole(): Promise<void> {
    await this.brandRoleButton.click();
  }

  async selectCreatorRole(): Promise<void> {
    await this.creatorsRoleButton.click();
  }

  async registerBrand(input: {
    brandName: string;
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<void> {
    await this.selectBrandRole();
    await this.brandNameInput.fill(input.brandName);
    await this.fullNameInput.fill(input.fullName);
    await this.emailInput.fill(input.email);
    await this.phoneInput.fill(input.phone);
    await this.passwordInput.fill(input.password);
    await this.joinNowButton.click();
  }

  async registerCreator(input: {
    fullName: string;
    socialHandle: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<void> {
    await this.selectCreatorRole();
    await this.fullNameInput.fill(input.fullName);
    await this.socialHandleInput.fill(input.socialHandle);
    await this.emailInput.fill(input.email);
    await this.phoneInput.fill(input.phone);
    await this.passwordInput.fill(input.password);
    await this.joinNowButton.click();
  }

  async goToLogin(): Promise<void> {
    await this.loginLink.click();
  }
}
