import { type Locator, type Page } from '@playwright/test';

/**
 * Creator settings — Notification Settings section (in-place swap, no new URL).
 */
export class NotificationSettingsSection {
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /notification/i });
  }

  toggle(label: string | RegExp): Locator {
    // TODO: verify locator
    return this.page.getByRole('switch', { name: label }).or(
      this.page.getByRole('checkbox', { name: label }),
    );
  }

  async setToggle(label: string | RegExp, enabled: boolean): Promise<void> {
    const control = this.toggle(label);
    const isChecked = await control.isChecked();
    if (isChecked !== enabled) {
      await control.click();
    }
  }
}
