import type { Page, Locator, Download } from "@playwright/test";
import { memberContentDetailLocators } from "../../locators/member/contentDetailPage.locators";

export class ContentDetailPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return memberContentDetailLocators.heading(this.page);
  }

  async clickGoBack(): Promise<void> {
    await memberContentDetailLocators.goBackLink(this.page).click();
  }

  /**
   * Clicks "Continue Reading", which triggers a file download, and
   * resolves once Playwright's download event fires.
   */
  async continueReadingAndDownload(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent("download");
    await memberContentDetailLocators.continueReadingLink(this.page).click();
    return downloadPromise;
  }
}
