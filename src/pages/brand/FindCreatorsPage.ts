import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Brand discover-creators directory.
 * Route: `/brand/find-creators`
 */
export class FindCreatorsPage extends BasePage {
  readonly filterButton: Locator;
  readonly topCreatorsHeading: Locator;
  readonly categoryGrid: Locator;

  constructor(page: Page) {
    super(page);
    this.filterButton = page.getByRole('button', { name: /^filter$/i });
    this.topCreatorsHeading = page.getByRole('heading', { name: /top creators/i });
    // TODO: verify locator — category chips may be buttons inside a grid/list
    this.categoryGrid = page.getByRole('list').or(page.getByRole('group'));
  }

  async open(): Promise<void> {
    await this.goto('/brand/find-creators');
  }

  categoryChip(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name });
  }

  async selectCategory(name: string | RegExp): Promise<void> {
    await this.categoryChip(name).click();
  }

  async openFilters(): Promise<void> {
    await this.filterButton.click();
  }
}
