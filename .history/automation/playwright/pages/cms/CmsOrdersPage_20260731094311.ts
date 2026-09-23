import type { Page, Locator } from "@playwright/test";
import { cmsOrdersLocators } from "../../locators/cms/ordersPage.locators";
import { cmsRoutes } from "../../config";

export class CmsOrdersPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(cmsRoutes.ordersHome());
  }

  get productOrdersHeading(): Locator {
    return cmsOrdersLocators.productOrdersHeading(this.page);
  }
}
