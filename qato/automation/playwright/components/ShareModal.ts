import type { Page } from "@playwright/test";
import { shareModalLocators } from "../locators/components/shareModal.locators";

/** Reusable "Share to your friends" modal. */
export class ShareModal {
  constructor(private readonly page: Page) {}

  async clickCopyLink(): Promise<void> {
    await shareModalLocators.copyLinkButton(this.page).click();
  }

  async clickWhatsapp(): Promise<void> {
    await shareModalLocators.whatsappLink(this.page).click();
  }

  async clickTwitter(): Promise<void> {
    await shareModalLocators.twitterLink(this.page).click();
  }

  async clickTelegram(): Promise<void> {
    await shareModalLocators.telegramLink(this.page).click();
  }

  async clickCancel(): Promise<void> {
    await shareModalLocators.cancelButton(this.page).click();
  }
}
