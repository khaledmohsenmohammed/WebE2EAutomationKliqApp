import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Brand saved creator lists.
 * Route: `/brand/saved-lists`
 */
export class SavedListsPage extends BasePage {
  readonly newListButton: Locator;

  constructor(page: Page) {
    super(page);
    this.newListButton = page.getByRole('button', { name: /new list/i });
  }

  async open(): Promise<void> {
    await this.goto('/brand/saved-lists');
  }

  async createNewList(): Promise<void> {
    await this.newListButton.click();
  }

  listByName(name: string | RegExp): Locator {
    // TODO: verify locator
    return this.page.getByRole('listitem').filter({ hasText: name }).or(
      this.page.getByRole('row').filter({ hasText: name }),
    );
  }

  async openList(name: string | RegExp): Promise<void> {
    await this.listByName(name).click();
  }
}
