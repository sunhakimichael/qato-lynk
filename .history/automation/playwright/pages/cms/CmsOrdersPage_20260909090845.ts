import type { Page, Locator } from "@playwright/test";
import { cmsOrdersLocators } from "../../locators/cms/ordersPage.locators";
import { cmsRoutes } from "../../config";

export class CmsOrdersPage {
  constructor(private readonly page: Page) {}

  // async goto(): Promise<void> {
  //   await this.page.goto(cmsRoutes.ordersHome());
  // }

    async goto(): Promise<void> {
    // await this.page.goto(cmsRoutes.dashboard());
    const url = cmsRoutes.ordersHome();

    console.log(`Navigating to: ${url}`);

    const response = await this.page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    console.log(`Status: ${response?.status()}`);
    console.log(`Final URL: ${this.page.url()}`);
  }

  get productOrdersHeading(): Locator {
    return cmsOrdersLocators.productOrdersHeading(this.page);
  }
}
