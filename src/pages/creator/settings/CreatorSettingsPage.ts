import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../../base/BasePage';
import { AccountInfoSection } from './sections/AccountInfoSection';
import { NotificationSettingsSection } from './sections/NotificationSettingsSection';
import { PasswordSecuritySection } from './sections/PasswordSecuritySection';
import { PayoutMethodsSection } from './sections/PayoutMethodsSection';
import { PrivacyPolicySection } from './sections/PrivacyPolicySection';
import { TermsAndConditionsSection } from './sections/TermsAndConditionsSection';

/**
 * Creator settings shell. Left sub-nav swaps one section into the DOM at a time (no URL change).
 * Route: `/creator/settings`
 */
export class CreatorSettingsPage extends BasePage {
  readonly accountInfo: AccountInfoSection;
  readonly passwordSecurity: PasswordSecuritySection;
  readonly notificationSettings: NotificationSettingsSection;
  readonly payoutMethods: PayoutMethodsSection;
  readonly termsAndConditions: TermsAndConditionsSection;
  readonly privacyPolicy: PrivacyPolicySection;

  constructor(page: Page) {
    super(page);
    this.accountInfo = new AccountInfoSection(page);
    this.passwordSecurity = new PasswordSecuritySection(page);
    this.notificationSettings = new NotificationSettingsSection(page);
    this.payoutMethods = new PayoutMethodsSection(page);
    this.termsAndConditions = new TermsAndConditionsSection(page);
    this.privacyPolicy = new PrivacyPolicySection(page);
  }

  navItem(label: string | RegExp): Locator {
    return this.page.getByRole('button', { name: label }).or(
      this.page.getByRole('tab', { name: label }),
    );
  }

  async open(): Promise<void> {
    await this.goto('/creator/settings');
  }

  async openAccountInfo(): Promise<void> {
    await this.navItem(/account info/i).click();
  }

  async openPasswordSecurity(): Promise<void> {
    await this.navItem(/password/i).click();
  }

  async openNotificationSettings(): Promise<void> {
    await this.navItem(/notification/i).click();
  }

  async openPayoutMethods(): Promise<void> {
    await this.navItem(/payout methods/i).click();
  }

  async openTermsAndConditions(): Promise<void> {
    await this.navItem('Terms and Conditions').click();
  }

  async openPrivacyPolicy(): Promise<void> {
    await this.navItem('Privacy Policy').click();
  }
}
