import { type Locator, type Page } from '@playwright/test';

/**
 * Table variant of campaign (and similar) list data. Used instead of duplicating table markup per page.
 */
export class CampaignTableComponent {
  readonly table: Locator;
  readonly rows: Locator;

  constructor(private readonly page: Page) {
    this.table = page.getByRole('table');
    this.rows = this.table.getByRole('row');
  }

  rowByText(text: string | RegExp): Locator {
    return this.rows.filter({ hasText: text });
  }

  async viewDetails(rowText: string | RegExp): Promise<void> {
    await this.rowByText(rowText)
      .getByRole('button', { name: /view details/i })
      .or(this.rowByText(rowText).getByRole('link', { name: /view details/i }))
      .click();
  }

  async openRowAction(rowText: string | RegExp, action: string | RegExp): Promise<void> {
    const row = this.rowByText(rowText);
    // TODO: verify locator — Actions column may be a menu button rather than a named control
    await row.getByRole('button', { name: /actions|more/i }).click();
    await this.page.getByRole('menuitem', { name: action }).click();
  }
}
