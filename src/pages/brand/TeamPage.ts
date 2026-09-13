import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { PaginationComponent } from '../base/components/PaginationComponent';
import { FilterTabsComponent } from '../shared/FilterTabsComponent';

/**
 * Brand team management.
 * Route: `/brand/team`
 */
export class TeamPage extends BasePage {
  readonly tabs: FilterTabsComponent;
  readonly inviteUserButton: Locator;
  readonly filterButton: Locator;
  readonly exportCsvButton: Locator;
  readonly table: Locator;
  readonly pagination: PaginationComponent;
  readonly inviteEmailInput: Locator;
  readonly inviteRoleInput: Locator;
  readonly sendInviteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.tabs = new FilterTabsComponent(page);
    this.inviteUserButton = page.getByRole('button', { name: /invite user/i });
    this.filterButton = page.getByRole('button', { name: /^filter$/i });
    this.exportCsvButton = page.getByRole('button', { name: /export csv/i });
    this.table = page.getByRole('table');
    this.pagination = new PaginationComponent(page);
    // TODO: verify locator — invite dialog fields not confirmed
    this.inviteEmailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    // TODO: verify locator
    this.inviteRoleInput = page.getByLabel(/role/i).or(page.getByRole('combobox', { name: /role/i }));
    // TODO: verify locator
    this.sendInviteButton = page.getByRole('button', { name: /send invite|invite|confirm/i });
  }

  async open(): Promise<void> {
    await this.goto('/brand/team');
  }

  async openMembersTab(): Promise<void> {
    await this.tabs.select(/members/i);
  }

  async openInvitationsTab(): Promise<void> {
    await this.tabs.select(/invitations/i);
  }

  async inviteUser(email: string, role: string): Promise<void> {
    await this.inviteUserButton.click();
    await this.inviteEmailInput.fill(email);
    await this.inviteRoleInput.click();
    await this.page.getByRole('option', { name: role }).click();
    await this.sendInviteButton.click();
  }

  async exportCsv(): Promise<void> {
    await this.exportCsvButton.click();
  }

  rowByEmail(email: string): Locator {
    return this.table.getByRole('row').filter({ hasText: email });
  }
}
