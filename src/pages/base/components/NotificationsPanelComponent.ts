import { type Locator, type Page } from '@playwright/test';

/**
 * Notifications panel opened from the header bell icon.
 */
export class NotificationsPanelComponent {
  readonly panel: Locator;
  readonly emptyState: Locator;

  constructor(private readonly page: Page) {
    // TODO: verify locator — panel may be a dialog, listbox, or complementary region
    this.panel = page.getByRole('dialog', { name: /notifications/i }).or(
      page.getByRole('region', { name: /notifications/i }),
    );
    // TODO: verify locator
    this.emptyState = this.panel.getByText(/no notifications/i);
  }

  item(text: string | RegExp): Locator {
    return this.panel.getByText(text);
  }

  async openItem(text: string | RegExp): Promise<void> {
    await this.item(text).click();
  }

  async markAllRead(): Promise<void> {
    // TODO: verify locator
    await this.panel.getByRole('button', { name: /mark all as read|mark all read/i }).click();
  }
}
