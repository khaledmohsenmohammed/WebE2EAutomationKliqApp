import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../../base/BasePage';
import { AccountInfoSection } from './sections/AccountInfoSection';
import { BrandInfoSection } from './sections/BrandInfoSection';
import { MembershipSection } from './sections/MembershipSection';
import { NotificationSettingsSection } from './sections/NotificationSettingsSection';
import { PasswordSecuritySection } from './sections/PasswordSecuritySection';
import { PaymentMethodsSection } from './sections/PaymentMethodsSection';
import { PrivacyPolicySection } from './sections/PrivacyPolicySection';
import { TermsOfServiceSection } from './sections/TermsOfServiceSection';

/**
 * Brand settings shell. Left sub-nav swaps one section into the DOM at a time (no URL change).
 * Route: `/brand/settings`
 */
export class BrandSettingsPage extends BasePage {
  readonly accountInfo: AccountInfoSection;
  readonly paymentMethods: PaymentMethodsSection;
  readonly brandInfo: BrandInfoSection;
  readonly passwordSecurity: PasswordSecuritySection;
  readonly notificationSettings: NotificationSettingsSection;
  readonly membership: MembershipSection;
  readonly privacyPolicy: PrivacyPolicySection;
  readonly termsOfService: TermsOfServiceSection;

  constructor(page: Page) {
    super(page);
    this.accountInfo = new AccountInfoSection(page);
    this.paymentMethods = new PaymentMethodsSection(page);
    this.brandInfo = new BrandInfoSection(page);
    this.passwordSecurity = new PasswordSecuritySection(page);
    this.notificationSettings = new NotificationSettingsSection(page);
    this.membership = new MembershipSection(page);
    this.privacyPolicy = new PrivacyPolicySection(page);
    this.termsOfService = new TermsOfServiceSection(page);
  }

  navItem(label: string | RegExp): Locator {
    return this.page.getByRole('button', { name: label }).or(
      this.page.getByRole('tab', { name: label }),
    );
  }

  async open(): Promise<void> {
    await this.goto('/brand/settings');
  }

  async openAccountInfo(): Promise<void> {
    await this.navItem(/account info/i).click();
  }

  async openPaymentMethods(): Promise<void> {
    await this.navItem(/payment methods/i).click();
  }

  async openBrandInfo(): Promise<void> {
    await this.navItem(/brand info/i).click();
  }

  async openPasswordSecurity(): Promise<void> {
    await this.navItem(/password/i).click();
  }

  async openNotificationSettings(): Promise<void> {
    await this.navItem(/notification/i).click();
  }

  async openMembership(): Promise<void> {
    await this.navItem(/membership/i).click();
  }

  async openPrivacyPolicy(): Promise<void> {
    await this.navItem('Privacy Policy').click();
  }

  async openTermsOfService(): Promise<void> {
    await this.navItem('Terms of Service').click();
  }
}
