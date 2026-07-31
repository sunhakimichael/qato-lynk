import type { Page } from "@playwright/test";
import { cmsHomeLocators } from "../../locators/cms/homePage.locators";
import { cmsRoutes } from "../../config";

export class CmsHomePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(cmsRoutes.myLynksHome());
  }

  async clickOrdersLink(): Promise<void> {
    await cmsHomeLocators.ordersLink(this.page).click();
  }
}
