import { type Locator, type Page } from '@playwright/test';

/**
 * Repeated status/type tab bar (campaign status, team Members/Invitations, transaction status, etc.).
 */
export class FilterTabsComponent {
  constructor(private readonly root: Page | Locator) {}

  tab(name: string | RegExp): Locator {
    // Some screens render these as tabs; others as buttons in a pill bar.
    return this.root.getByRole('tab', { name }).or(this.root.getByRole('button', { name }));
  }

  async select(name: string | RegExp): Promise<void> {
    await this.tab(name).click();
  }
}
