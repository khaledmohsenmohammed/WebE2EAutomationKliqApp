import { type Locator, type Page } from '@playwright/test';

/**
 * Conversations list dropdown opened from the header chat icon.
 */
export class ChatPanelComponent {
  readonly panel: Locator;
  readonly conversationsList: Locator;
  readonly emptyState: Locator;

  constructor(private readonly page: Page) {
    // TODO: verify locator — list may be a dialog, listbox, or menu
    this.panel = page.getByRole('dialog', { name: /chat|messages|conversations/i }).or(
      page.getByRole('listbox', { name: /chat|messages|conversations/i }),
    );
    this.conversationsList = this.panel.getByRole('list').or(this.panel);
    // TODO: verify locator
    this.emptyState = this.panel.getByText(/no (messages|conversations)/i);
  }

  conversation(name: string | RegExp): Locator {
    return this.panel.getByRole('button', { name }).or(this.panel.getByText(name));
  }

  async openConversation(name: string | RegExp): Promise<void> {
    await this.conversation(name).click();
  }
}
