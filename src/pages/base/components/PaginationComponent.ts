import { type Locator, type Page } from '@playwright/test';

/**
 * Shared pagination controls used on campaign lists, team, and transactions tables.
 */
export class PaginationComponent {
  readonly previousButton: Locator;
  readonly nextButton: Locator;

  constructor(private readonly page: Page) {
    this.previousButton = page.getByRole('button', { name: /previous|prev/i });
    this.nextButton = page.getByRole('button', { name: /next/i });
  }

  pageButton(pageNumber: number): Locator {
    // TODO: verify locator — page numbers may be links rather than buttons
    return this.page.getByRole('button', { name: String(pageNumber), exact: true });
  }

  async goToPage(pageNumber: number): Promise<void> {
    await this.pageButton(pageNumber).click();
  }

  async next(): Promise<void> {
    await this.nextButton.click();
  }

  async previous(): Promise<void> {
    await this.previousButton.click();
  }
}
