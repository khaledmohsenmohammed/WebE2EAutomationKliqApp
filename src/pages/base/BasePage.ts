import { expect, type Locator, type Page } from '@playwright/test';
import { ChatPanelComponent } from './components/ChatPanelComponent';
import { HeaderComponent } from './components/HeaderComponent';
import { NotificationsPanelComponent } from './components/NotificationsPanelComponent';
import { SidebarComponent } from './components/SidebarComponent';

/**
 * Shared page helpers: navigation, waits, toasts, and dialogs.
 * Logged-in screens inherit `sidebar` and `header` via composition on this class.
 */
export class BasePage {
  readonly sidebar: SidebarComponent;
  readonly header: HeaderComponent;
  readonly notificationsPanel: NotificationsPanelComponent;
  readonly chatPanel: ChatPanelComponent;

  constructor(protected readonly page: Page) {
    this.sidebar = new SidebarComponent(page);
    this.header = new HeaderComponent(page);
    this.notificationsPanel = new NotificationsPanelComponent(page);
    this.chatPanel = new ChatPanelComponent(page);
  }

  async goto(path: string): Promise<void> {
    // `waitUntil: 'load'` (the default) waits for every resource on the
    // page to finish — a hung third-party script/beacon can block that
    // forever even though the app is already interactive. DOM-ready is
    // enough; callers assert on specific locators for real readiness.
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForUrl(url: string | RegExp): Promise<void> {
    await this.page.waitForURL(url);
  }

  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Toast / snackbar container.
   * TODO: verify locator — confirm whether the app uses `alert`, `status`, or a custom region.
   */
  toast(message?: string | RegExp): Locator {
    const region = this.page.getByRole('alert').or(this.page.getByRole('status'));
    return message ? region.filter({ hasText: message }) : region;
  }

  dialog(name?: string | RegExp): Locator {
    return name
      ? this.page.getByRole('dialog', { name })
      : this.page.getByRole('dialog');
  }

  async expectToastVisible(message?: string | RegExp): Promise<void> {
    await expect(this.toast(message).first()).toBeVisible();
  }

  async expectDialogVisible(name?: string | RegExp): Promise<void> {
    await expect(this.dialog(name)).toBeVisible();
  }

  async dismissDialog(): Promise<void> {
    const dialog = this.dialog();
    await dialog.getByRole('button', { name: /close|cancel|ok|done/i }).first().click();
  }

  /**
   * "Profile Completion Required" (creator) / "Profile Incomplete" (brand)
   * banner CTA. Loose regex, no end-anchor: creator's live button text is
   * "Complete Profile", brand's is "Complete Profile Now" — "Complete
   * Profile" is a substring of both, so one locator covers both roles.
   * Confirmed live — creator: a `button`, matches this locator directly.
   */
  completeProfileButton(): Locator {
    return this.page.getByRole('button', { name: /complete profile/i });
  }

  /**
   * A promo modal ("Unlock More Campaigns & Earn Faster!") can appear on
   * first dashboard landing and — via `aria-hidden`/`inert` on the rest of
   * the page while it's open — makes the banner unreachable by role/name
   * until dismissed. Reuses `dismissDialog()`, whose generic
   * close/cancel/ok/done button regex already matches this dialog's "Close" button.
   */
  private async closeBlockingDialogIfOpen(): Promise<void> {
    if (await this.dialog().isVisible().catch(() => false)) {
      await this.dismissDialog();
    }
  }

  async expectProfileCompletionBannerVisible(): Promise<void> {
    await this.closeBlockingDialogIfOpen();
    await expect(this.completeProfileButton()).toBeVisible();
  }

  async openCompleteProfile(): Promise<void> {
    await this.closeBlockingDialogIfOpen();
    await this.completeProfileButton().click();
  }
}
