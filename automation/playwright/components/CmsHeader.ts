import type { Page, Locator } from "@playwright/test";
import { cmsHeaderLocators } from "../locators/components/cmsHeader.locators";

/** The shared page header, present on every authenticated CMS page. */
export class CmsHeader {
  constructor(private readonly page: Page) {}

  get pageTitle(): Locator {
    return cmsHeaderLocators.pageTitle(this.page);
  }

  async clickNotifications(): Promise<void> {
    await cmsHeaderLocators.notificationsLink(this.page).click();
  }

  get notificationsBadge(): Locator {
    return cmsHeaderLocators.notificationsBadge(this.page);
  }
}
