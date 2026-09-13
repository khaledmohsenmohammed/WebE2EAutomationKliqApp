import { type Locator, type Page } from '@playwright/test';

/**
 * Shared app header: search, notifications, chat, and profile menu.
 */
export class HeaderComponent {
  readonly searchInput: Locator;
  readonly notificationsBell: Locator;
  readonly chatIcon: Locator;
  readonly profileMenuButton: Locator;

  constructor(private readonly page: Page) {
    // TODO: verify locator — search placeholder/label not confirmed
    this.searchInput = page.getByPlaceholder(/search/i).or(page.getByLabel(/search/i));
    // TODO: verify locator — bell may be an icon-only button without an accessible name
    this.notificationsBell = page.getByRole('button', { name: /notifications/i });
    // TODO: verify locator — chat may be an icon-only button without an accessible name
    this.chatIcon = page.getByRole('button', { name: /chat|messages/i });
    // TODO: verify locator — profile trigger may be an avatar image or the user name
    this.profileMenuButton = page.getByRole('button', { name: /profile|account|avatar/i });
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async openNotifications(): Promise<void> {
    await this.notificationsBell.click();
  }

  async openChat(): Promise<void> {
    await this.chatIcon.click();
  }

  async openProfileMenu(): Promise<void> {
    await this.profileMenuButton.click();
  }

  async logout(): Promise<void> {
    await this.openProfileMenu();
    // TODO: verify locator
    await this.page.getByRole('menuitem', { name: /log out|sign out/i }).click();
  }
}
